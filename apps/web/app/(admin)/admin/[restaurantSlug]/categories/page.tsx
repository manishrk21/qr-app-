import { AdminSection } from "@/components/admin/admin-section";
import { AdminTable } from "@/components/admin/admin-table";
import { StatCard } from "@/components/admin/stat-card";
import { Tag } from "@/components/admin/tag";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";

export default async function CategoriesPage({
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

  const categories = await repository.getCategoriesByRestaurantId(restaurant.id);
  const activeCount = categories.filter((category) => category.isActive).length;

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Category management</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Organize the menu for {params.restaurantSlug}</h2>
        <p className="section-subcopy">
          Categories group items for the customer menu and the admin menu editor.
          This screen is structured for real CRUD operations.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total categories" value={String(categories.length)} helper="All category rows" />
          <StatCard label="Active categories" value={String(activeCount)} helper="Visible to customers" />
          <StatCard label="Hidden categories" value={String(categories.length - activeCount)} helper="Temporarily unavailable" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AdminSection
          title="Category listing"
          description="This table is ready to become the editable management view once the API routes are wired to Supabase."
        >
          <AdminTable
            rows={categories}
            emptyLabel="No categories yet."
            columns={[
              {
                header: "Name",
                render: (category) => (
                  <div>
                    <div className="font-medium text-white">{category.name}</div>
                    <div className="mt-1 text-xs text-white/55">{category.description}</div>
                  </div>
                )
              },
              {
                header: "Status",
                render: (category) => (
                  <Tag tone={category.isActive ? "success" : "muted"}>
                    {category.isActive ? "Active" : "Hidden"}
                  </Tag>
                )
              }
            ]}
          />
        </AdminSection>

        <AdminSection title="Create category" description="Production-friendly form shell for adding a new category.">
          <form className="space-y-4">
            <div>
              <label className="text-sm text-white/70" htmlFor="category-name">Category name</label>
              <input
                id="category-name"
                placeholder="Seasonal drinks"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              />
            </div>
            <div>
              <label className="text-sm text-white/70" htmlFor="category-description">Description</label>
              <textarea
                id="category-description"
                rows={5}
                placeholder="Drinks that are featured for a limited time."
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" defaultChecked />
              Category active
            </label>
            <button className="primary-button w-full" type="button">Save category</button>
          </form>
        </AdminSection>
      </div>
    </main>
  );
}
