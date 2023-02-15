import { TRPCError } from "@trpc/server";
import { adminProcedure } from "./../trpc";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { Prisma } from "@prisma/client";

export const facultyRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.faculty.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  }),
  getGroups: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.group.findMany({
        where: { facultyId: input.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
    }),
  rename: adminProcedure
    .input(
      z.object({ id: z.number().positive().int(), newName: z.string().trim() })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.faculty.update({
          where: { id: input.id },
          data: { title: input.newName.trim() },
          select: { id: true },
        });
        return true;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") throw new TRPCError({ code: "CONFLICT" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
