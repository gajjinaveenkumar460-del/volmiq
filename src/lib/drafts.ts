/**
 * Client-only draft storage for ask / answer / comment.
 * sessionStorage: survives /login in the same tab; clears when tab closes.
 * Never trust this for auth — only for UX text restore.
 */

const MAX_JSON_CHARS = 50_000;

export type AskDraft = {
  title: string;
  body: string;
  communitySlug: string;
};

export type BodyDraft = {
  body: string;
};

export const draftKeys = {
  ask: () => "volmiq:draft:ask",
  answer: (postId: string) => `volmiq:draft:answer:${postId}`,
  comment: (answerId: string, parentId: string | null) =>
    `volmiq:draft:comment:${answerId}:${parentId ?? "root"}`,
};

export function saveDraft(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(data);
    if (json.length > MAX_JSON_CHARS) return;
    sessionStorage.setItem(key, json);
  } catch {
    // quota / private mode — ignore
  }
}

export function loadDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw || raw.length > MAX_JSON_CHARS) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function hasDraft(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(key) != null;
  } catch {
    return false;
  }
}
