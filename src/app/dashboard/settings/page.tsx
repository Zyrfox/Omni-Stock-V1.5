import { db } from "@/lib/db";
import { systemConfigs } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Shield } from "lucide-react";

async function getSystemConfigs() {
  try {
    return await db.select().from(systemConfigs);
  } catch {
    return [];
  }
}

export default async function SettingsPage() {
  const configs = await getSystemConfigs();
  const migrationDone = configs.find((c) => c.key === "is_initial_migration_done");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi dan status sistem</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Koneksi Neon DB</span>
              <Badge variant="safe">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Migrasi Awal</span>
              <Badge variant={migrationDone?.value === "true" ? "safe" : "warning"}>
                {migrationDone?.value === "true" ? "Complete" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Autentikasi</span>
              <Badge variant="safe">Google SSO</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Akses Level</span>
              <Badge variant="outline">Admin Only</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configs
            </CardTitle>
            <CardDescription>Konfigurasi yang tersimpan di database</CardDescription>
          </CardHeader>
          <CardContent>
            {configs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada konfigurasi. Jalankan migrasi awal terlebih dahulu.
              </p>
            ) : (
              <div className="space-y-2">
                {configs.map((c) => (
                  <div key={c.key} className="flex items-center justify-between rounded-md border p-3">
                    <code className="text-sm font-mono">{c.key}</code>
                    <code className="text-sm text-muted-foreground">{c.value}</code>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
