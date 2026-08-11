"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "@/components/ui/Icons";

/**
 * Nexora-style pill search.
 * Enter with text → /search?q=…
 * Clear box (no Enter) → home feed with all posts.
 */
export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQ);

  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  function goHomeFeed() {
    // Already on home with no query — nothing to do
    if (pathname === "/" && !searchParams.get("q")) return;
    router.push("/");
  }

  function handleChange(next: string) {
    setValue(next);
    // Empty search box → show all posts without waiting for Enter
    if (next.trim() === "") {
      goHomeFeed();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) {
      goHomeFeed();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto min-w-0 max-w-xl flex-1"
      role="search"
    >
      <label className="sr-only" htmlFor="vol-search">
        Search
      </label>
      <div className="flex h-11 items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 shadow-sm transition focus-within:border-[var(--purple)]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[var(--purple)]/10">
        <IconSearch className="h-4 w-4 shrink-0 text-[var(--muted)]" />
        <input
          id="vol-search"
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search for knowledge, people or communities…"
          autoComplete="off"
          className="w-full bg-transparent text-[13px] font-medium text-[var(--ink)] outline-none placeholder:text-[var(--muted)]/75"
        />
      </div>
    </form>
  );
}
