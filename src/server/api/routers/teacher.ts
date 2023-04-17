import { TRPCError } from "@trpc/server";
import { validEmail, validId, validString } from "./../../../utils/schemas";
import { adminProcedure, publicProcedure, teacherProcedure } from "./../trpc";
import { createTRPCRouter } from "../trpc";
import { z } from "zod";
import * as argon2 from "argon2";
import { checkIsExpired, mailToTeacher } from "../../../utils/mailer";

export const teacherRouter = createTRPCRouter({
  get: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isConfirmed: true,
        isRequested: true,
        handlerOf: {
          select: { id: true, name: true, faculty: { select: { title: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
  }),
  create: adminProcedure
    .input(
      z.object({ name: validString, email: validEmail, handlerOfId: validId.optional() })
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim();

      const exists = await ctx.prisma.student.findUnique({
        where: { email },
      });

      if (exists) throw new TRPCError({ code: "BAD_REQUEST" });

      const { id, confirmString } = await ctx.prisma.teacher.create({
        data: { name: input.name.trim(), email, requestDate: new Date() },
      });

      if (input.handlerOfId)
        await ctx.prisma.group.update({
          where: { id: input.handlerOfId },
          data: { handlerId: id },
        });

      try {
        await mailToTeacher(email, confirmString || "", "CONFIRM");
      } catch (e) {
        console.error(e);
        await ctx.prisma.teacher.update({
          where: { id },
          data: { isRequested: false, requestDate: null, confirmString: null },
        });
      }

      return true;
    }),
  update: adminProcedure
    .input(
      z.object({
        id: validId,
        name: validString,
        email: validEmail,
        handlerOfId: validId.nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.update({
        where: { id: input.id },
        data: { name: input.name.trim(), email: input.email.trim() },
        select: { handlerOf: { select: { id: true } } },
      });

      if (input.handlerOfId !== teacher.handlerOf) {
        await ctx.prisma.$transaction(async (tx) => {
          if (teacher.handlerOf)
            await tx.group.update({
              where: { id: teacher.handlerOf.id },
              data: { handlerId: null },
            });

          if (input.handlerOfId)
            await tx.group.update({
              where: { id: input.handlerOfId },
              data: { handlerId: input.id },
            });
        });
      }

      return true;
    }),
  makeAdmin: adminProcedure.input(validId).mutation(async ({ ctx, input }) => {
    await ctx.prisma.teacher.update({ where: { id: input }, data: { isAdmin: true } });
  }),
  getFreeGroups: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.group.findMany({
      where: { handlerId: null },
      select: { id: true, name: true, faculty: { select: { title: true } } },
      orderBy: [{ faculty: { title: "asc" } }, { name: "asc" }],
    });
  }),
  getFreeTeachers: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.teacher.findMany({
      where: { handlerOf: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }),
  getClasses: teacherProcedure.input(validId).query(({ ctx, input }) => {
    return ctx.prisma.class.findMany({
      where: { teacherId: input },
      select: {
        id: true,
        name: true,
        subject: { select: { id: true, title: true } },
        subGroup: {
          select: {
            group: { select: { faculty: { select: { id: true, title: true } } } },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
  confirm: publicProcedure
    .input(
      z.object({ id: validId, confirmString: validString, password: validString.min(4) })
    )
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (
        !teacher.isRequested ||
        !teacher.requestDate ||
        teacher.confirmString !== input.confirmString ||
        teacher.isConfirmed ||
        checkIsExpired(teacher.requestDate)
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const password = await argon2.hash(input.password.trim());

      await ctx.prisma.teacher.update({
        where: { id: input.id },
        data: {
          isRequested: false,
          isConfirmed: true,
          password,
          requestDate: null,
          confirmString: null,
        },
      });

      return true;
    }),
  delete: adminProcedure.input(validId).mutation(async ({ ctx, input: id }) => {
    await ctx.prisma.teacher.delete({ where: { id } });
    return true;
  }),
  getTeacherEmailByConfirmString: publicProcedure
    .input(validString)
    .query(async ({ ctx, input: confirmString }) => {
      const teacher = await ctx.prisma.teacher.findFirstOrThrow({
        where: { confirmString },
      });
      if (!teacher.requestDate || checkIsExpired(teacher.requestDate)) {
        await ctx.prisma.teacher.update({
          where: { id: teacher.id },
          data: { isRequested: false, requestDate: null, confirmString: null },
        });
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      return { id: teacher.id, email: teacher.email };
    }),
});
