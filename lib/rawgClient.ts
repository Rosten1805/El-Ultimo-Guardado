// Server-only: RAWG HTTP client. API key never leaves this file.

const BASE_URL = process.env.RAWG_BASE_URL ?? "https://api.rawg.io/api";
const API_KEY = process.env.RAWG_API_KEY;

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

async function rawgFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  retries = 1,
): Promise<T> {
  if (!API_KEY) throw new AppError("NO_API_KEY", "RAWG_API_KEY is not set", 500);

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("key", API_KEY);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (res.status === 429) {
      throw new AppError("RATE_LIMITED", "RAWG rate limit exceeded", 429);
    }
    if (res.status === 404) {
      throw new AppError("NOT_FOUND", "Resource not found", 404);
    }
    if (!res.ok) {
      if (retries > 0) return rawgFetch<T>(path, params, retries - 1);
      throw new AppError("RAWG_ERROR", `RAWG returned ${res.status}`, res.status);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new AppError("TIMEOUT", "RAWG request timed out", 408);
    }
    throw new AppError("NETWORK_ERROR", "Network error", 503);
  } finally {
    clearTimeout(timeout);
  }
}

export { rawgFetch };
