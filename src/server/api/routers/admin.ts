import { TRPCError } from "@trpc/server";
import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { validId } from "../../../utils/schemas";
import { mailToTeacher } from "../../../utils/mailer";
import { v4 as uuid } from "uuid";

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

  sendTeacherRequest: adminProcedure.input(validId).mutation(async ({ ctx, input }) => {
    const teacher = await ctx.prisma.teacher.findUniqueOrThrow({ where: { id: input } });
    if (teacher.isRequested || teacher.isConfirmed)
      throw new TRPCError({ code: "BAD_REQUEST" });
    const confirmString = uuid();
    await mailToTeacher(teacher.email, confirmString, "CONFIRM");
    await ctx.prisma.teacher.update({
      where: { id: input },
      data: {
        isRequested: true,
        isConfirmed: false,
        confirmString,
        requestDate: new Date(),
      },
    });
    return true;
  }),

  resetTeacherPassword: adminProcedure
    .input(z.object({ id: validId, doRequest: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.findUniqueOrThrow({
        where: { id: input.id },
      });

      let confirmString: string | null = null;
      let requestDate: Date | null = null;
      if (input.doRequest) {
        confirmString = uuid();
        requestDate = new Date();
        await mailToTeacher(teacher.email, confirmString, "ADMIN_PASSWORD");
      }

      await ctx.prisma.teacher.update({
        where: { id: input.id },
        data: {
          password: null,
          isConfirmed: false,
          isRequested: input.doRequest,
          requestDate,
          confirmString,
        },
      });
      return true;
    }),
});
