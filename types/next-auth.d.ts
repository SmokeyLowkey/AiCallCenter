import NextAuth, { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

// Define UserRole enum to match Prisma schema
enum UserRoleEnum {
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
      teamId?: string;
      jobTitle?: string;
      department?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole | string;
    password?: string;
    teamId?: string;
    jobTitle?: string;
    department?: string;
    phoneNumber?: string;
    skills?: string[];
    profileImage?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole | string;
    teamId?: string;
    jobTitle?: string;
    department?: string;
  }
}