import type { Metadata } from "next";
import { RoleProvider } from "./components/role-context";
import { body, display } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "humyn — people intelligence",
  description: "People intelligence for the AI era.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
