import { auth, getSessionUser } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const appUser = await getSessionUser(await headers());
  if (!appUser) redirect("/login?error=unregistered");

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userRole={appUser.role} />
      <main className="ml-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
          <div />
          <div className="flex items-center gap-3">
            <Badge variant={appUser.role === "admin" ? "default" : "secondary"}>
              {appUser.role}
            </Badge>
            <span className="text-sm text-muted-foreground">{appUser.email}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {appUser.nama?.charAt(0) || "U"}
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
