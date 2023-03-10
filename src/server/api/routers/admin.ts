import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { validId } from "../../../utils/schemas";

export const adminRouter = createTRPCRouter({
  confirmStudent: adminProcedure.input(validId).mutation(async ({ ctx, input }) => {
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
        studentId: validId,
        groupId: validId,
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

  resetStudentPassword: adminProcedure.input(validId).mutation(async ({ ctx, input }) => {
    await ctx.prisma.student.update({
      where: { id: input },
      data: { password: null, isConfirmed: false, isRequested: false },
    });
    return true;
  }),
});
