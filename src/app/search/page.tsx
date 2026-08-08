import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SearchResults } from "@/components/posts/SearchResults";

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <p className="mx-auto max-w-2xl text-sm text-[var(--muted)]">
            Loading search…
          </p>
        }
      >
        <SearchResults />
      </Suspense>
    </AppShell>
  );
}
