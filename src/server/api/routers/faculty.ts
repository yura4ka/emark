import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const facultyRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.faculty.findMany({ select: { id: true, title: true } });
  }),
  getGroups: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.group.findMany({
        where: { facultyId: input.id },
        select: { id: true, name: true },
      });
    }),
});
