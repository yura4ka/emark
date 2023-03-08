import { TRPCError } from "@trpc/server";
import { prisma } from "./../../db";
import { createTRPCRouter, seniorProcedure } from "../trpc";
import { validId } from "../../../utils/schemas";

export const seniorRouter = createTRPCRouter({
  confirmStudent: seniorProcedure.input(validId).mutation(async ({ ctx, input }) => {
    const { id: groupId } = await ctx.prisma.group.findUniqueOrThrow({
      where: { seniorId: ctx.session.user.id },
      select: { id: true },
    });
    await ctx.prisma.student.findFirstOrThrow({
      where: {
        id: input,
        groupId,
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
  resetStudentPassword: seniorProcedure
    .input(validId)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input) throw new TRPCError({ code: "BAD_REQUEST" });

      const { id: groupId } = await ctx.prisma.group.findUniqueOrThrow({
        where: { seniorId: ctx.session.user.id },
      });

      await prisma.student.findFirstOrThrow({ where: { id: input, groupId } });
      await prisma.student.update({
        where: { id: input },
        data: { isRequested: false, isConfirmed: false, password: null },
      });

      return true;
    }),

  getClassList: seniorProcedure.query(({ ctx }) => {
    return ctx.prisma.group.findFirst({
      where: { seniorId: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        students: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            email: true,
            name: true,
            isRequested: true,
            isConfirmed: true,
          },
        },
      },
    });
  }),
});
