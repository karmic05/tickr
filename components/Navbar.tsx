"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LineChart, Globe2, Search, Star, Sparkles, Sun, Moon } from "lucide-react";
import clsx from "clsx";
import SearchBar from "./SearchBar";

const LINKS = [
  { href: "/", label: "Markets", icon: LineChart },
  { href: "/exchanges", label: "Exchanges", icon: Globe2 },
  { href: "/analysis", label: "Analysis", icon: Sparkles },
  { href: "/watchlist", label: "Watchlist", icon: Star },
];

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored ? stored === "dark" : true;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 flex items-center h-16 gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white">
            <LineChart className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">Tickr</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "btn btn-ghost text-sm",
                  active && "bg-panel border-border text-fg"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 flex justify-end items-center gap-2">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
          <button onClick={toggle} className="btn btn-ghost p-2" aria-label="Toggle theme">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <nav className="md:hidden border-t border-border bg-panel/60">
        <div className="mx-auto max-w-7xl px-2 py-1 flex items-center gap-1 overflow-x-auto">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap",
                  active ? "bg-accent/10 text-accent" : "text-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
