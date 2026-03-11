import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, isAdmin } from "@/lib/auth";

// DELETE — remove a user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser || !isAdmin(appUser)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });

    // Prevent self-deletion
    if (id === appUser.id) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
