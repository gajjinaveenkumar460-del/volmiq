import {
  createChunks,
  isChunkLike,
  stringFromBase64URL,
  stringToBase64URL,
  DEFAULT_COOKIE_OPTIONS,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refresh only once the access token is this close to expiring. */
const REFRESH_SKEW_MS = 15_000;

type StoredSession = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number | string;
  expires_in?: number;
  token_type?: string;
  user?: unknown;
};

function authStorageKey(supabaseUrl: string): string | null {
  try {
    const ref = new URL(supabaseUrl).hostname.split(".")[0];
    return ref ? `sb-${ref}-auth-token` : null;
  } catch {
    return null;
  }
}

function readAuthCookie(request: NextRequest, key: string): string | null {
  const direct = request.cookies.get(key)?.value;
  if (direct) return direct;

  const parts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const part = request.cookies.get(`${key}.${i}`)?.value;
    if (!part) break;
    parts.push(part);
  }
  return parts.length > 0 ? parts.join("") : null;
}

function decodeSession(raw: string): StoredSession | null {
  try {
    const json = raw.startsWith("base64-")
      ? stringFromBase64URL(raw.slice("base64-".length))
      : raw;
    const session = JSON.parse(json) as StoredSession;
    if (!session || typeof session !== "object") return null;
    return session;
  } catch {
    return null;
  }
}

function accessTokenStillValid(session: StoredSession): boolean {
  const expiresAt = Number(session.expires_at);
  return Number.isFinite(expiresAt) && expiresAt * 1000 - Date.now() > REFRESH_SKEW_MS;
}

function applyCookies(
  request: NextRequest,
  updates: { name: string; value: string; maxAge: number }[],
) {
  for (const cookie of updates) {
    request.cookies.set(cookie.name, cookie.value);
  }
  const response = NextResponse.next({ request });
  for (const cookie of updates) {
    response.cookies.set(cookie.name, cookie.value, {
      ...DEFAULT_COOKIE_OPTIONS,
      maxAge: cookie.maxAge,
    });
  }
  return response;
}

function clearStoredSession(
  request: NextRequest,
  storageKey: string,
): NextResponse {
  const updates = request.cookies
    .getAll()
    .filter((cookie) => isChunkLike(cookie.name, storageKey))
    .map((cookie) => ({ name: cookie.name, value: "", maxAge: 0 }));

  if (updates.length === 0) {
    return NextResponse.next({ request });
  }
  return applyCookies(request, updates);
}

function writeStoredSession(
  request: NextRequest,
  storageKey: string,
  session: StoredSession,
): NextResponse {
  const encoded = `base64-${stringToBase64URL(JSON.stringify(session))}`;
  const chunks = createChunks(storageKey, encoded);
  const keep = new Set(chunks.map((chunk) => chunk.name));
  const updates = [
    ...request.cookies
      .getAll()
      .filter(
        (cookie) => isChunkLike(cookie.name, storageKey) && !keep.has(cookie.name),
      )
      .map((cookie) => ({ name: cookie.name, value: "", maxAge: 0 })),
    ...chunks.map((chunk) => ({
      name: chunk.name,
      value: chunk.value,
      maxAge: DEFAULT_COOKIE_OPTIONS.maxAge ?? 400 * 24 * 60 * 60,
    })),
  ];
  return applyCookies(request, updates);
}

type RefreshResult =
  | { ok: true; session: StoredSession }
  | { ok: false; clear: boolean };

/**
 * Exchange the refresh token without the Supabase client.
 * The client prints AuthApiError when the token is already gone.
 */
async function refreshStoredSession(
  supabaseUrl: string,
  supabaseKey: string,
  refreshToken: string,
): Promise<RefreshResult> {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    },
  );

  if (response.ok) {
    const data = (await response.json()) as StoredSession;
    if (!data.access_token || !data.refresh_token) {
      return { ok: false, clear: true };
    }
    const expiresIn = Number(data.expires_in) || 3600;
    const expiresAt = Number(data.expires_at) || Math.round(Date.now() / 1000) + expiresIn;
    return {
      ok: true,
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type ?? "bearer",
        expires_in: expiresIn,
        expires_at: expiresAt,
        user: data.user,
      },
    };
  }

  if (response.status >= 500) {
    return { ok: false, clear: false };
  }

  const body = (await response.json().catch(() => null)) as {
    error_code?: string;
    code?: string | number;
    msg?: string;
    error_description?: string;
    message?: string;
  } | null;
  const code = String(body?.error_code ?? "");
  const message = `${body?.msg ?? ""} ${body?.error_description ?? ""} ${body?.message ?? ""}`;
  // Another request in this navigation already rotated the token.
  if (code === "refresh_token_already_used" || /already used/i.test(message)) {
    return { ok: false, clear: false };
  }
  return { ok: false, clear: true };
}

/**
 * Keeps the auth cookie fresh. A missing refresh token is cleared so the
 * next request does not ask Auth to refresh it again.
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  const storageKey = authStorageKey(supabaseUrl);
  if (!storageKey) {
    return NextResponse.next({ request });
  }

  const raw = readAuthCookie(request, storageKey);
  if (!raw) {
    return NextResponse.next({ request });
  }

  const session = decodeSession(raw);
  if (!session?.refresh_token) {
    return clearStoredSession(request, storageKey);
  }

  if (accessTokenStillValid(session)) {
    return NextResponse.next({ request });
  }

  try {
    const refreshed = await refreshStoredSession(
      supabaseUrl,
      supabaseKey,
      session.refresh_token,
    );
    if (refreshed.ok) {
      return writeStoredSession(request, storageKey, refreshed.session);
    }
    if (refreshed.clear) {
      return clearStoredSession(request, storageKey);
    }
  } catch {
    // Auth was unreachable. Keep the cookie and try again on the next request.
  }

  return NextResponse.next({ request });
}
