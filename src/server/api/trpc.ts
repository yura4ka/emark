import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "../auth";
import { prisma } from "../db";

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const requireStudent = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user.isConfirmed || !ctx.session.user.role.isStudent) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const requireSenior = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user.role.isSenior) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const requireTeacher = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user.isConfirmed || !ctx.session.user.role.isTeacher) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const requireAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user.role.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const userProcedure = t.procedure.use(requireStudent);
export const teacherProcedure = t.procedure.use(requireTeacher);
export const seniorProcedure = userProcedure.use(requireSenior);
export const adminProcedure = teacherProcedure.use(requireAdmin);
