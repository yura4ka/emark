import { createTRPCRouter } from "./trpc";
import { groupRouter } from "./routers/group";
import { facultyRouter } from "./routers/faculty";
import { studentRouter } from "./routers/student";
import { adminRouter } from "./routers/admin";
import { seniorRouter } from "./routers/senior";

export const appRouter = createTRPCRouter({
  group: groupRouter,
  faculty: facultyRouter,
  student: studentRouter,
  admin: adminRouter,
  senior: seniorRouter,
});

export type AppRouter = typeof appRouter;
