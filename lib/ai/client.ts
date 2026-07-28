import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ReasoningEffort } from "openai/resources/shared";
import type { z } from "zod";

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4";

let client: OpenAI | null = null;

export function isAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getClient(): OpenAI {
  if (!isAiEnabled()) throw new Error("OPENAI_API_KEY is not set");
  client ??= new OpenAI();
  return client;
}

export async function generateObject<T extends z.ZodType>(params: {
  schema: T;
  schemaName: string;
  system: string;
  cachedContext?: string;
  prompt: string;
  maxTokens?: number;
  effort?: ReasoningEffort;
}): Promise<z.infer<T>> {
  const instructions = params.cachedContext
    ? `${params.cachedContext}\n\n${params.system}`
    : params.system;

  const response = await getClient().responses.parse({
    model: MODEL,
    instructions,
    input: params.prompt,
    reasoning: { effort: params.effort ?? "medium" },
    max_output_tokens: params.maxTokens ?? 16000,
    text: { format: zodTextFormat(params.schema, params.schemaName) },
  });

  if (response.status === "incomplete") {
    throw new Error(
      `Generation stopped early (${response.incomplete_details?.reason ?? "unknown"}).`,
    );
  }
  if (!response.output_parsed) {
    const refusal = response.output
      .flatMap((item) => (item.type === "message" ? item.content : []))
      .find((part) => part.type === "refusal");
    throw new Error(
      refusal?.refusal ?? "The model returned no parseable content.",
    );
  }

  return response.output_parsed as z.infer<T>;
}
