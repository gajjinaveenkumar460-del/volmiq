/**
 * Prevent open redirects after login.
 * Only same-origin relative paths are allowed (e.g. /ask, /p/uuid).
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/",
): string {
  if (!raw) return fallback;

  let path: string;
  try {
    path = decodeURIComponent(raw).trim();
  } catch {
    return fallback;
  }

  // Relative path only
  if (!path.startsWith("/")) return fallback;
  // Protocol-relative: //evil.com
  if (path.startsWith("//")) return fallback;
  // Absolute URL smuggled in
  if (path.includes("://")) return fallback;
  // Windows / odd path tricks
  if (path.includes("\\")) return fallback;
  // Newlines / control chars
  if (/[\u0000-\u001f\u007f]/.test(path)) return fallback;

  return path;
}

/** Build /login?next=… with a validated return path. */
export function loginWithNext(nextPath: string): string {
  const next = safeNextPath(nextPath, "/");
  return `/login?next=${encodeURIComponent(next)}`;
}
