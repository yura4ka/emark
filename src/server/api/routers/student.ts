import { adminProcedure } from "./../trpc";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, seniorProcedure } from "../trpc";
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
      const password = await argon2.hash(input.password.trim());

      const student = await ctx.prisma.student.findFirstOrThrow({
        where: {
          id: input.id,
          isConfirmed: false,
          isRequested: false,
          password: null,
        },
      });

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
        ctx.prisma.student.findFirst({ where: { email } }),
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
});
