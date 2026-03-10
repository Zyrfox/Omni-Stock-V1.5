import { db } from "@/lib/db";
import { masterVendor } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck } from "lucide-react";

async function getVendors() {
  try {
    return await db.select().from(masterVendor);
  } catch {
    return [];
  }
}

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor & Purchase Order</h1>
        <p className="text-muted-foreground">
          Kelola pemasok dan pengadaan bahan baku
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Daftar Vendor ({vendors.length})
          </CardTitle>
          <CardDescription>
            Pemasok rekanan yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Belum ada vendor yang terdaftar.</p>
              <p className="text-sm">Data vendor dapat ditambahkan melalui migrasi atau input manual.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Vendor</TableHead>
                  <TableHead>Bahan Baku</TableHead>
                  <TableHead>No. Rekening</TableHead>
                  <TableHead>Est. Pengiriman</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.id}</TableCell>
                    <TableCell className="font-medium">{v.namaVendor}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{v.bahanBakuList || "-"}</TableCell>
                    <TableCell>{v.noRekening || "-"}</TableCell>
                    <TableCell>{v.estimasiPengiriman || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order</CardTitle>
          <CardDescription>
            Buat PO berdasarkan rekomendasi AI atau status stok Warning/Critical
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            Fitur Purchase Order akan menggunakan data dari AI Consultant Dashboard.
            Kunjungi halaman AI Consultant untuk mendapatkan rekomendasi pemesanan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
