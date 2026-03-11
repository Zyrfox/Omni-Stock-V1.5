"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface ShellLayoutProps {
  userRole?: "admin" | "manager";
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
}

export function ShellLayout({ userRole = "manager", userName, userEmail, children }: ShellLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--bg))" }}>
      <Sidebar 
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <Topbar 
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content */}
      <main 
        className="pt-[52px]"
        style={{ 
          marginLeft: sidebarCollapsed ? "58px" : "220px",
          transition: "margin-left 0.3s ease"
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
