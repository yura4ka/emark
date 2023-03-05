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
      z.object({ id: z.number().positive().int(), newName: z.string().trim().min(1) })
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
  create: adminProcedure
    .input(z.string().trim().min(1))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.faculty.create({ data: { title: input.trim() } });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") throw new TRPCError({ code: "CONFLICT" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getById: publicProcedure.input(z.number().positive()).query(({ ctx, input }) => {
    return ctx.prisma.faculty.findUnique({ where: { id: input } });
  }),
  getGroupsFull: adminProcedure
    .input(z.number().int().positive())
    .query(({ ctx, input }) => {
      return ctx.prisma.group.findMany({
        where: { facultyId: input },
        select: {
          id: true,
          name: true,
          students: { select: { id: true, name: true } },
          senior: { select: { id: true, name: true } },
          handler: { select: { id: true, name: true } },
        },
        orderBy: { name: "asc" },
      });
    }),
});
