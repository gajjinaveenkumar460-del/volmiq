"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Header search box — submits to /search?q=…
 */
export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQ);

  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) {
      router.push("/");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto min-w-0 max-w-md flex-1"
      role="search"
    >
      <label className="sr-only" htmlFor="vol-search">
        Search
      </label>
      <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 transition focus-within:border-[var(--purple)] focus-within:ring-2 focus-within:ring-[var(--purple)]/15">
        <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
        <input
          id="vol-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search Volmiq…"
          autoComplete="off"
          className="w-full bg-transparent text-[13px] font-medium tracking-wide text-[var(--ink)] outline-none placeholder:text-[var(--muted)]/70"
        />
      </div>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.5 16.5 3.5 3.5" />
    </svg>
  );
}
