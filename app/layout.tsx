import type { Metadata } from "next";
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
