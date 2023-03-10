import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { validId, validString } from "../../../utils/schemas";

export const groupRouter = createTRPCRouter({
  getFreeStudents: publicProcedure
    .input(z.object({ id: validId }))
    .query(({ ctx, input }) => {
      return ctx.prisma.student.findMany({
        where: {
          groupId: input.id,
          isConfirmed: false,
          isRequested: false,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      });
    }),
  edit: adminProcedure
    .input(
      z.object({
        id: validId,
        name: validString,
        facultyId: validId,
        seniorId: validId.nullable(),
        handlerId: validId.nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.seniorId) {
        const senior = await ctx.prisma.student.findUnique({
          where: { id: input.seniorId },
          select: { groupId: true },
        });

        if (senior?.groupId !== input.id) throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await ctx.prisma.group.update({
        where: { id: input.id },
        data: {
          name: input.name.trim(),
          seniorId: input.seniorId,
          facultyId: input.facultyId,
          handlerId: input.handlerId,
        },
      });

      return true;
    }),
  create: adminProcedure
    .input(
      z.object({ facultyId: validId, name: validString, handlerId: validId.nullable() })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: groupId } = await ctx.prisma.group.create({
        data: {
          name: input.name.trim(),
          facultyId: input.facultyId,
          handlerId: input.handlerId,
        },
      });
      await ctx.prisma.subGroup.create({
        data: { name: "Вся група", isFull: true, groupId },
      });
      return true;
    }),
  get: publicProcedure.input(validId).query(({ ctx, input }) => {
    return ctx.prisma.group.findFirst({
      where: { id: input },
      select: {
        id: true,
        name: true,
        senior: { select: { id: true, name: true } },
        handler: { select: { id: true, name: true } },
        faculty: { select: { id: true, title: true } },
        students: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            email: true,
            name: true,
            isRequested: true,
            isConfirmed: true,
          },
        },
      },
    });
  }),
  getStudents: publicProcedure.input(validId).query(async ({ ctx, input }) => {
    return ctx.prisma.group.findUniqueOrThrow({
      where: { id: input },
      select: {
        students: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      },
    });
  }),
});
