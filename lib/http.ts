import { ZodError, type ZodType } from "zod";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details ?? null;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "bad_request", message, details);
  }
  static unauthorized(message = "Sign in to continue.") {
    return new ApiError(401, "unauthorized", message);
  }
  static forbidden(message = "You don't have access to that.") {
    return new ApiError(403, "forbidden", message);
  }
  static notFound(message = "Not found.") {
    return new ApiError(404, "not_found", message);
  }
  static conflict(message: string, details?: unknown) {
    return new ApiError(409, "conflict", message, details);
  }
  static tooManyRequests(message: string, details?: unknown) {
    return new ApiError(429, "too_many_requests", message, details);
  }
}

export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, data }, init);
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

function errorResponse(error: ApiError): Response {
  return Response.json(
    {
      ok: false,
      error: { code: error.code, message: error.message, details: error.details },
    },
    { status: error.status },
  );
}

export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) return errorResponse(error);
      if (error instanceof ZodError) {
        return errorResponse(
          ApiError.badRequest("Some fields need attention.", flattenZodError(error)),
        );
      }
      console.error("Unhandled route error:", error);
      return errorResponse(
        new ApiError(500, "internal_error", "Something went wrong on our end."),
      );
    }
  };
}

function flattenZodError(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw ApiError.badRequest("Expected a JSON body.");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw ApiError.badRequest("Some fields need attention.", flattenZodError(result.error));
  }
  return result.data;
}

export function readQuery<T>(request: Request, schema: ZodType<T>): T {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const result = schema.safeParse(params);
  if (!result.success) {
    throw ApiError.badRequest("Invalid query parameters.", flattenZodError(result.error));
  }
  return result.data;
}
