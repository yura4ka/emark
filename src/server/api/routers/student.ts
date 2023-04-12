import { adminProcedure, studentProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import * as argon2 from "argon2";
import { TRPCError } from "@trpc/server";
import { validEmail, validId, validString } from "../../../utils/schemas";

export const studentRouter = createTRPCRouter({
  createAdmin: publicProcedure.query(async ({ ctx }) => {
    const password = await argon2.hash("admin");
    return ctx.prisma.teacher.create({
      data: {
        name: "admin",
        email: "admin@knu.ua",
        password,
        isConfirmed: true,
        isAdmin: true,
      },
    });
  }),
  makeRequest: publicProcedure
    .input(
      z.object({
        id: validId,
        password: z.string().trim().min(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const student = await ctx.prisma.student.findFirstOrThrow({
        where: {
          id: input.id,
          isConfirmed: false,
          isRequested: false,
          password: null,
        },
      });

      const password = await argon2.hash(input.password.trim());

      return ctx.prisma.student.update({
        where: { id: student.id },
        data: { password, isRequested: true },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: validString,
        email: validEmail,
        groupId: validId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim();
      const [student, teacher] = await Promise.all([
        ctx.prisma.student.findFirst({ where: { email } }),
        ctx.prisma.student.findFirst({ where: { email } }),
      ]);

      if (student || teacher) throw new TRPCError({ code: "CONFLICT" });

      await ctx.prisma.student.create({
        data: {
          name: input.name.trim(),
          email,
          groupId: input.groupId,
        },
      });

      return true;
    }),
  edit: adminProcedure
    .input(
      z.object({
        id: validId,
        name: validString,
        email: validEmail,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim();

      const [student, teacher] = await Promise.all([
        ctx.prisma.student.findFirst({ where: { email, id: { not: input.id } } }),
        ctx.prisma.teacher.findFirst({ where: { email } }),
      ]);

      if (student || teacher) throw new TRPCError({ code: "CONFLICT" });

      await ctx.prisma.student.update({
        where: { id: input.id },
        data: {
          name: input.name.trim(),
          email: input.email.trim(),
        },
      });
      return true;
    }),
  getClasses: studentProcedure.input(validId).query(async ({ ctx, input }) => {
    const { id, groupId } = await ctx.prisma.student.findUniqueOrThrow({
      where: { id: input },
      select: {
        id: true,
        groupId: true,
      },
    });

    if (!groupId) return [];

    const classes = await ctx.prisma.class.findMany({
      where: {
        subGroup: {
          groupId,
          OR: [{ isFull: true }, { students: { some: { id } } }],
        },
      },
      select: {
        id: true,
        name: true,
        subject: { select: { id: true, title: true } },
        teacher: { select: { id: true, name: true } },
        tasks: {
          select: {
            marks: { select: { score: true }, where: { studentId: id, isNew: true } },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return classes.map((c) => {
      const tasks = c.tasks.reduce((acc, current) => acc + current.marks.length, 0);
      return { ...c, tasks };
    });
  }),

  getMarks: studentProcedure.input(validId).query(({ ctx, input }) => {
    return ctx.prisma.mark.findMany({
      where: { studentId: ctx.session.user.id, task: { classId: input } },
      select: {
        id: true,
        score: true,
        comment: true,
        isNew: true,
        dateCreated: true,
        task: {
          select: {
            title: true,
            date: true,
            maxScore: true,
          },
        },
      },
      orderBy: [
        { isNew: "asc" },
        { task: { date: "desc" } },
        { task: { createdAt: "desc" } },
      ],
    });
  }),

  getMarksFull: studentProcedure.query(async ({ ctx }) => {
    const marks = await ctx.prisma.mark.findMany({
      where: { studentId: ctx.session.user.id },
      select: {
        id: true,
        score: true,
        comment: true,
        task: {
          select: {
            id: true,
            title: true,
            date: true,
            maxScore: true,
            class: { select: { subject: { select: { id: true, title: true } } } },
          },
        },
      },
      orderBy: { dateCreated: "asc" },
    });

    type TSubjectMap = Map<number, string>;
    type TMarkMap = Map<
      number,
      {
        title: string | null;
        date: Date;
        score: number;
        maxScore: number;
        comment: string | null;
        id: number;
      }[]
    >;

    const subjects: TSubjectMap = new Map();
    const result: TMarkMap = new Map();

    for (const m of marks) {
      const sid = m.task.class.subject.id;
      subjects.set(sid, m.task.class.subject.title);
      const mark = result.get(sid);
      const data = {
        id: m.id,
        score: m.score,
        comment: m.comment,
        title: m.task.title,
        date: m.task.date,
        maxScore: m.task.maxScore,
      };
      if (mark) mark.push(data);
      else result.set(sid, [data]);
    }

    const toReturn: [TSubjectMap, TMarkMap] = [subjects, result];
    return toReturn;
  }),

  delete: adminProcedure.input(validId).mutation(async ({ ctx, input: id }) => {
    await ctx.prisma.student.delete({ where: { id } });
    return true;
  }),
});
