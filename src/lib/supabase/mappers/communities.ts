import type { Community, CommunityRow } from "@/types/community";

export function mapDbCommunity(row: CommunityRow): Community {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    memberCount: row.member_count ?? 0,
  };
}

export function mapDbCommunities(
  rows: CommunityRow[] | null | undefined,
): Community[] {
  return (rows ?? []).map(mapDbCommunity);
}
