import { Suspense } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { AuthButton } from "@/components/auth/AuthButton";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
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
 * Nexora-style top bar: white chrome, pill search, gradient Ask.
 */
export function AppHeader({
  onMenuClick,
  menuOpen = false,
  showMenu = true,
  showSearch = true,
  showActions = true,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-[60] border-b border-[var(--line)] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-3 sm:h-16 sm:gap-4 sm:px-6">
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

        <BrandLogo size={32} />

        {showSearch ? (
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
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        {showActions && (
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Link
              href="/ask"
              className="vol-btn-primary inline-flex h-10 items-center gap-1.5 px-4 no-underline sm:px-5"
            >
              <IconAsk className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask a Question</span>
              <span className="sm:hidden">Ask</span>
            </Link>
            <AuthButton />
          </div>
        )}
      </div>
    </header>
  );
}
