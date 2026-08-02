import type { Community, CommunityRow } from "@/types/community";
import { supabase } from "@/lib/supabase/client";
import { mapDbCommunities } from "@/lib/supabase/mappers/communities";

/**
 * Fetch all rooms from Supabase.
 */
export async function getAllCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbCommunities(data as CommunityRow[] | null);
}
