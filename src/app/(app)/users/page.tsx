export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { users, outlets } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const appUser = await getSessionUser(await headers());
  if (!appUser || appUser.role !== "admin") redirect("/dashboard");

  const userList = await db
    .select({
      id: users.id,
      email: users.email,
      nama: users.nama,
      role: users.role,
      outletId: users.outletId,
      createdAt: users.createdAt,
      mustChangePassword: users.mustChangePassword,
    })
    .from(users);

  const [totalUsers] = await db.select({ c: count() }).from(users);
  const [adminCount] = await db.select({ c: count() }).from(users).where(eq(users.role, "admin"));
  const [managerCount] = await db.select({ c: count() }).from(users).where(eq(users.role, "manager"));

  const outletList = await db.select().from(outlets);
  const outletMap = Object.fromEntries(outletList.map((o) => [o.id, o.namaOutlet]));

  return (
    <UsersClient
      currentUserId={appUser.id}
      userList={userList.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      totalUsers={totalUsers.c}
      adminCount={adminCount.c}
      managerCount={managerCount.c}
      outletMap={outletMap}
      outlets={outletList}
    />
  );
}
