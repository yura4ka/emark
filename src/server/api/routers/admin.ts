import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  confirmStudent: adminProcedure
    .input(z.number().positive().int())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.student.findFirstOrThrow({
        where: {
          id: input,
          isRequested: true,
          isConfirmed: false,
        },
      });

      await ctx.prisma.student.update({
        data: { isRequested: false, isConfirmed: true },
        where: { id: input },
      });

      return true;
    }),

  assignSenior: adminProcedure
    .input(
      z.object({
        studentId: z.number().positive().int(),
        groupId: z.number().positive().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.student.findFirstOrThrow({
        where: { groupId: input.groupId, id: input.studentId },
      });

      return ctx.prisma.group.update({
        where: { id: input.groupId },
        data: { seniorId: input.studentId },
      });
    }),
});
