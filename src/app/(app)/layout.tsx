import { auth, getSessionUser } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ShellLayout } from "@/components/shell-layout";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const appUser = await getSessionUser(await headers());
  if (!appUser) redirect("/login?error=unregistered");
  return <ShellLayout userRole={appUser.role}>{children}</ShellLayout>;
}
