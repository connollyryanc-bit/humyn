import type { Metadata } from "next";
import { RoleProvider } from "./components/role-context";
import { sons, valtechNeue } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "humyn — people intelligence",
  description: "Valtech Nordic's people intelligence platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${valtechNeue.variable} ${sons.variable}`}>
      <body>
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
