import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#06101a_0%,#03060b_100%)] text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Café admin
            </p>
            <h1 className="mt-2 font-display text-xl font-semibold text-white">
              Admin workspace
            </h1>
          </div>
          <Link className="secondary-button text-sm" href="/">
            Public site
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
