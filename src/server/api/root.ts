import { createTRPCRouter } from "./trpc";
import { groupRouter } from "./routers/group";
import { facultyRouter } from "./routers/faculty";
import { studentRouter } from "./routers/student";

export const appRouter = createTRPCRouter({
  group: groupRouter,
  faculty: facultyRouter,
  student: studentRouter,
});

export type AppRouter = typeof appRouter;
