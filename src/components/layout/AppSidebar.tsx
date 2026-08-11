"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAsk,
  IconHome,
  IconUser,
} from "@/components/ui/Icons";

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/", Icon: IconHome },
  {
    id: "my",
    label: "My activity",
    href: "/my",
    Icon: IconUser,
  },
  { id: "ask", label: "Ask", href: "/ask", Icon: IconAsk },
];

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

/**
 * Light Nexora-style sidebar with icon nav.
 */
export function AppSidebar({ className = "", onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="app-sidebar-mobile"
      className={`flex h-[calc(100vh-3.5rem)] w-[240px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--side-bg)] text-[var(--side-ink)] sm:h-[calc(100vh-3.75rem)] ${className}`}
    >
      <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
        <nav className="flex flex-col gap-0">
          {NAV.map((item) => (
            <NavRow
              key={item.id}
              item={item}
              active={isActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-8">
          <div className="rounded-2xl bg-gradient-to-br from-[#ede9fe] via-[#fce7f3] to-[#fff7ed] p-4 shadow-sm">
            <p className="text-[12px] font-bold tracking-tight text-[var(--ink)]">
              Go further on Volmiq
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
              Ask clearer questions. Vote what helps. Grow with your room.
            </p>
            <Link
              href="/ask"
              onClick={onNavigate}
              className="vol-btn-primary mt-3 inline-flex h-9 w-full gap-1.5 px-3 text-[12px] no-underline"
            >
              <IconAsk className="h-3.5 w-3.5" />
              Ask a question
            </Link>
          </div>
          <p className="px-1 text-[10px] tracking-wide text-[var(--side-muted)]">
            © {new Date().getFullYear()} Volmiq
          </p>
        </div>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { Icon } = item;

  if (active) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-lg bg-[var(--side-active)] px-2.5 py-1.5 font-semibold text-[var(--side-accent)] no-underline"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/80 text-[var(--side-accent)] shadow-sm">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[13px] tracking-tight">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--ink-soft)] no-underline transition hover:bg-[var(--side-hover)] hover:text-[var(--ink)]"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--side-muted)]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-[13px] font-medium tracking-tight">{item.label}</span>
    </Link>
  );
}
