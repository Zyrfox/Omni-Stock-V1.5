import { db } from "@/lib/db";
import { masterBahan, outlets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStockStatus, getStatusEmoji, estimateDaysUntilStockout } from "@/lib/utils";
import type { StockStatus } from "@/lib/utils";

async function getMaterials() {
  try {
    const allBahan = await db.select().from(masterBahan);
    const allOutlets = await db.select().from(outlets);
    const outletMap = new Map(allOutlets.map((o) => [o.id, o.namaOutlet]));

    return allBahan.map((b) => {
      const status = getStockStatus(b.stokSaatIni, b.stokMinimum, b.leadTimeDays, b.avgDailyConsumption);
      const daysLeft = estimateDaysUntilStockout(b.stokSaatIni, b.avgDailyConsumption);
      return {
        ...b,
        outletName: outletMap.get(b.outletId) || b.outletId,
        status,
        statusEmoji: getStatusEmoji(status),
        daysLeft,
      };
    });
  } catch {
    return [];
  }
}

function statusVariant(s: StockStatus) {
  return s === "SAFE" ? "safe" as const : s === "WARNING" ? "warning" as const : "critical" as const;
}

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bahan Baku</h1>
        <p className="text-muted-foreground">
          Katalog seluruh bahan dasar yang terdaftar di sistem
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master Bahan ({materials.length} item)</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada data bahan baku. Lakukan migrasi dari Google Sheets atau upload Excel terlebih dahulu.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead className="text-right">Lead Time</TableHead>
                  <TableHead className="text-right">Konsumsi/Hari</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Est. Hari Sisa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.id}</TableCell>
                    <TableCell className="font-medium">{m.namaBahan}</TableCell>
                    <TableCell>
                      <Badge variant={m.tipeBahan === "raw_bulk" ? "warning" : "outline"}>
                        {m.tipeBahan === "raw_bulk" ? "Raw/Bulk" : "Packaged"}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.outletName}</TableCell>
                    <TableCell className="capitalize">{m.kategoriBahan?.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-right">
                      {m.stokSaatIni} {m.satuanDapur}
                    </TableCell>
                    <TableCell className="text-right">{m.stokMinimum}</TableCell>
                    <TableCell className="text-right">{m.leadTimeDays} hari</TableCell>
                    <TableCell className="text-right">
                      {m.avgDailyConsumption} {m.satuanDapur}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(m.status)}>
                        {m.statusEmoji} {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {m.daysLeft !== null ? `${m.daysLeft} hari` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
