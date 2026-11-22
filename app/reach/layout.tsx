import type { Metadata } from "next";
import { ReachChrome } from "./chrome";

export const metadata: Metadata = {
  title: "humyn reach — sales intelligence",
  description: "Profile prospects, write messages that land, and automate outreach.",
};

export default function ReachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F1F3EE" }}>
      <ReachChrome />
      {children}
    </div>
  );
}
