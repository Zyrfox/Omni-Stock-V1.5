import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { generateCustomId } from "@/lib/utils";
import bcrypt from "bcryptjs";

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
    const { email, nama, role, outletId, password } = body as {
      email: string;
      nama: string;
      role: "admin" | "manager";
      outletId?: string;
      password: string;
    };

    if (!email || !nama || !password) {
      return NextResponse.json({ error: "Email, nama, dan password wajib diisi" }, { status: 400 });
    }

    // Check for duplicate email
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const id = generateCustomId("USR", Number(count) + 1);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      id,
      email: email.toLowerCase().trim(),
      nama,
      role: role || "manager",
      passwordHash,
      mustChangePassword: true,
      outletId: outletId || null,
    });

    // Also register in Better Auth account table so they can actually log in
    // Better Auth uses the `account` table with providerId="credential"
    // We insert into the auth `user` table and `account` table
    try {
      const authDb = db as typeof db;
      // Insert into auth `user` table (Better Auth's own user)
      await authDb.execute(
        sql`INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
            VALUES (${id}, ${nama}, ${email.toLowerCase().trim()}, true, now(), now())
            ON CONFLICT (email) DO NOTHING`
      );
      // Insert into auth `account` table with hashed password
      await authDb.execute(
        sql`INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
            VALUES (${id + '-cred'}, ${email.toLowerCase().trim()}, 'credential', ${id}, ${passwordHash}, now(), now())
            ON CONFLICT DO NOTHING`
      );
    } catch {
      // If auth table insert fails (e.g., tables don't exist yet), continue — app user is still created
    }

    return NextResponse.json({ message: "User berhasil ditambahkan", id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — remove a user (kept for backward compat, use /api/users/[id] for REST)
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
