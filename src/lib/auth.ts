import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          console.log("Attempting login for:", credentials.username);
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user) {
            console.error("User not found in DB:", credentials.username);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error("Invalid password for:", credentials.username);
            return null;
          }
          
          console.log("Login successful for:", credentials.username);

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          division: user.division,
        };
        } catch (error) {
          console.error("Auth Exception:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.division = user.division;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.division = token.division;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
