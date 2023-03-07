import { adminProcedure, publicProcedure } from "./../trpc";
import { createTRPCRouter } from "../trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const subjectRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.subject.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  }),
  create: adminProcedure
    .input(z.string().trim().min(1))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.subject.create({ data: { title: input.trim() } });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") throw new TRPCError({ code: "CONFLICT" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return true;
    }),
  update: adminProcedure
    .input(z.object({ id: z.number().positive().int(), title: z.string().trim().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.subject.update({
          where: { id: input.id },
          data: { title: input.title.trim() },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") throw new TRPCError({ code: "CONFLICT" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return true;
    }),
});
