"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { DashboardPayload } from "@/lib/dashboard/user-dashboard";

type Ctx = DashboardPayload & {
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
};

const DashboardDataContext = createContext<Ctx | null>(null);

export function DashboardProvider({
  initial,
  children,
}: {
  initial: DashboardPayload;
  children: React.ReactNode;
}) {
  const [payload, setPayload] = useState<DashboardPayload>(initial);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const res = await fetch("/api/dashboard/data", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as DashboardPayload & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Refresh failed");
      setPayload({
        usage: data.usage,
        stats: data.stats,
        items: data.items,
      });
    } catch {
      if (!opts?.silent) {
        /* keep stale data */
      }
    }
  }, []);

  const value = useMemo(
    () =>
      ({
        ...payload,
        refresh,
      }) as Ctx,
    [payload, refresh]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error("useDashboardData must be used within DashboardProvider");
  }
  return ctx;
}
