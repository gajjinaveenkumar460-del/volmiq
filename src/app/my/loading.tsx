import { AppShell } from "@/components/layout/AppShell";

export default function MyActivityLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl" role="status" aria-label="Loading">
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <div className="vol-skeleton h-24 rounded-none sm:h-28" />
          <div className="px-5 pb-5 pt-4 sm:px-6">
            <div className="vol-skeleton h-8 w-40" />
            <div className="vol-skeleton mt-3 h-3 w-64 max-w-full" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="vol-skeleton h-20 rounded-xl" />
              <div className="vol-skeleton h-20 rounded-xl" />
              <div className="vol-skeleton h-20 rounded-xl col-span-2 sm:col-span-1" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
