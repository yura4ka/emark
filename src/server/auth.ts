import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import Credentials from "next-auth/providers/credentials";
import type { Teacher } from ".prisma/client";
import type { DefaultJWT } from "next-auth/jwt";
import * as argon2 from "argon2";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      email: string;
      isTeacher: boolean;
    };
  }

  interface User {
    id: number;
    email: string;
    isTeacher: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown>, DefaultJWT {
    id: number;
    email: string;
    isTeacher: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;

        const student = await prisma.student.findFirst({
          where: { email: credentials.email },
        });

        let teacher: Teacher | null = null;

        if (!student) {
          teacher = await prisma.teacher.findFirst({
            where: { email: credentials?.email },
          });
        }

        const user = student || teacher;
        if (!user) return null;
        if (!user.isConfirmed || user.isRequested || !user.password)
          return null;

        if (!(await argon2.verify(user.password, credentials.password)))
          return null;

        return {
          id: user.id,
          email: user.email,
          isTeacher: !!teacher,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = +user.id;
        token.email = user.email;
        token.isTeacher = user.isTeacher;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.isTeacher = token.isTeacher;
      }

      return session;
    },
  },
  pages: {
    signIn: "sign-in",
    newUser: "sign-up",
  },
  jwt: {
    maxAge: 15 * 24 * 60 * 60,
  },
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
