"use client";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppLayoutProvider, useAppLayout } from "@/contexts/app-layout-context";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, isMobile } = useAppLayout();

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "glass fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-glass-border shadow-xl transition-transform duration-200 ease-out",
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        )}
        style={{ width: SIDEBAR_WIDTH }}
      >
        <AppSidebar
          onClose={isMobile ? () => setSidebarOpen(false) : undefined}
        />
      </aside>
      {sidebarOpen && isMobile && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className="flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ease-out"
        style={!isMobile ? { marginLeft: SIDEBAR_WIDTH } : undefined}
      >
        <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppLayoutProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AppLayoutProvider>
  );
}
