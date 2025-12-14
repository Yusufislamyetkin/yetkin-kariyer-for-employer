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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db.ts:resolveDatabaseUrl',message:'Checking env vars',data:{hasPrismaUrl:!!process.env.POSTGRES_PRISMA_URL,hasDatabaseUrl:!!process.env.DATABASE_URL,hasNonPooling:!!process.env.POSTGRES_URL_NON_POOLING},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  let url =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  // Remove quotes if present (common in .env files)
  if (url && (url.startsWith('"') || url.startsWith("'"))) {
    url = url.slice(1, -1);
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db.ts:resolveDatabaseUrl',message:'URL resolved',data:{hasUrl:!!url,urlLength:url?.length||0,urlPrefix:url?.substring(0,30)||'none',hadQuotes:!!(process.env.POSTGRES_PRISMA_URL && (process.env.POSTGRES_PRISMA_URL.startsWith('"') || process.env.POSTGRES_PRISMA_URL.startsWith("'")))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (!url) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db.ts:resolveDatabaseUrl',message:'URL missing - throwing error',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    throw new Error(
      "Database connection string is missing. Please set POSTGRES_PRISMA_URL (or DATABASE_URL/POSTGRES_URL_NON_POOLING)."
    );
  }

  return url;
};

// Connection pool configuration for serverless environments
const createPrismaClient = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db.ts:createPrismaClient',message:'Creating Prisma client',data:{isEdgeRuntime,hasPrismaClient:!!PrismaClient},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  let dbUrl;
  try {
    dbUrl = resolveDatabaseUrl();
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db.ts:createPrismaClient',message:'resolveDatabaseUrl failed',data:{error:error?.message||'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    throw error;
  }
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db.ts:createPrismaClient',message:'Instantiating PrismaClient',data:{urlPrefix:dbUrl?.substring(0,30)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db.ts:createPrismaClient',message:'PrismaClient created',data:{finalUrlPrefix:dbUrl?.substring(0,50)||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return client;
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
