"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Settings,
  Users,
  ShoppingCart,
  Store,
  CreditCard,
  FileText,
  History,
  Menu,
  X,
  FolderOpen,
  Upload,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "DISCOVER",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/stores", label: "Stores", icon: Store },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      { href: "/products", label: "Products & Recipes", icon: Package },
      { href: "/category", label: "Assets & Inv.", icon: FolderOpen },
      { href: "/suppliers", label: "Suppliers", icon: Truck },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/upload-history", label: "Upload History", icon: Upload },
      { href: "/po-logs", label: "PO Logs", icon: ClipboardList },
      { href: "/delivery", label: "Delivery", icon: Truck },
      { href: "/report", label: "Report", icon: BarChart3 },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { href: "/users", label: "Users", icon: Users, adminOnly: true },
      { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
    ],
  },
];

interface SidebarProps {
  userRole?: "admin" | "manager";
  userName?: string;
  userEmail?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ userRole = "manager", userName, userEmail, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col transition-all duration-300",
        isCollapsed ? "w-[58px]" : "w-[220px]"
      )}
      style={{
        backgroundColor: "hsl(var(--surface))",
        borderRight: "1px solid hsl(var(--border))",
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 border-b px-4 py-3.5",
          isCollapsed ? "justify-center" : ""
        )}
        style={{ borderColor: "hsl(var(--border))" }}
      >
        {/* Logo */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accentD)))" }}
        >
          <span className="text-xs font-bold" style={{ color: "hsl(var(--bg))" }}>⊚</span>
        </div>

        {/* Title - only show when expanded */}
        {!isCollapsed && (
          <div>
            <p className="text-xs font-bold tracking-wide" style={{ color: "hsl(var(--text))" }}>OMNI-STOCK</p>
            <p style={{ fontSize: "9px", color: "hsl(var(--muted))" }}>Easy Going Group</p>
          </div>
        )}

        {/* Toggle Button */}
        {onToggle && !isCollapsed && (
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 transition-colors hover:bg-slate-800"
            style={{ color: "hsl(var(--muted))" }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {onToggle && isCollapsed && (
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 transition-colors hover:bg-slate-800"
            style={{ color: "hsl(var(--muted))" }}
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || userRole === "admin"
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label} className="mb-2">
              {/* Section Label */}
              {!isCollapsed && (
                <p
                  className="mb-1 px-3 pt-3 pb-1"
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: "#374151",
                    fontWeight: 600,
                  }}
                >
                  {section.label}
                </p>
              )}

              {/* Nav Items */}
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                      isCollapsed && "justify-center px-2.5"
                    )}
                    style={{
                      color: isActive ? "hsl(var(--accent))" : "hsl(var(--muted))",
                      backgroundColor: isActive ? "rgba(200,241,53,0.07)" : "transparent",
                      borderLeft: isActive ? "3px solid hsl(var(--accent))" : "3px solid transparent",
                      fontWeight: isActive ? 500 : 400,
                      padding: isCollapsed ? "10px 0" : "8px 14px",
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />

                    {!isCollapsed && (
                      <>
                        <span className="flex-1" style={{ fontSize: "13px" }}>{item.label}</span>
                        {item.adminOnly && (
                          <span
                            style={{
                              fontSize: "8px",
                              fontWeight: 700,
                              padding: "1px 4px",
                              borderRadius: "3px",
                              backgroundColor: "hsl(var(--accent))",
                              color: "hsl(var(--bg))",
                            }}
                          >
                            A
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Pill - Bottom */}
      <div className="border-t p-2" style={{ borderColor: "hsl(var(--border))" }}>
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5",
            isCollapsed && "justify-center px-2.5"
          )}
          style={{ backgroundColor: "hsl(var(--card))" }}
        >
          {/* Avatar */}
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accentD)))",
              color: "hsl(var(--bg))",
            }}
          >
            {(userName || (userRole === "admin" ? "A" : "M")).charAt(0).toUpperCase()}
          </div>

          {/* User Info - only show when expanded */}
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold" style={{ color: "hsl(var(--text))" }}>
                {userName || (userRole === "admin" ? "Admin" : "Manager")}
              </p>
              <p className="truncate" style={{ fontSize: "9px", color: "hsl(var(--muted))" }}>
                {userEmail || (userRole === "admin" ? "admin@easygoing.com" : "manager@easygoing.com")}
              </p>
              <span
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: "3px",
                  backgroundColor: userRole === "admin" ? "rgba(200,241,53,0.2)" : "rgba(96,165,250,0.2)",
                  color: userRole === "admin" ? "hsl(var(--accent))" : "hsl(var(--blue))",
                }}
              >
                {userRole.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
