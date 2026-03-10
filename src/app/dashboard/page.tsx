import { db } from "@/lib/db";
import { systemConfigs, masterBahan, outlets } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MigrationCard } from "@/components/migration-card";
import { Package, Store, AlertTriangle, CheckCircle } from "lucide-react";
import { getStockStatus } from "@/lib/utils";

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
    const allBahan = await db.select().from(masterBahan);

    let safe = 0, warning = 0, critical = 0;
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
      safe,
      warning,
      critical,
    };
  } catch {
    return { totalOutlets: 0, totalBahan: 0, safe: 0, warning: 0, critical: 0 };
  }
}

export default async function DashboardPage() {
  const [isMigrationDone, stats] = await Promise.all([getMigrationStatus(), getStats()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Omni-Stock V1.5 — The Predictive Watchdog
        </p>
      </div>

      <MigrationCard isMigrationDone={isMigrationDone} />

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
    </div>
  );
}
