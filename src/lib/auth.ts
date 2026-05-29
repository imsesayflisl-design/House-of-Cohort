import NextAuth, { type Session } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  pages: { signIn: "/auth/signin" },
  trustHost: true, // Fix for CSRF token issues in development
  debug: process.env.NODE_ENV === "development",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Normalize incoming email to match registration normalization
        const email = (credentials.email as string).toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password || !user.isActive) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in - store user data in token
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.isActive = user.isActive ?? true;
      }

      // Subsequent requests - check if user is still active (but only occasionally)
      const lastCheck = token.lastCheck as number | undefined;
      const needsActiveCheck = !lastCheck || Date.now() - lastCheck > 60 * 60 * 1000; // Check every hour
      if (token.id && needsActiveCheck) {
        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true }
          });

          if (!currentUser || !currentUser.isActive) {
            // User has been deactivated, invalidate session
            return {};
          }

          // Update token with current data
          token.role = currentUser.role;
          token.isActive = currentUser.isActive;
          token.lastCheck = Date.now();
        } catch (error) {
          console.error('Error checking user status in JWT callback:', error);
          // Continue with existing token data on error
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && token.isActive) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Additional validation during sign-in
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { isActive: true }
          });

          // Block sign-in if user is not active
          if (dbUser && !dbUser.isActive) {
            console.log(`Blocked sign-in for inactive user: ${user.email}`);
            return false;
          }
        } catch (error) {
          console.error('Error during sign-in validation:', error);
          return false;
        }
      }
      return true;
    },
  },
});

export function requireStaff(session: Session | null) {
  if (!session || !["ADMIN", "STAFF"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function requireAdmin(session: Session | null) {
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
