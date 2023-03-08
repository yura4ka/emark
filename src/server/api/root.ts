import { createTRPCRouter } from "./trpc";
import { groupRouter } from "./routers/group";
import { facultyRouter } from "./routers/faculty";
import { studentRouter } from "./routers/student";
import { adminRouter } from "./routers/admin";
import { seniorRouter } from "./routers/senior";
import { subjectRouter } from "./routers/subject";
import { teacherRouter } from "./routers/teacher";

export const appRouter = createTRPCRouter({
  group: groupRouter,
  faculty: facultyRouter,
  student: studentRouter,
  admin: adminRouter,
  senior: seniorRouter,
  subject: subjectRouter,
  teacher: teacherRouter,
});

export type AppRouter = typeof appRouter;
