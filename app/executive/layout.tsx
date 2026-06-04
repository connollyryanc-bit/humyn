"use client";

import { ScopeProvider } from "./scope-context";
import { canAccessExecutive, useRole } from "../components/role-context";
import { RestrictedPage } from "../components/restricted";

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const { role, ready } = useRole();
  const restricted = ready && !canAccessExecutive(role);
  return (
    <ScopeProvider>
      {restricted ? (
        <RestrictedPage
          env="executive"
          currentPath="/executive"
          module="Executive · Workforce intelligence"
          title="Executive environment"
          reason="The executive environment is reserved for the C-suite and Admin. It surfaces firm-wide financial, workforce and strategic data that's outside the scope of operational roles."
          requiredRoles={["c-suite", "admin"]}
          backHref="/"
          backLabel="Back to People"
        />
      ) : (
        children
      )}
    </ScopeProvider>
  );
}
