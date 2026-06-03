import { ScopeProvider } from "./scope-context";

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return <ScopeProvider>{children}</ScopeProvider>;
}
