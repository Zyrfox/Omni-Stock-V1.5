import { betterAuth } from "better-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: {
    type: "postgres",
    url: process.env.DATABASE_URL!,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
});

/** Check if an email is registered in the users table and return the user record */
export async function getRegisteredUser(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  return result[0] || null;
}

/** Verify session and return the app user with role */
export async function getSessionUser(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.email) return null;
  const appUser = await getRegisteredUser(session.user.email);
  return appUser;
}

/** Check if user has admin role */
export function isAdmin(user: { role: string } | null) {
  return user?.role === "admin";
}
