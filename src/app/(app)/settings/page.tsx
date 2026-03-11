export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { systemConfigs } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const appUser = await getSessionUser(await headers());
  if (!appUser || appUser.role !== "admin") redirect("/dashboard");

  const migrationConfig = await db
    .select()
    .from(systemConfigs)
    .where(eq(systemConfigs.key, "is_initial_migration_done"));

  const isMigrationDone = migrationConfig[0]?.value === "true";

  return (
    <SettingsClient isMigrationDone={isMigrationDone} />
  );
}
