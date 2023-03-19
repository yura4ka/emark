import { validString, validId } from "./../../../utils/schemas";
import { adminProcedure, publicProcedure, teacherProcedure } from "./../trpc";
import { createTRPCRouter } from "../trpc";
import { z } from "zod";

export const classRouter = createTRPCRouter({
  get: adminProcedure.query(async ({ ctx }) => {
    const classes = await ctx.prisma.class.findMany({
      select: {
        id: true,
        name: true,
        subGroup: {
          select: {
            name: true,
            group: {
              select: { name: true, faculty: { select: { title: true } } },
            },
          },
        },
        teacher: { select: { name: true } },
        subject: { select: { title: true } },
      },
      orderBy: [{ subGroup: { group: { faculty: { title: "asc" } } } }, { name: "asc" }],
    });

    return classes.map((c) => ({
      ...c,
      faculty: c.subGroup.group.faculty.title,
      group: c.subGroup.group.name,
      subGroup: c.subGroup.name,
      teacher: c.teacher.name,
      subject: c.subject.title,
    }));
  }),
  create: adminProcedure
    .input(
      z.object({
        name: validString,
        subGroup: z.object({ id: validId }),
        teacher: z.object({ id: validId }),
        subject: z.object({ id: validId }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.class.create({
        data: {
          name: input.name.trim(),
          subjectId: input.subject.id,
          teacherId: input.teacher.id,
          subGroupId: input.subGroup.id,
        },
        select: { id: true },
      });
    }),
  getById: publicProcedure.input(validId).query(async ({ ctx, input }) => {
    const classData = await ctx.prisma.class.findUniqueOrThrow({
      where: { id: input },
      select: {
        name: true,
        subject: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true } },
        subGroup: { select: { id: true, name: true, isFull: true } },
      },
    });
    const { group } = await ctx.prisma.subGroup.findUniqueOrThrow({
      where: { id: classData.subGroup.id },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            faculty: { select: { id: true, title: true } },
          },
        },
      },
    });

    return {
      ...classData,
      group: { id: group.id, name: group.name },
      faculty: { id: group.faculty.id, title: group.faculty.title },
    };
  }),
  update: adminProcedure
    .input(
      z.object({
        id: validId,
        name: validString,
        subGroup: z.object({ id: validId }),
        teacher: z.object({ id: validId }),
        subject: z.object({ id: validId }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.class.update({
        where: { id: input.id },
        data: {
          name: input.name.trim(),
          subjectId: input.subject.id,
          teacherId: input.teacher.id,
          subGroupId: input.subGroup.id,
        },
        select: { id: true },
      });
    }),
  getMarks: teacherProcedure.input(validId).query(async ({ ctx, input }) => {
    const [students, tasks] = await Promise.all([
      ctx.prisma.class
        .findUniqueOrThrow({
          where: { id: input },
          select: {
            subGroup: {
              select: {
                isFull: true,
                groupId: true,
                students: { select: { id: true, name: true }, orderBy: { name: "asc" } },
              },
            },
          },
        })
        .then((c) =>
          c.subGroup.isFull
            ? ctx.prisma.student.findMany({
                where: { groupId: c.subGroup.groupId },
                select: { id: true, name: true },
                orderBy: { name: "asc" },
              })
            : c.subGroup.students
        ),
      ctx.prisma.task.findMany({
        where: {
          class: { id: input, teacherId: ctx.session.user.id },
        },
        select: {
          id: true,
          title: true,
          maxScore: true,
          date: true,
          marks: {
            select: {
              id: true,
              studentId: true,
              comment: true,
              score: true,
              taskId: true,
            },
            orderBy: { student: { name: "asc" } },
          },
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    tasks.forEach((t) => {
      const newMarks = [];
      let currentMark = 0;
      for (const s of students) {
        const mark = t.marks.at(currentMark);
        const isExists = mark?.studentId === s.id;
        newMarks.push(
          isExists
            ? mark
            : { id: -1, studentId: s.id, score: 0, comment: null, taskId: t.id }
        );
        if (isExists) currentMark++;
      }
      t.marks = newMarks;
    });

    return { tasks, students };
  }),
});
