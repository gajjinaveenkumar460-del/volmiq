/** App-level community (room) */
export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
};

/** Supabase communities row */
export type CommunityRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  member_count: number;
  created_at?: string;
};
