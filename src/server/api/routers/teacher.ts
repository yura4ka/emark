import { TRPCError } from "@trpc/server";
import { validEmail, validId, validString } from "./../../../utils/schemas";
import { adminProcedure, publicProcedure, teacherProcedure } from "./../trpc";
import { createTRPCRouter } from "../trpc";
import { z } from "zod";
import * as argon2 from "argon2";

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

      const { id } = await ctx.prisma.teacher.create({
        data: { name: input.name.trim(), email, isRequested: false, isConfirmed: false },
      });

      if (input.handlerOfId)
        await ctx.prisma.group.update({
          where: { id: input.handlerOfId },
          data: { handlerId: id },
        });
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
  makeRequest: publicProcedure
    .input(z.object({ email: validEmail, password: validString.min(4) }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.prisma.teacher.findUniqueOrThrow({
        where: { email: input.email },
      });

      if (teacher.isRequested || teacher.isConfirmed)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const password = await argon2.hash(input.password.trim());

      await ctx.prisma.teacher.update({
        where: { email: input.email },
        data: { isRequested: true, isConfirmed: false, password },
      });

      return true;
    }),
});
