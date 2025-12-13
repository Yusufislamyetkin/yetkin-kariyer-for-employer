// Lazy import Prisma to avoid build-time failures if client is not generated
const isEdgeRuntime = typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";
let PrismaClient: any;
if (isEdgeRuntime) {
  PrismaClient = class {};
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    PrismaClient = require("@prisma/client").PrismaClient;
  } catch {
    PrismaClient = class {};
  }
}

type GlobalPrisma = {
  prisma: any | undefined;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

const resolveDatabaseUrl = () => {
  const url =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "Database connection string is missing. Please set POSTGRES_PRISMA_URL (or DATABASE_URL/POSTGRES_URL_NON_POOLING)."
    );
  }

  return url;
};

// Connection pool configuration for serverless environments
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
  });
};

const getPrismaClient = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
};

// Proxy ensures PrismaClient is only instantiated when a method/property is accessed,
// so builds won't fail if the database URL is missing in the environment.
export const db = new Proxy({} as any, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    return Reflect.get(client as unknown as object, prop, receiver);
  },
});

const shouldRegisterProcessHandlers =
  typeof process !== "undefined" && !!process?.on && process.env.NEXT_RUNTIME !== "edge";

if (shouldRegisterProcessHandlers) {
  const gracefulShutdown = async () => {
    try {
      await getPrismaClient().$disconnect();
    } catch (error) {
      console.error("[DB] Error during disconnect:", error);
    }
  };

  process.on("beforeExit", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);

  process.on("uncaughtException", async (error) => {
    console.error("[DB] Uncaught exception:", error);
    await gracefulShutdown();
    process.exit(1);
  });
}
