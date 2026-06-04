"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ROLES,
  Role,
  ROLE_LABEL,
  canAccessExecutive,
  canEditPeople,
  canEditRateCard,
  canSeeCosts,
  canSeeDayRate,
  canSeeFinancials,
  canSeeSalary,
} from "../lib/roles";

interface RoleState {
  email: string | null;
  signedIn: boolean;
  /** The role the server resolved for the signed-in user. Source of truth. */
  realRole: Role;
  /** The role the user is currently viewing as. May be a localStorage override. */
  role: Role;
  /** True if the active role differs from the real role. */
  isImpersonating: boolean;
  setViewAs: (role: Role | null) => void;
  ready: boolean;
}

const RoleContext = createContext<RoleState | null>(null);

const STORAGE_KEY = "humyn.view-as-role.v1";
const DEFAULT_ROLE: Role = "capacity-manager";

function readOverride(): Role | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v && (ROLES as readonly string[]).includes(v)) return v as Role;
  } catch {
    // ignore
  }
  return null;
}

function writeOverride(role: Role | null) {
  if (typeof window === "undefined") return;
  try {
    if (role) window.localStorage.setItem(STORAGE_KEY, role);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [realRole, setRealRole] = useState<Role>(DEFAULT_ROLE);
  const [email, setEmail] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [override, setOverride] = useState<Role | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setOverride(readOverride());
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data && (ROLES as readonly string[]).includes(data.role)) {
          setRealRole(data.role as Role);
        }
        setEmail(data?.email ?? null);
        setSignedIn(Boolean(data?.signedIn));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setViewAs = useCallback((next: Role | null) => {
    setOverride(next);
    writeOverride(next);
  }, []);

  const value = useMemo<RoleState>(() => {
    const active = override ?? realRole;
    return {
      email,
      signedIn,
      realRole,
      role: active,
      isImpersonating: Boolean(override && override !== realRole),
      setViewAs,
      ready,
    };
  }, [override, realRole, email, signedIn, setViewAs, ready]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleState {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    // Provider not mounted — return a safe default so non-provider trees still work.
    return {
      email: null,
      signedIn: false,
      realRole: DEFAULT_ROLE,
      role: DEFAULT_ROLE,
      isImpersonating: false,
      setViewAs: () => {},
      ready: false,
    };
  }
  return ctx;
}

/** Render `children` only if the predicate returns true for the active role. */
export function RoleGate({
  can,
  children,
  fallback = null,
}: {
  can: (role: Role) => boolean;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useRole();
  return <>{can(role) ? children : fallback}</>;
}

// Re-export the gates so consumers can import everything from one place.
export {
  canAccessExecutive,
  canEditPeople,
  canEditRateCard,
  canSeeCosts,
  canSeeDayRate,
  canSeeFinancials,
  canSeeSalary,
  ROLE_LABEL,
  ROLES,
};
export type { Role };
