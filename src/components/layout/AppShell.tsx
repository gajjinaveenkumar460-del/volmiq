"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <AppHeader onMenuClick={toggleSidebar} menuOpen={sidebarOpen} />

      <div className="flex">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[var(--ink)]/20 backdrop-blur-[2px] md:hidden"
            aria-label="Close menu"
            onClick={closeSidebar}
          />
        )}

        <div
          className={[
            "fixed top-[3.75rem] bottom-0 left-0 z-50 w-[min(240px,88vw)] transform transition-transform duration-200 ease-out sm:top-16 md:hidden",
            sidebarOpen ? "translate-x-0" : "pointer-events-none -translate-x-full",
          ].join(" ")}
          aria-hidden={!sidebarOpen}
        >
          <AppSidebar
            className="h-full w-full shadow-2xl shadow-black/20"
            onNavigate={closeSidebar}
          />
        </div>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
