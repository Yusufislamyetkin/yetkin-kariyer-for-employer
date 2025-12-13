import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z, type ZodSchema } from "zod";

import {
  AI_DEFAULT_CHAT_MODEL,
  AI_DEFAULT_JSON_MODEL,
  AI_DEFAULT_TEMPERATURE,
  AI_IS_ENABLED,
  AI_MAX_RETRIES,
  AI_TIMEOUT_MS,
  AI_USER_AGENT,
} from "./config";

type ChatMessage = ChatCompletionMessageParam;

export class AIUnavailableError extends Error {
  constructor(message = "AI servisi şu anda kullanılamıyor.") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export class AIResponseValidationError extends Error {
  constructor(
    message: string,
    public readonly payload: unknown,
    public readonly zodErrors?: z.ZodError
  ) {
    super(message);
    this.name = "AIResponseValidationError";
  }
}

const openai = AI_IS_ENABLED
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        "User-Agent": AI_USER_AGENT,
      },
    })
  : null;

interface ChatCompletionBaseOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  timeoutMs?: number;
  maxRetries?: number;
  responseFormat?: "json_object" | "text";
  signal?: AbortSignal;
}

interface ChatCompletionWithSchema<T> extends ChatCompletionBaseOptions {
  schema: ZodSchema<T>;
}

interface ChatCompletionWithoutSchema extends ChatCompletionBaseOptions {
  schema?: undefined;
}

type ChatCompletionOptions<T> =
  | ChatCompletionWithSchema<T>
  | ChatCompletionWithoutSchema;

export interface ChatCompletionResult<T> {
  content: string | null;
  parsed: T | null;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

const exponentialBackoff = async (attempt: number) => {
  const delay = Math.min(2000 * 2 ** attempt, 10000);
  await new Promise((resolve) => setTimeout(resolve, delay));
};

const withAbortTimeout = <T>(
  promiseFactory: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return promiseFactory(controller.signal)
    .finally(() => clearTimeout(timeout))
    .catch((error) => {
      if (
        (error as { name?: string }).name === "AbortError" ||
        (error as { message?: string }).message?.includes("aborted") ||
        (error as { message?: string }).message?.includes("Request was aborted")
      ) {
        const timeoutError = new Error(
          `AI isteği zaman aşımına uğradı (${Math.round(timeoutMs / 1000)} saniye).`
        );
        (timeoutError as any).isTimeout = true;
        (timeoutError as any).isRetryable = true;
        throw timeoutError;
      }
      throw error;
    });
};

export const isAIEnabled = () => Boolean(openai);

export async function ensureAIEnabled() {
  if (!openai) {
    throw new AIUnavailableError();
  }
  return openai;
}

const extractContent = (input: string | null | undefined) => {
  if (!input) return null;
  return input.trim();
};

const parseWithSchema = <T>(schema: ZodSchema<T>, payload: string) => {
  try {
    const json = JSON.parse(payload);
    return schema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      }));
      
      console.error("[AI_CLIENT] Schema validation failed:", {
        errors: errorDetails,
        payloadPreview: payload.substring(0, 500),
        payloadLength: payload.length,
      });
      
      const errorSummary = errorDetails
        .map((err) => `  - ${err.path || "root"}: ${err.message}`)
        .join("\n");
      
      const detailedMessage = `AI yanıtı beklenen JSON şemasına uymuyor.\n\nHata detayları:\n${errorSummary}`;
      
      throw new AIResponseValidationError(detailedMessage, payload, error);
    }
    
    console.error("[AI_CLIENT] JSON parse failed:", {
      error: error instanceof Error ? error.message : String(error),
      payloadPreview: payload.substring(0, 500),
      payloadLength: payload.length,
    });
    
    throw new AIResponseValidationError(
      "AI yanıtı geçerli JSON formatında değil.",
      payload
    );
  }
};

export async function createChatCompletion<T = unknown>(
  options: ChatCompletionOptions<T>
): Promise<ChatCompletionResult<T>> {
  const client = await ensureAIEnabled();
  const {
    messages,
    model,
    temperature,
    timeoutMs,
    maxRetries,
    schema,
    responseFormat,
    signal,
  } = options;

  const retries = maxRetries ?? AI_MAX_RETRIES;
  const finalModel = model ?? (schema ? AI_DEFAULT_JSON_MODEL : AI_DEFAULT_CHAT_MODEL);
  const format: "json_object" | "text" =
    responseFormat ?? (schema ? "json_object" : "text");
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const completion = await withAbortTimeout(
        (abortSignal) =>
          client.chat.completions.create(
            {
              model: finalModel,
              messages,
              temperature: temperature ?? AI_DEFAULT_TEMPERATURE,
              response_format:
                format === "json_object" ? { type: "json_object" } : { type: "text" },
            },
            { signal: signal ?? abortSignal }
          ),
        timeoutMs ?? AI_TIMEOUT_MS
      );

      const content = extractContent(
        completion.choices[0]?.message?.content ?? null
      );

      if (!content) {
        throw new Error("AI yanıtı boş döndü.");
      }

      const parsed =
        schema && format === "json_object"
          ? parseWithSchema(schema, content)
          : (null as T | null);

      return {
        content,
        parsed: parsed ?? null,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    } catch (error) {
      lastError = error;
      
      const isRetryableError = 
        (error as { isRetryable?: boolean }).isRetryable === true ||
        (error as { isTimeout?: boolean }).isTimeout === true ||
        (error as { message?: string }).message?.includes("zaman aşımı") ||
        (error as { message?: string }).message?.includes("aborted") ||
        (error as { message?: string }).message?.includes("Request was aborted") ||
        (error as { code?: string }).code === "ECONNRESET" ||
        (error as { code?: string }).code === "ETIMEDOUT";
      
      if (attempt === retries || !isRetryableError) {
        throw error;
      }
      
      if ((error as { isTimeout?: boolean }).isTimeout) {
        console.warn(
          `[AI_CLIENT] Timeout hatası, tekrar deneniyor (${attempt + 1}/${retries}):`,
          (error as Error).message
        );
      }
      
      await exponentialBackoff(attempt);
      attempt += 1;
    }
  }

  throw lastError ?? new Error("AI isteği başarısız oldu.");
}

export type { ChatMessage, ChatCompletionOptions };
