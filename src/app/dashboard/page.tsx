import { db } from "@/lib/db";
import { systemConfigs, masterBahan, outlets, purchaseOrders, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MigrationCard } from "@/components/migration-card";
import { Package, Store, AlertTriangle, CheckCircle, ShoppingCart, Users } from "lucide-react";
import { getStockStatus } from "@/lib/utils";
import { headers } from "next/headers";
import { getSessionUser, isAdmin } from "@/lib/auth";

async function getMigrationStatus(): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(systemConfigs)
      .where(eq(systemConfigs.key, "is_initial_migration_done"));
    return result.length > 0 && result[0].value === "true";
  } catch {
    return false;
  }
}

async function getStats() {
  try {
    const [outletCount] = await db.select({ count: count() }).from(outlets);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [poCount] = await db
      .select({ count: count() })
      .from(purchaseOrders)
      .where(eq(purchaseOrders.status, "draft"));
    const allBahan = await db.select().from(masterBahan);

    let safe = 0,
      warning = 0,
      critical = 0;
    for (const bahan of allBahan) {
      const status = getStockStatus(
        bahan.stokSaatIni,
        bahan.stokMinimum,
        bahan.leadTimeDays,
        bahan.avgDailyConsumption
      );
      if (status === "SAFE") safe++;
      else if (status === "WARNING") warning++;
      else critical++;
    }

    return {
      totalOutlets: outletCount.count,
      totalBahan: allBahan.length,
      totalUsers: userCount.count,
      draftPOs: poCount.count,
      safe,
      warning,
      critical,
    };
  } catch {
    return { totalOutlets: 0, totalBahan: 0, totalUsers: 0, draftPOs: 0, safe: 0, warning: 0, critical: 0 };
  }
}

export default async function DashboardPage() {
  const appUser = await getSessionUser(await headers());
  const userIsAdmin = isAdmin(appUser);
  const [isMigrationDone, stats] = await Promise.all([getMigrationStatus(), getStats()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Omni-Stock V1.5 — The Predictive Watchdog
        </p>
      </div>

      {userIsAdmin && <MigrationCard isMigrationDone={isMigrationDone} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outlet</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutlets}</div>
            <p className="text-xs text-muted-foreground">Cabang terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bahan Baku</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBahan}</div>
            <p className="text-xs text-muted-foreground">Item terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Safe</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.safe}</div>
            <p className="text-xs text-muted-foreground">Stok aman</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Warning & Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.warning + stats.critical}</div>
            <p className="text-xs text-muted-foreground">
              {stats.warning} warning, {stats.critical} critical
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft PO</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftPOs}</div>
            <p className="text-xs text-muted-foreground">Menunggu dikirim</p>
          </CardContent>
        </Card>

        {userIsAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total User</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
