import type { ReactNode } from "react";
import Link from "next/link";

export default function CustomerLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Customer ordering
            </p>
            <h1 className="mt-2 font-display text-xl font-semibold text-white">
              MenuFlow guest flow
            </h1>
          </div>
          <Link className="secondary-button text-sm" href="/">
            Home
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
