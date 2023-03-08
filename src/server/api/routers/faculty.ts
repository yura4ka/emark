import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validId, validString } from "../../../utils/schemas";

export const facultyRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.faculty.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  }),
  getGroups: publicProcedure.input(z.object({ id: validId })).query(({ ctx, input }) => {
    return ctx.prisma.group.findMany({
      where: { facultyId: input.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }),
  rename: adminProcedure
    .input(z.object({ id: validId, newName: validString }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.faculty.update({
        where: { id: input.id },
        data: { title: input.newName.trim() },
        select: { id: true },
      });

      return true;
    }),
  create: adminProcedure.input(validString).mutation(async ({ ctx, input }) => {
    await ctx.prisma.faculty.create({ data: { title: input.trim() } });
    return true;
  }),
  getById: publicProcedure.input(validId).query(({ ctx, input }) => {
    return ctx.prisma.faculty.findUnique({ where: { id: input } });
  }),
  getGroupsFull: adminProcedure.input(validId).query(({ ctx, input }) => {
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
