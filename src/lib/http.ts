// HTTP client for the Orbit NestJS backend.
//
// Key facts baked in here, from the backend contract:
//  - Base URL defaults to http://localhost:3000 (Nest default port).
//  - Auth is an httpOnly cookie (orbit_session) the server sets on login.
//    JS can't read it, so every request sends `credentials: "include"` and
//    the browser attaches the cookie automatically.
//  - Every response is wrapped: { success, statusCode, message?, data, meta? }.
//    We unwrap `.data` so callers get the payload directly.
//  - CORS: the backend must run app.enableCors({ origin: <this app>,
//    credentials: true }) or the cookie is never sent. (Backend-side fix.)

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface Envelope<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: unknown;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;
  const activeEnv = localStorage.getItem("orbit_active_env") ?? "test";
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Orbit-Env": activeEnv,
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Can't reach the server. Is the backend running on " + BASE_URL + "?",
      0,
    );
  }

  // 204 No Content (e.g. logout)
  if (res.status === 204) return undefined as T;

  let body: Envelope<T> | undefined;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    body = undefined;
  }

  if (!res.ok) {
    const msg =
      body?.message ?? `Request failed (${res.status} ${res.statusText})`;
    throw new ApiError(msg, res.status);
  }

  // Unwrap the response envelope.
  return (body?.data ?? (body as unknown)) as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, json?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: json !== undefined ? JSON.stringify(json) : undefined,
    }),
  patch: <T>(path: string, json?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: json !== undefined ? JSON.stringify(json) : undefined,
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
