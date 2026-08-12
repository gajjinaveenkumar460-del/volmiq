import { Suspense } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { AuthButton } from "@/components/auth/AuthButton";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { IconAsk, IconClose, IconMenu, IconSearch } from "@/components/ui/Icons";
import Link from "next/link";

type AppHeaderProps = {
  onMenuClick?: () => void;
  menuOpen?: boolean;
  showMenu?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
};

/**
 * Nexora-style top bar.
 * Mobile: actions stay usable; search moves to a second full-width row.
 */
export function AppHeader({
  onMenuClick,
  menuOpen = false,
  showMenu = true,
  showSearch = true,
  showActions = true,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-[60] border-b border-[var(--line)] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        {showMenu && (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--ink)] transition hover:bg-[var(--purple-soft)] md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar-mobile"
          >
            {menuOpen ? (
              <IconClose className="h-[18px] w-[18px]" />
            ) : (
              <IconMenu className="h-[18px] w-[18px]" />
            )}
          </button>
        )}

        <BrandLogo size={30} />

        {/* Desktop / tablet search in the main row */}
        {showSearch ? (
          <div className="hidden min-w-0 flex-1 sm:block">
            <Suspense
              fallback={
                <div className="relative mx-auto min-w-0 max-w-xl flex-1">
                  <div className="flex h-11 items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4">
                    <IconSearch className="h-4 w-4 text-[var(--muted)]" />
                    <span className="text-[13px] text-[var(--muted)]">
                      Search for knowledge…
                    </span>
                  </div>
                </div>
              }
            >
              <HeaderSearch />
            </Suspense>
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        {/* Mobile: push actions right when search is on its own row */}
        {showSearch && <div className="min-w-0 flex-1 sm:hidden" />}

        {showActions && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <Link
              href="/ask"
              className="vol-btn-primary inline-flex h-9 w-9 items-center justify-center rounded-full no-underline sm:h-10 sm:w-auto sm:gap-1.5 sm:px-5"
              title="Ask a question"
              aria-label="Ask a question"
            >
              <IconAsk className="h-4 w-4" />
              <span className="hidden sm:inline">Ask a Question</span>
            </Link>
            <NotificationBell />
            <AuthButton compact />
          </div>
        )}
      </div>

      {/* Mobile-only full-width search row */}
      {showSearch && (
        <div className="border-t border-[var(--line)] px-3 py-2 sm:hidden">
          <Suspense
            fallback={
              <div className="flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3">
                <IconSearch className="h-4 w-4 text-[var(--muted)]" />
                <span className="text-[13px] text-[var(--muted)]">Search…</span>
              </div>
            }
          >
            <HeaderSearch compact />
          </Suspense>
        </div>
      )}
    </header>
  );
}
