import { validString, validId } from "./../../../utils/schemas";
import { adminProcedure, publicProcedure } from "./../trpc";
import { createTRPCRouter } from "../trpc";
import { z } from "zod";

export const subjectRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.subject.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  }),
  create: adminProcedure.input(validString).mutation(async ({ ctx, input }) => {
    await ctx.prisma.subject.create({ data: { title: input.trim() } });
    return true;
  }),
  update: adminProcedure
    .input(z.object({ id: validId, title: validString }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.subject.update({
        where: { id: input.id },
        data: { title: input.title.trim() },
      });

      return true;
    }),
  delete: adminProcedure.input(validId).mutation(async ({ ctx, input: id }) => {
    await ctx.prisma.subject.delete({ where: { id } });
    return true;
  }),
});
