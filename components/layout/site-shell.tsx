"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function navLinkClasses(isActive: boolean): string {
  return isActive
    ? "border-slate-950 bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
    : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-950";
}

export function SiteShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8 lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Smart Reviewer
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Search, review, and revisit completed analysis.
            </p>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${navLinkClasses(
                pathname === "/",
              )}`}
            >
              Search
            </Link>
            <Link
              href="/reviews"
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${navLinkClasses(
                pathname === "/reviews",
              )}`}
            >
              Reviews
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
