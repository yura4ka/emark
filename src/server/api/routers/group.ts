import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const groupRouter = createTRPCRouter({
  getFreeStudents: publicProcedure
    .input(z.object({ id: z.number().positive().int() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.student.findMany({
        where: {
          groupId: input.id,
          isConfirmed: false,
          isRequested: false,
        },
        select: {
          id: true,
          name: true,
        },
      });
    }),
});
