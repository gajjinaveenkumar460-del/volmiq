import { BrandLogo } from "@/components/layout/BrandLogo";
import Link from "next/link";

type AppHeaderProps = {
  onMenuClick?: () => void;
  menuOpen?: boolean;
};

export function AppHeader({ onMenuClick, menuOpen = false }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-[60] border-b border-[var(--line)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[3.75rem] max-w-[1500px] items-center gap-3 px-3 sm:h-16 sm:gap-5 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--ink)] transition hover:bg-[var(--purple-soft)] md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="app-sidebar-mobile"
        >
          {menuOpen ? (
            <CloseIcon className="h-[18px] w-[18px]" />
          ) : (
            <MenuIcon className="h-[18px] w-[18px]" />
          )}
        </button>

        <BrandLogo size={34} />

        <div className="relative mx-auto min-w-0 max-w-md flex-1">
          <label className="sr-only" htmlFor="vol-search">
            Search
          </label>
          <div className="flex items-center gap-2 border-b border-[var(--line-strong)] pb-1.5 transition focus-within:border-[var(--purple)]">
            <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
            <input
              id="vol-search"
              type="search"
              placeholder="Search Volmiq…"
              autoComplete="off"
              className="w-full bg-transparent text-[13px] font-medium tracking-wide text-[var(--ink)] outline-none placeholder:text-[var(--muted)]/70"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/ask"
            className="inline-flex rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold tracking-wide text-white no-underline shadow-sm shadow-[var(--purple)]/20 transition hover:bg-[var(--purple-deep)] sm:px-4"
          >
            Ask
          </Link>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-wide text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.5 16.5 3.5 3.5" />
    </svg>
  );
}
