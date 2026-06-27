import type { ReactNode } from "react";
import Link from "next/link";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#phases", label: "Phases" },
  { href: "#admin", label: "Admin" },
  { href: "#contact", label: "Contact" }
];

export default function MarketingLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
        <div className="section-shell flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400 text-base font-black text-slate-950">
              M
            </span>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight text-white">
                MenuFlow
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                QR ordering SaaS
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                className="text-sm text-white/70 transition hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link className="secondary-button text-sm" href="/admin/login">
            Admin login
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
