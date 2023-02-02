import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import * as argon2 from "argon2";

export const studentRouter = createTRPCRouter({
  makeRequest: publicProcedure
    .input(
      z.object({
        id: z.number().positive().int(),
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

      return await ctx.prisma.student.update({
        where: { id: student.id },
        data: { password, isRequested: true },
      });
    }),
});
