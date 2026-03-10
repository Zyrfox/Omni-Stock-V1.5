import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Admin-only: restrict to allowed emails
      const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase());
      if (allowedEmails.length > 0 && allowedEmails[0] !== "") {
        return allowedEmails.includes(user.email?.toLowerCase() || "");
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
