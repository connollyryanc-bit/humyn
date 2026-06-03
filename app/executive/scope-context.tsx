"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const REGIONS = ["Europe", "Nordics", "UK", "DACH", "France"] as const;
export type Region = (typeof REGIONS)[number];

export const NORDIC_MARKETS = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"] as const;
export type NordicMarket = (typeof NORDIC_MARKETS)[number];

export const PRACTICES = [
  "Engineering",
  "Product Design",
  "Data & AI",
  "Strategy & Innovation",
  "Service Design",
  "Programme Delivery",
  "Cloud & Architecture",
  "Insights & Analytics",
] as const;
export type Practice = (typeof PRACTICES)[number];

export interface ExecutiveScope {
  region: Region;
  market?: NordicMarket;
  practice?: Practice;
}

export const DEFAULT_SCOPE: ExecutiveScope = { region: "Europe" };

const STORAGE_KEY = "humyn.executive-scope.v1";

interface ScopeContextValue {
  scope: ExecutiveScope;
  setScope: (next: ExecutiveScope) => void;
  resetScope: () => void;
}

const ScopeContext = createContext<ScopeContextValue | null>(null);

export function ScopeProvider({ children }: { children: React.ReactNode }) {
  const [scope, setScopeState] = useState<ExecutiveScope>(DEFAULT_SCOPE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && REGIONS.includes(parsed.region)) {
          setScopeState({
            region: parsed.region,
            market: parsed.market && NORDIC_MARKETS.includes(parsed.market) ? parsed.market : undefined,
            practice: parsed.practice && PRACTICES.includes(parsed.practice) ? parsed.practice : undefined,
          });
        }
      }
    } catch {
      // fall back to default
    }
  }, []);

  const setScope = (next: ExecutiveScope) => {
    // Market only valid inside Nordics
    const cleaned: ExecutiveScope =
      next.region === "Nordics"
        ? next
        : { region: next.region, practice: next.practice };
    setScopeState(cleaned);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } catch {
        // ignore
      }
    }
  };

  const resetScope = () => setScope(DEFAULT_SCOPE);

  const value = useMemo(() => ({ scope, setScope, resetScope }), [scope]);

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useExecutiveScope(): ScopeContextValue {
  const ctx = useContext(ScopeContext);
  if (!ctx) {
    // Sensible fallback when used outside the provider (e.g. during SSR)
    return {
      scope: DEFAULT_SCOPE,
      setScope: () => {},
      resetScope: () => {},
    };
  }
  return ctx;
}

/**
 * Returns a human-readable summary of the current scope for display in
 * page headers and AI prompts.
 *
 * Examples:
 *   { region: "Europe" } -> "Europe"
 *   { region: "Nordics", market: "Stockholm" } -> "Nordics · Stockholm"
 *   { region: "Nordics", practice: "Data & AI" } -> "Nordics · Data & AI"
 */
export function describeScope(scope: ExecutiveScope): string {
  const parts: string[] = [scope.region];
  if (scope.market) parts.push(scope.market);
  if (scope.practice) parts.push(scope.practice);
  return parts.join(" · ");
}

export function scopeIsRoot(scope: ExecutiveScope): boolean {
  return scope.region === "Europe" && !scope.market && !scope.practice;
}
