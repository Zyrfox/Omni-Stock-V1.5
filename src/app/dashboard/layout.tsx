import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session.user?.email}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {session.user?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
