import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { generateCustomId } from "@/lib/utils";

// GET — list all users
export async function GET(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser || !isAdmin(appUser)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    const allUsers = await db.select().from(users);
    return NextResponse.json({ data: allUsers });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST — add a new user
export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser || !isAdmin(appUser)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { email, nama, role } = body as { email: string; nama: string; role: "admin" | "manager" };

    if (!email || !nama) {
      return NextResponse.json({ error: "Email dan nama wajib diisi" }, { status: 400 });
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const id = generateCustomId("USR", Number(count) + 1);

    await db.insert(users).values({
      id,
      email: email.toLowerCase().trim(),
      nama,
      role: role || "manager",
    });

    return NextResponse.json({ message: "User berhasil ditambahkan", id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — remove a user
export async function DELETE(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser || !isAdmin(appUser)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });

    // Prevent self-deletion
    if (id === appUser.id) {
      return NextResponse.json({ error: "Tidak bisa menghapus diri sendiri" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ message: "User dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
