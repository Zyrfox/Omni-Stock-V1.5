"use client";

import { useState } from "react";
import { Search, Bell, Moon, Sun, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export function Topbar({ onSidebarToggle, sidebarCollapsed }: TopbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-30 flex h-[52px] items-center justify-between border-b"
      style={{ 
        backgroundColor: "hsl(var(--surface))",
        borderColor: "hsl(var(--border))",
        paddingLeft: sidebarCollapsed ? "58px" : "220px",
        transition: "padding-left 0.3s ease"
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 px-6">
        {/* Mobile Menu Toggle */}
        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="rounded-lg p-2 transition-colors md:hidden"
            style={{ color: "hsl(var(--muted))" }}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* AI Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4" style={{ color: "hsl(var(--muted))" }} />
          </div>
          <input
            type="text"
            placeholder="AI Search..."
            className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm transition-colors focus:outline-none"
            style={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border2))",
              color: "hsl(var(--text))",
            }}
            onFocus={(e) => e.target.style.borderColor = "hsl(var(--accent))"}
            onBlur={(e) => e.target.style.borderColor = "hsl(var(--border2))"}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 px-6">
        {/* Notifications */}
        <button className="relative rounded-lg p-2.5 transition-colors hover:opacity-80" style={{ color: "hsl(var(--muted))" }}>
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(var(--accent))" }} />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-lg p-2.5 transition-colors hover:opacity-80"
          style={{ color: "hsl(var(--muted))" }}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* User Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" 
             style={{ backgroundColor: "hsl(var(--accent))", color: "hsl(var(--bg))" }}>
          U
        </div>
      </div>
    </header>
  );
}
