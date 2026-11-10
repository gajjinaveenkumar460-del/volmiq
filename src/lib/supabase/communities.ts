import type { Community, CommunityRow } from "@/types/community";
import { supabase } from "@/lib/supabase/client";
import { mapDbCommunities } from "@/lib/supabase/mappers/communities";

/** Room for questions that are not about one exam or career. */
export const GENERAL_ROOM: Community = {
  id: "room-general",
  slug: "general",
  name: "General",
  description:
    "Ask anything that does not belong to one exam or career room.",
  memberCount: 0,
};

/** PostgREST message when posts.community_slug has no matching room. */
export function roomSaveError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (/foreign key/i.test(message) && /community/i.test(message)) {
    return "The General room is not in the database yet.";
  }
  return message || fallback;
}

/** Keep General as the first room, using the database row when it exists. */
export function withGeneralRoom(list: Community[]): Community[] {
  const existing = list.find((room) => room.slug === GENERAL_ROOM.slug);
  const general = existing ?? GENERAL_ROOM;
  return [general, ...list.filter((room) => room.slug !== GENERAL_ROOM.slug)];
}

/**
 * Fetch all rooms from Supabase.
 * General is always included so the feed tab and ask form can use it.
 */
export async function getAllCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return withGeneralRoom(mapDbCommunities(data as CommunityRow[] | null));
}
