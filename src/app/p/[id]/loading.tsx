import { AppShell } from "@/components/layout/AppShell";
import { PostDetailSkeleton } from "@/components/ui/Skeletons";

/**
 * Shown while the post detail server page fetches from Supabase.
 * Avoids a blank flash between navigation and content.
 */
export default function PostDetailLoading() {
  return (
    <AppShell>
      <PostDetailSkeleton />
    </AppShell>
  );
}
