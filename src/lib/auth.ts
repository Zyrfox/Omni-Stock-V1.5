import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import * as authSchema from "@/lib/db/auth-schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days per PRD
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
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
