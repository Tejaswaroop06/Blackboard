import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      pseudonym: string;
      isAdmin: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    pseudonym: string;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    pseudonym: string;
    isAdmin: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    CredentialsProvider({
      name: "pseudonym",
      credentials: {
        pseudonym: { label: "Pseudonym", type: "text" },
        password: { label: "Secret Key", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.pseudonym || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { pseudonym: credentials.pseudonym },
          });

          if (!user || !user.password) {
            return null;
          }

          // A user without a pseudonym cannot have a valid session
          if (!user.pseudonym) {
            return null;
          }

          // Security: Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Email not verified");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // pseudonym is guaranteed non-null by the check above
          return {
            id: user.id,
            pseudonym: user.pseudonym,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.pseudonym = user.pseudonym;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.pseudonym = token.pseudonym;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
