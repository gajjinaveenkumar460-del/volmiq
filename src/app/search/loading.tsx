import { AppShell } from "@/components/layout/AppShell";
import { PostCardListSkeleton, SkeletonBar } from "@/components/ui/Skeletons";

export default function SearchLoading() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        <SkeletonBar className="h-4 w-28" />
        <SkeletonBar className="mt-2 h-7 w-48" />
        <PostCardListSkeleton count={3} />
      </div>
    </AppShell>
  );
}
