import NextAuth, { DefaultSession } from "next-auth";

// Define UserRole enum to match Prisma schema
enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  MANAGER = "MANAGER"
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole | string;
    password?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole | string;
  }
}