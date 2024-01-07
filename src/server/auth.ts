import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { prisma } from "./db";
import Credentials from "next-auth/providers/credentials";
import type { Teacher } from ".prisma/client";
import * as argon2 from "argon2";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/

interface Role {
  isStudent?: boolean;
  isTeacher?: boolean;
  isSenior?: boolean;
  isHandler?: boolean;
  isAdmin?: boolean;
}

declare module "next-auth" {
  interface User {
    id: number;
    email: string;
    name: string;
    isConfirmed: boolean;
    isRequested: boolean;
    role: Role;
    image: null;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    name: string;
    isConfirmed: boolean;
    isRequested: boolean;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
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
          include: { seniorOf: { select: { id: true } } },
        });

        let teacher:
          | (Teacher & {
              handlerOf: {
                id: number;
              } | null;
            })
          | null = null;

        if (!student) {
          teacher = await prisma.teacher.findFirst({
            where: { email: credentials?.email },
            include: { handlerOf: { select: { id: true } } },
          });
        }

        const user = student || teacher;
        if (!user) return null;
        if (!user.password) return null;

        if (!(await argon2.verify(user.password, credentials.password))) return null;

        const toReturn = {
          id: user.id,
          email: user.email,
          name: user.name,
          isConfirmed: user.isConfirmed,
          isRequested: user.isRequested,
          role: {
            isStudent: !!student,
            isTeacher: !!teacher,
            isSenior: !!student?.seniorOf,
            isHandler: !!teacher?.handlerOf,
            isAdmin: teacher?.isAdmin,
          },
          image: null,
        };

        return toReturn;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token = { ...token, ...user, id: +user.id };
        return token;
      }

      const student = await prisma.student.findFirst({
        where: { id: token.id, email: token.email },
        include: { seniorOf: { select: { id: true } } },
      });

      let teacher:
        | (Teacher & {
            handlerOf: {
              id: number;
            } | null;
          })
        | null = null;

      if (!student) {
        teacher = await prisma.teacher.findFirstOrThrow({
          where: { id: token.id, email: token.email },
          include: { handlerOf: { select: { id: true } } },
        });
      }

      const dbUser = student || teacher;
      if (!dbUser) return token;
      if (dbUser.isRequested || !dbUser.isConfirmed) throw "not confirmed";

      token.email = dbUser.email;
      token.name = dbUser.name;
      token.role = {
        isStudent: !!student,
        isTeacher: !!teacher,
        isSenior: !!student?.seniorOf,
        isHandler: !!teacher?.handlerOf,
        isAdmin: !!teacher?.isAdmin,
      };

      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user = { ...session.user, ...token };
      }
      return session;
    },
    signIn: ({ user }) => {
      if (user.isRequested && !user.isConfirmed) return false;
      return true;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    newUser: "/auth/sign-up",
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

export const requireStudentAuth =
  (func: GetServerSideProps) => async (ctx: GetServerSidePropsContext) => {
    const session = await getServerAuthSession(ctx);
    if (!session || session.user.role.isStudent)
      return { redirect: { destination: "/", permanent: false } };
    return await func(ctx);
  };
