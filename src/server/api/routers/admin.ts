import { TRPCError } from "@trpc/server";
import { adminProcedure, userProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { validId } from "../../../utils/schemas";
import { mailToTeacher } from "../../../utils/mailer";
import { v4 as uuid } from "uuid";
import * as argon2 from "argon2";

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

  updatePassword: userProcedure
    .input(
      z.object({
        currentPassword: z.string().trim().min(4),
        newPassword: z.string().trim().min(4),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isStudent = ctx.session.user.role.isStudent;
      const user = isStudent
        ? await ctx.prisma.student.findUnique({ where: { id: ctx.session.user.id } })
        : await ctx.prisma.teacher.findUnique({ where: { id: ctx.session.user.id } });

      if (!user || !user.password) throw new TRPCError({ code: "BAD_REQUEST" });
      const isValidPassword = await argon2.verify(
        user.password,
        input.currentPassword.trim()
      );
      if (!isValidPassword) throw new TRPCError({ code: "BAD_REQUEST" });
      const newPassword = await argon2.hash(input.newPassword.trim());

      isStudent
        ? await ctx.prisma.student.update({
            where: { id: user.id },
            data: { password: newPassword },
          })
        : await ctx.prisma.teacher.update({
            where: { id: user.id },
            data: { password: newPassword },
          });
    }),
});
