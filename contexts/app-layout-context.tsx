"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type AppLayoutContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
};

const AppLayoutContext = createContext<AppLayoutContextValue | null>(null);

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
  }, [isMobile]);

  return (
    <AppLayoutContext.Provider
      value={{ sidebarOpen, setSidebarOpen, isMobile }}
    >
      {children}
    </AppLayoutContext.Provider>
  );
}

export function useAppLayout(): AppLayoutContextValue {
  const ctx = useContext(AppLayoutContext);
  if (!ctx) {
    throw new Error("useAppLayout must be used within AppLayoutProvider");
  }
  return ctx;
}
