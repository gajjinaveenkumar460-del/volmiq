type NavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  hint?: string;
};

const NAV: NavItem[] = [
  { id: "home", label: "Home", href: "/", active: true, hint: "Feed" },
  { id: "rooms", label: "Rooms", href: "#", hint: "Communities" },
  { id: "pulse", label: "Pulse", href: "#", hint: "Trending" },
  { id: "library", label: "Library", href: "#", hint: "Saved" },
];

const NAV_META: NavItem[] = [
  { id: "account", label: "Account", href: "#" },
  { id: "settings", label: "Settings", href: "#" },
];

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AppSidebar({ className = "", onNavigate }: AppSidebarProps) {
  return (
    <aside
      id="app-sidebar-mobile"
      className={`flex h-[calc(100vh-3.75rem)] w-[220px] shrink-0 flex-col border-r border-[var(--line)] bg-white sm:h-[calc(100vh-4rem)] ${className}`}
    >
      <div className="flex flex-1 flex-col px-4 pt-8 pb-4">
        <p className="mb-4 px-2 text-[10px] font-semibold tracking-[0.22em] text-[var(--muted)] uppercase">
          Navigate
        </p>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavRow key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </nav>

        <div className="my-6 h-px bg-[var(--line)]" />

        <nav className="flex flex-col gap-0.5">
          {NAV_META.map((item) => (
            <NavRow key={item.id} item={item} onNavigate={onNavigate} quiet />
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--purple-soft)]/60 px-3.5 py-3.5">
            <p className="text-[11px] font-semibold tracking-wide text-[var(--ink)]">
              Built for real answers
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
              Rooms for exams & careers — calm, focused, no noise.
            </p>
          </div>
          <p className="mt-4 px-1 text-[10px] tracking-wide text-[var(--muted)]/80">
            © {new Date().getFullYear()} Volmiq
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavRow({
  item,
  onNavigate,
  quiet = false,
}: {
  item: NavItem;
  onNavigate?: () => void;
  quiet?: boolean;
}) {
  if (item.active) {
    return (
      <a
        href={item.href}
        onClick={onNavigate}
        className="relative flex items-baseline justify-between rounded-xl bg-[var(--purple-soft)] px-3 py-2.5 text-[var(--purple-deep)]"
      >
        <span className="text-[13px] font-semibold tracking-tight">{item.label}</span>
        {item.hint && (
          <span className="text-[10px] font-medium tracking-wide text-[var(--purple)]">
            {item.hint}
          </span>
        )}
        <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--purple)]" />
      </a>
    );
  }

  return (
    <a
      href={item.href}
      onClick={onNavigate}
      className={`flex items-baseline justify-between rounded-xl px-3 py-2.5 transition hover:bg-[var(--purple-soft)]/50 ${
        quiet ? "text-[var(--muted)]" : "text-[var(--ink)]"
      }`}
    >
      <span
        className={`text-[13px] tracking-tight ${quiet ? "font-medium" : "font-semibold"}`}
      >
        {item.label}
      </span>
      {item.hint && (
        <span className="text-[10px] font-medium tracking-wide text-[var(--muted)]">
          {item.hint}
        </span>
      )}
    </a>
  );
}
