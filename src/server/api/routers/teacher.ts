import { validEmail, validId, validString } from "./../../../utils/schemas";
import { adminProcedure, teacherProcedure } from "./../trpc";
import { createTRPCRouter } from "../trpc";
import { z } from "zod";

export const teacherRouter = createTRPCRouter({
  get: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
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
      const { id } = await ctx.prisma.teacher.create({
        data: { name: input.name.trim(), email: input.email.trim(), isConfirmed: true },
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
      await Promise.all([
        ctx.prisma.teacher.update({
          where: { id: input.id },
          data: { name: input.name.trim(), email: input.email.trim() },
        }),
        input.handlerOfId &&
          ctx.prisma.group.update({
            where: { id: input.handlerOfId },
            data: { handlerId: input.id },
          }),
      ]);
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
        teacher: { select: { id: true, name: true } },
        subGroup: {
          select: { group: { select: { faculty: { select: { title: true } } } } },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
});
