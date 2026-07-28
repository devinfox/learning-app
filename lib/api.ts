export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, string> | null;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = (details as Record<string, string>) ?? null;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { "content-type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    const error = payload?.error ?? {};
    throw new ApiClientError(
      response.status,
      error.code ?? "unknown",
      error.message ?? "Something went wrong.",
      error.details,
    );
  }

  return payload.data as T;
}

export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const apiUpload = <T>(path: string, form: FormData) =>
  api<T>(path, { method: "POST", body: form });

export interface SseEvent {
  event: string;
  data: unknown;
}

export async function* apiEventStream(
  path: string,
  init?: RequestInit,
): AsyncGenerator<SseEvent> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => null);
    const error = payload?.error ?? {};
    throw new ApiClientError(
      response.status,
      error.code ?? "unknown",
      error.message ?? "Something went wrong.",
      error.details,
    );
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += value;

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");

        let event = "message";
        const dataLines: string[] = [];
        for (const line of frame.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }
        if (dataLines.length === 0) continue;

        try {
          yield { event, data: JSON.parse(dataLines.join("\n")) };
        } catch {
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export const apiPatch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body) });
