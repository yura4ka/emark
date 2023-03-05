import { adminProcedure } from "./../trpc";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

export const groupRouter = createTRPCRouter({
  getFreeStudents: publicProcedure
    .input(z.object({ id: z.number().positive().int() }))
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
        id: z.number().positive().int(),
        name: z.string().trim().min(1),
        seniorId: z.number().positive().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const senior = await ctx.prisma.student.findUnique({
        where: { id: input.seniorId },
        select: { groupId: true, name: true },
      });

      if (senior?.groupId !== input.id) throw new TRPCError({ code: "BAD_REQUEST" });

      await ctx.prisma.group.update({
        where: { id: input.id },
        data: { name: input.name.trim(), seniorId: input.seniorId },
      });

      return true;
    }),
  create: adminProcedure
    .input(
      z.object({ facultyId: z.number().positive().int(), name: z.string().trim().min(1) })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.group.create({
          data: { name: input.name.trim(), facultyId: input.facultyId },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") throw new TRPCError({ code: "CONFLICT" });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
