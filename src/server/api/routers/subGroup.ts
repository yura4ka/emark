import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { validId, validString } from "../../../utils/schemas";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const subGroupRouter = createTRPCRouter({
  get: publicProcedure.input(validId).query(({ ctx, input }) => {
    return ctx.prisma.subGroup.findMany({
      where: { groupId: input },
      select: { id: true, name: true, isFull: true },
    });
  }),
  create: adminProcedure
    .input(
      z.object({ groupId: validId, name: validString, studentIds: z.array(validId) })
    )
    .mutation(async ({ ctx, input }) => {
      const [group, students] = await Promise.all([
        ctx.prisma.group.findUniqueOrThrow({
          where: { id: input.groupId },
          include: { students: true },
        }),
        ctx.prisma.student.findMany({
          where: { groupId: input.groupId, id: { in: input.studentIds } },
          select: { id: true },
        }),
      ]);

      if (
        group.students.length <= input.studentIds.length ||
        students.length !== input.studentIds.length
      )
        throw new TRPCError({ code: "BAD_REQUEST" });

      return ctx.prisma.subGroup.create({
        data: {
          groupId: group.id,
          name: input.name.trim(),
          students: { connect: students },
        },
        select: { id: true },
      });
    }),
  getById: publicProcedure.input(validId).query(({ ctx, input }) => {
    return ctx.prisma.subGroup.findUniqueOrThrow({
      where: { id: input },
      select: {
        students: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });
  }),
  update: adminProcedure
    .input(z.object({ id: validId, name: validString, studentIds: z.array(validId) }))
    .mutation(async ({ ctx, input }) => {
      const { groupId } = await ctx.prisma.subGroup.findUniqueOrThrow({
        where: { id: input.id },
      });
      const students = await ctx.prisma.student.findMany({
        where: { groupId, id: { in: input.studentIds } },
        select: { id: true },
      });
      return ctx.prisma.subGroup.update({
        where: { id: input.id },
        data: { name: input.name.trim(), students: { set: students } },
      });
    }),
});
