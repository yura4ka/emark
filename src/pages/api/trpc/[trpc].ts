import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "../../../env/server.mjs";
import { createTRPCContext } from "../../../server/api/trpc";
import { appRouter } from "../../../server/api/root";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError: ({ error, path }) => {
    const e = error.cause;
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") throw new TRPCError({ code: "CONFLICT" });
    }

    if (env.NODE_ENV === "development")
      console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
  },
});
