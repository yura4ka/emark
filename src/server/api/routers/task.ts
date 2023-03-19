import { TRPCError } from "@trpc/server";
import { validId, validString } from "./../../../utils/schemas";
import { teacherProcedure } from "./../trpc";
import { createTRPCRouter } from "../trpc";
import { z } from "zod";

export const taskRouter = createTRPCRouter({
  create: teacherProcedure
    .input(
      z.object({
        classId: validId,
        name: validString.nullable(),
        date: z.date(),
        maxMark: z.number().positive().max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.date > new Date()) throw new TRPCError({ code: "BAD_REQUEST" });

      const { id } = await ctx.prisma.class.findFirstOrThrow({
        where: { id: input.classId, teacherId: ctx.session.user.id },
        select: { id: true },
      });

      await ctx.prisma.task.create({
        data: {
          classId: id,
          date: input.date,
          title: input.name?.trim(),
          maxScore: input.maxMark,
        },
      });

      return true;
    }),

  update: teacherProcedure
    .input(
      z.object({
        id: validId,
        name: validString.nullable(),
        date: z.date(),
        maxMark: z.number().positive().max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findFirstOrThrow({
        where: { id: input.id, class: { teacherId: ctx.session.user.id } },
        select: {
          maxScore: true,
          marks: { select: { score: true } },
        },
      });

      if (
        task.maxScore > input.maxMark &&
        task.marks.some((m) => m.score > input.maxMark)
      )
        throw new TRPCError({ code: "BAD_REQUEST" });

      await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          date: input.date,
          title: input.name?.trim(),
          maxScore: input.maxMark,
        },
      });
      return true;
    }),

  remove: teacherProcedure.input(validId).mutation(async ({ ctx, input }) => {
    const task = await ctx.prisma.task.findUniqueOrThrow({
      where: { id: input },
      select: { class: { select: { teacherId: true } } },
    });
    if (task.class.teacherId !== ctx.session.user.id && !ctx.session.user.role.isAdmin)
      throw new TRPCError({ code: "FORBIDDEN" });

    await ctx.prisma.$transaction([
      ctx.prisma.mark.deleteMany({ where: { taskId: input } }),
      ctx.prisma.task.delete({ where: { id: input } }),
    ]);

    return true;
  }),

  upsertMark: teacherProcedure
    .input(
      z.object({
        id: validId.optional(),
        taskId: validId,
        studentId: validId,
        mark: z.number().positive(),
        comment: validString.nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findFirstOrThrow({
        where: {
          id: input.taskId,
          maxScore: { gte: input.mark },
          class: { teacherId: ctx.session.user.id },
          OR: [
            {
              class: {
                subGroup: { isFull: false, students: { some: { id: input.studentId } } },
              },
            },
            {
              class: {
                subGroup: {
                  isFull: true,
                  group: { students: { some: { id: input.studentId } } },
                },
              },
            },
          ],
        },
        select: {
          maxScore: true,
          id: true,
        },
      });

      let id;
      const data = {
        taskId: task.id,
        studentId: input.studentId,
        teacherId: ctx.session.user.id,
        score: input.mark,
        comment: input.comment?.trim(),
      };

      if (!input.id) {
        const mark = await ctx.prisma.mark.create({ data });
        id = mark.id;
      } else {
        const mark = await ctx.prisma.mark.findFirstOrThrow({
          where: { id: input.id, taskId: task.id, studentId: data.studentId },
        });
        await ctx.prisma.mark.update({
          where: { id: input.id },
          data: { ...data, editedAt: new Date() },
        });
        id = mark.id;
      }

      return id;
    }),

  removeMark: teacherProcedure.input(validId).mutation(async ({ ctx, input }) => {
    const { id } = await ctx.prisma.mark.findFirstOrThrow({
      where: { id: input, task: { class: { teacherId: ctx.session.user.id } } },
    });
    await ctx.prisma.mark.delete({ where: { id } });
    return true;
  }),
});
