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
  Store,
  CreditCard,
  Car,
  FileText,
  History,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  badge?: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products & Recipes", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/po-logs", label: "PO Logs", icon: ShoppingCart },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/category", label: "Assets", icon: Package },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/delivery", label: "Delivery", icon: Car },
  { href: "/report", label: "Report", icon: FileText },
  { href: "/upload-history", label: "Upload History", icon: History },
  { href: "/users", label: "Users", icon: Users, adminOnly: true, badge: "Admin" },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true, badge: "Admin" },
];

interface SidebarProps {
  userRole?: "admin" | "manager";
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ userRole = "manager", isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => !item.adminOnly || userRole === "admin");

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col transition-all duration-300",
        isCollapsed ? "w-[58px]" : "w-[220px]"
      )}
      style={{ 
        backgroundColor: "hsl(var(--surface))",
        borderRight: "1px solid hsl(var(--border))"
      }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 border-b px-4 py-3.5",
        isCollapsed ? "justify-center" : ""
      )} style={{ borderColor: "hsl(var(--border))" }}>
        {/* Logo */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accentD)))" }}>
          <span className="text-sm font-bold" style={{ color: "hsl(var(--bg))" }}>OS</span>
        </div>
        
        {/* Title - only show when expanded */}
        {!isCollapsed && (
          <div>
            <p className="text-sm font-semibold" style={{ color: "hsl(var(--text))" }}>Omni-Stock</p>
            <p className="text-[10px]" style={{ color: "hsl(var(--muted))" }}>V1.5 Predictive</p>
          </div>
        )}

        {/* Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 transition-colors hover:bg-slate-800"
            style={{ color: "hsl(var(--muted))" }}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isCollapsed && "justify-center px-2.5",
                isActive 
                  ? "font-medium" 
                  : "font-normal"
              )}
              style={{
                color: isActive ? "hsl(var(--accent))" : "hsl(var(--muted))",
                backgroundColor: isActive ? "rgba(200,241,53,0.12)" : "transparent",
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-accent")} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span 
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: "hsl(var(--accent))",
                        color: "hsl(var(--bg))"
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Pill - Bottom */}
      <div className="border-t p-2" style={{ borderColor: "hsl(var(--border))" }}>
        <div className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5",
          isCollapsed && "justify-center px-2.5"
        )} style={{ backgroundColor: "hsl(var(--card))" }}>
          {/* Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" 
               style={{ backgroundColor: "hsl(var(--accent))", color: "hsl(var(--bg))" }}>
            {userRole === "admin" ? "A" : "M"}
          </div>
          
          {/* User Info - only show when expanded */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium" style={{ color: "hsl(var(--text))" }}>
                {userRole === "admin" ? "Admin User" : "Manager User"}
              </p>
              <p className="truncate text-[10px]" style={{ color: "hsl(var(--muted))" }}>
                {userRole === "admin" ? "Administrator" : "Outlet Manager"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
