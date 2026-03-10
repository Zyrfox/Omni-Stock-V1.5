"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Package,
  ChefHat,
  Truck,
  Brain,
  Settings,
  LogOut,
  Users,
  ShoppingCart,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Upload Pawoon", icon: Upload },
  { href: "/dashboard/materials", label: "Bahan Baku", icon: Package, adminOnly: true },
  { href: "/dashboard/recipes", label: "Resep / Formula", icon: ChefHat, adminOnly: true },
  { href: "/dashboard/vendors", label: "Vendor", icon: Truck, adminOnly: true },
  { href: "/dashboard/purchase-orders", label: "Purchase Order", icon: ShoppingCart },
  { href: "/dashboard/ai-consultant", label: "AI Consultant", icon: Brain },
  { href: "/dashboard/users", label: "Manajemen User", icon: Users, adminOnly: true },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar({ userRole }: { userRole: "admin" | "manager" }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => !item.adminOnly || userRole === "admin");

  const handleSignOut = async () => {
    await signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-slate-900 text-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold">
          OS
        </div>
        <div>
          <p className="text-sm font-semibold">Omni-Stock</p>
          <p className="text-[10px] text-slate-400">V1.5 Predictive Watchdog</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
