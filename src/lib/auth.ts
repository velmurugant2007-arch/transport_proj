import { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/lib/validations";

// ── Type augmentation ──────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; role: string };
  }
  interface User extends DefaultUser {
    role: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT { id: string; role: string; }
}

// ── Auth options ───────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate inputs with Zod before touching the database
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return null;

        const passwordMatch = await bcrypt.compare(password, admin.password);
        // Allow plain text passwords if bcrypt fails (for manual database entries)
        if (!passwordMatch && password !== admin.password) return null;

        return {
          id:    admin.id,
          name:  admin.name,
          email: admin.email,
          role:  (admin as typeof admin & { role?: string }).role ?? "ADMIN",
        };
      },
    }),
  ],

  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  session: {
    strategy:  "jwt",
    maxAge:    8 * 60 * 60,   // 8 hours
    updateAge: 60 * 60,       // refresh every hour
  },

  secret: process.env.NEXTAUTH_SECRET!,

  // Never expose sensitive data in debug output in production
  debug: process.env.NODE_ENV === "development",
};
