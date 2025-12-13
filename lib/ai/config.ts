const DEFAULT_TIMEOUT = 20000;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_RETRIES = 2;

export const AI_IS_ENABLED = Boolean(process.env.OPENAI_API_KEY);

export const AI_DEFAULT_CHAT_MODEL =
  process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

export const AI_DEFAULT_JSON_MODEL =
  process.env.OPENAI_JSON_MODEL ?? AI_DEFAULT_CHAT_MODEL;

export const AI_DEFAULT_TEMPERATURE = Number.isFinite(
  Number(process.env.OPENAI_TEMPERATURE)
)
  ? Number(process.env.OPENAI_TEMPERATURE)
  : DEFAULT_TEMPERATURE;

export const AI_MAX_RETRIES = Number.isFinite(
  Number(process.env.OPENAI_MAX_RETRIES)
)
  ? Math.max(Number(process.env.OPENAI_MAX_RETRIES), 0)
  : DEFAULT_MAX_RETRIES;

export const AI_TIMEOUT_MS = Number.isFinite(
  Number(process.env.OPENAI_TIMEOUT_MS)
)
  ? Math.max(Number(process.env.OPENAI_TIMEOUT_MS), 0)
  : DEFAULT_TIMEOUT;

export const AI_USER_AGENT =
  process.env.AI_USER_AGENT ?? "ytk-career/ai-client";
