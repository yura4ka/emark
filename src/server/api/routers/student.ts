import { z } from "zod";
import { createTRPCRouter, publicProcedure, seniorProcedure } from "../trpc";
import * as argon2 from "argon2";

export const studentRouter = createTRPCRouter({
  makeRequest: publicProcedure
    .input(
      z.object({
        id: z.number().positive().int(),
        password: z.string().trim().min(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const password = await argon2.hash(input.password.trim());

      const student = await ctx.prisma.student.findFirstOrThrow({
        where: {
          id: input.id,
          isConfirmed: false,
          isRequested: false,
          password: null,
        },
      });

      return ctx.prisma.student.update({
        where: { id: student.id },
        data: { password, isRequested: true },
      });
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

  confirmStudent: seniorProcedure
    .input(z.number().positive().int())
    .mutation(async ({ ctx, input }) => {
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
});
