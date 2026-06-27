import type { ReactNode } from "react";
import Link from "next/link";

const adminSections = [
  { href: "orders", label: "Orders" },
  { href: "menu", label: "Menu" },
  { href: "categories", label: "Categories" },
  { href: "tables", label: "Tables" },
  { href: "customers", label: "Customers" },
  { href: "analytics", label: "Analytics" },
  { href: "settings", label: "Settings" }
];

export default function RestaurantAdminLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: { restaurantSlug: string };
}>) {
  return (
    <div className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="glass-panel rounded-[2rem] p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            {params.restaurantSlug}
          </p>
          <nav className="mt-6 space-y-2">
            {adminSections.map((section) => (
              <Link
                key={section.href}
                className="block rounded-2xl px-4 py-3 text-sm text-white/72 transition hover:bg-white/5 hover:text-white"
                href={`/admin/${params.restaurantSlug}/${section.href}`}
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
