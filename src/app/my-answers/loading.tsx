import { AppShell } from "@/components/layout/AppShell";
import { AnswerListSkeleton, SkeletonBar } from "@/components/ui/Skeletons";

export default function MyAnswersLoading() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        <SkeletonBar className="h-4 w-28" />
        <SkeletonBar className="mt-2 h-7 w-36" />
        <SkeletonBar className="h-3.5 w-52" />
        <AnswerListSkeleton count={3} />
      </div>
    </AppShell>
  );
}
