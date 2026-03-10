import { db } from "@/lib/db";
import { masterVendor, vendorBahan, masterBahan } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";

async function getVendorsWithBahan() {
  try {
    const vendors = await db.select().from(masterVendor);
    const vb = await db.select().from(vendorBahan);
    const bahan = await db.select().from(masterBahan);
    const bahanMap = new Map(bahan.map((b) => [b.id, b.namaBahan]));

    return vendors.map((v) => {
      const items = vb
        .filter((r) => r.vendorId === v.id)
        .map((r) => ({
          bahanId: r.bahanId,
          bahanName: bahanMap.get(r.bahanId) || r.bahanId,
          harga: r.hargaPerSatuan,
          isPrimary: r.isPrimary,
        }));
      return { ...v, items };
    });
  } catch {
    return [];
  }
}

export default async function VendorsPage() {
  const vendors = await getVendorsWithBahan();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Vendor</h1>
        <p className="text-muted-foreground">
          Kelola pemasok bahan baku dan relasi supply
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Daftar Vendor ({vendors.length})
          </CardTitle>
          <CardDescription>
            Pemasok rekanan dan bahan yang disupply
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Belum ada vendor yang terdaftar.</p>
              <p className="text-sm">Data vendor dapat ditambahkan melalui input manual.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Vendor</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>No. Rekening</TableHead>
                  <TableHead className="text-right">Lead Time</TableHead>
                  <TableHead>Bahan yang Disupply</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.id}</TableCell>
                    <TableCell className="font-medium">{v.namaVendor}</TableCell>
                    <TableCell>{v.kontak || "-"}</TableCell>
                    <TableCell>{v.noRekening || "-"}</TableCell>
                    <TableCell className="text-right">{v.estimasiPengiriman} hari</TableCell>
                    <TableCell>
                      {v.items.length === 0 ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {v.items.map((item) => (
                            <Badge key={item.bahanId} variant={item.isPrimary ? "default" : "outline"} className="text-xs">
                              {item.bahanName}
                            </Badge>
                          ))}
                        </div>
                      )}
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
