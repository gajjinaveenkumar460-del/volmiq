import type { User } from "@supabase/supabase-js";

/**
 * Short display name for posts / answers / comments.
 * e.g. naveen@gmail.com → "naveen"
 */
export function displayNameFromUser(user: User | null | undefined): string {
  if (!user) return "Anonymous";
  if (user.email) {
    const local = user.email.split("@")[0]?.trim();
    if (local) return local;
    return user.email;
  }
  return "Anonymous";
}
