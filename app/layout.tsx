import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Tickr — Global Stock Market Tracker",
  description:
    "Live quotes, historical charts, search, and investment analysis across stock exchanges around the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="border-t border-border mt-16 py-6 text-center text-xs text-muted">
          Data via Yahoo Finance · For informational purposes only. Not investment advice.
        </footer>
      </body>
    </html>
  );
}
