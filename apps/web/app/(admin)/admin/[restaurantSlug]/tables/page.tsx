import Link from "next/link";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminTable } from "@/components/admin/admin-table";
import { StatCard } from "@/components/admin/stat-card";
import { Tag } from "@/components/admin/tag";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { generateQrCodeDataUrl } from "@/lib/qr/generate";

export default async function TablesPage({
  params
}: {
  params: { restaurantSlug: string };
}) {
  const repository = createRepositoryFromAdmin();
  const restaurant = await repository.getRestaurantBySlug(params.restaurantSlug);

  if (!restaurant) {
    return (
      <main className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-red-200/80">Error</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Restaurant not found</h2>
        </section>
      </main>
    );
  }

  const tables = await repository.getTablesByRestaurantId(restaurant.id);
  const activeCount = tables.filter((table) => table.isActive).length;
  const tablesWithQr = await Promise.all(
    tables.map(async (table) => ({
      ...table,
      qrCodeUrl:
        table.qrCodeUrl ||
        (await generateQrCodeDataUrl(`${params.restaurantSlug}:${table.id}:${table.label}`))
    }))
  );

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Table and QR management</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Tables for {params.restaurantSlug}</h2>
        <p className="section-subcopy">
          Each table gets a stable QR identity. This page is already set up for table creation, QR previews, and activation control.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Total tables" value={String(tables.length)} helper="Configured seating rows" />
          <StatCard label="Active tables" value={String(activeCount)} helper="Currently open for guests" />
          <StatCard label="Inactive tables" value={String(tables.length - activeCount)} helper="Temporarily closed" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <AdminSection
          title="Table registry"
          description="This registry can be connected to create, update, and deactivate table actions."
          action={<Link className="secondary-button text-sm" href={`/admin/${params.restaurantSlug}/settings`}>Table settings</Link>}
        >
          <AdminTable
            rows={tablesWithQr}
            emptyLabel="No tables yet."
            columns={[
              {
                header: "Table",
                render: (table) => (
                  <div>
                    <div className="font-medium text-white">{table.label}</div>
                    <div className="mt-1 text-xs text-white/55">Code {table.shortCode} • Capacity {table.capacity ?? "—"}</div>
                  </div>
                )
              },
              {
                header: "QR",
                render: (table) => (
                  <img
                    alt={`${table.label} QR code`}
                    src={table.qrCodeUrl}
                    width={84}
                    height={84}
                    className="rounded-2xl border border-white/10 bg-white p-1"
                  />
                )
              },
              {
                header: "Status",
                render: (table) => (
                  <Tag tone={table.isActive ? "success" : "muted"}>{table.isActive ? "Active" : "Inactive"}</Tag>
                )
              }
            ]}
          />
        </AdminSection>

        <AdminSection title="New table" description="The create-table form shell is ready for the backend route.">
          <form className="space-y-4">
            <div>
              <label className="text-sm text-white/70" htmlFor="table-label">Table label</label>
              <input
                id="table-label"
                placeholder="Patio 1"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70" htmlFor="table-capacity">Capacity</label>
                <input
                  id="table-capacity"
                  placeholder="4"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                />
              </div>
              <div>
                <label className="text-sm text-white/70" htmlFor="table-shortcode">Short code</label>
                <input
                  id="table-shortcode"
                  placeholder="P1"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" defaultChecked />
              Table active
            </label>
            <button className="primary-button w-full" type="button">Create table</button>
          </form>
        </AdminSection>
      </div>
    </main>
  );
}
