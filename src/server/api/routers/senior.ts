import { TRPCError } from "@trpc/server";
import { prisma } from "./../../db";
import { z } from "zod";
import { createTRPCRouter, seniorProcedure } from "../trpc";

export const seniorRouter = createTRPCRouter({
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
  resetStudentPassword: seniorProcedure
    .input(z.number().positive().int())
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
});
