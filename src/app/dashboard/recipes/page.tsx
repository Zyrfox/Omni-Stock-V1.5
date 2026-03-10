import { db } from "@/lib/db";
import { masterMenu, mappingResep, masterBahan } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChefHat } from "lucide-react";

async function getMenusWithRecipes() {
  try {
    const menus = await db.select().from(masterMenu);
    const recipes = await db.select().from(mappingResep);
    const bahan = await db.select().from(masterBahan);

    const bahanMap = new Map(bahan.map((b) => [b.id, b.namaBahan]));

    return menus.map((menu) => {
      const menuRecipes = recipes
        .filter((r) => r.parentId === menu.id)
        .map((r) => ({
          ...r,
          itemName: bahanMap.get(r.itemId) || r.itemId,
        }));
      return { ...menu, recipes: menuRecipes };
    });
  } catch {
    return [];
  }
}

export default async function RecipesPage() {
  const menus = await getMenusWithRecipes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resep & Formula</h1>
        <p className="text-muted-foreground">
          Mapping antara menu jual dan komponen bahan bakunya
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Master Menu ({menus.length})
          </CardTitle>
          <CardDescription>
            Daftar menu jual beserta komposisi resep
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menus.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Belum ada data menu.</p>
              <p className="text-sm">
                Data menu dapat ditambahkan melalui migrasi atau input manual.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Menu</TableHead>
                  <TableHead>Nama Menu</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="text-right">COGS</TableHead>
                  <TableHead>Komponen Resep</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell className="font-mono text-xs">{menu.id}</TableCell>
                    <TableCell className="font-medium">{menu.namaMenu}</TableCell>
                    <TableCell className="text-right">
                      Rp {menu.hargaJual?.toLocaleString("id-ID") || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {menu.totalCogs?.toLocaleString("id-ID") || 0}
                    </TableCell>
                    <TableCell>
                      {menu.recipes.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Belum ada resep</span>
                      ) : (
                        <ul className="space-y-1">
                          {menu.recipes.map((r) => (
                            <li key={r.id} className="text-xs">
                              <span className="font-medium">{r.itemName}</span>
                              <span className="text-muted-foreground"> x{r.qty}</span>
                            </li>
                          ))}
                        </ul>
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
