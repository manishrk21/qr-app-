import Link from "next/link";
import { AdminSection } from "@/components/admin/admin-section";
import { ActionLink, AdminTable } from "@/components/admin/admin-table";
import { StatCard } from "@/components/admin/stat-card";
import { Tag } from "@/components/admin/tag";
import { formatCurrency } from "@/lib/utils/format";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";

export default async function AdminMenuPage({
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

  const catalog = await repository.getMenuCatalogByRestaurantSlug(params.restaurantSlug);

  if (!catalog) {
    return (
      <main className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-red-200/80">Error</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Menu catalog not found</h2>
        </section>
      </main>
    );
  }

  const categoryMap = catalog.categories.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {});

  const counts = {
    total: catalog.items.length,
    available: catalog.items.filter((item) => item.isAvailable).length,
    featured: catalog.items.filter((item) => item.isFeatured).length
  };

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Menu management</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Build and control the menu for {params.restaurantSlug}</h2>
            <p className="section-subcopy">
              Menu management starts here: categories, pricing, featured items, and availability.
              The page is already shaped for production CRUD.
            </p>
          </div>
          <Link className="primary-button" href={`/admin/${params.restaurantSlug}/menu/new`}>Add item</Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Total items" value={String(counts.total)} helper="All configured menu records" />
          <StatCard label="Available" value={String(counts.available)} helper="Visible to customers right now" />
          <StatCard label="Featured" value={String(counts.featured)} helper="Highlighted on the first screen" />
        </div>
      </section>

      <AdminSection
        title="Menu overview"
        description="This is the main listing view. Each row can become a detail page, editor, or availability toggle once the API mutation layer is connected."
        action={<ActionLink href={`/admin/${params.restaurantSlug}/menu/new`}>Create menu item</ActionLink>}
      >
        <AdminTable
          rows={catalog.items}
          emptyLabel="No menu items yet."
          columns={[
            {
              header: "Item",
              render: (item) => (
                <div>
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="mt-1 text-xs text-white/55">{categoryMap[item.categoryId] ?? "Uncategorized"}</div>
                </div>
              )
            },
            {
              header: "Price",
              render: (item) => formatCurrency(item.price)
            },
            {
              header: "Type",
              render: (item) => (
                <Tag tone={item.foodType === "veg" ? "success" : item.foodType === "egg" ? "warning" : "default"}>
                  {item.foodType.replace("_", " ")}
                </Tag>
              )
            },
            {
              header: "Availability",
              render: (item) => (
                <Tag tone={item.isAvailable ? "success" : "danger"}>{item.isAvailable ? "Available" : "Hidden"}</Tag>
              )
            },
            {
              header: "Action",
              render: (item) => (
                <Link
                  className="text-amber-200 transition hover:text-amber-100"
                  href={`/admin/${params.restaurantSlug}/menu/${item.id}`}
                >
                  Edit
                </Link>
              )
            }
          ]}
        />
      </AdminSection>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <AdminSection
          title="Category snapshot"
          description="Categories are already modeled in the database and ready to be wired to the CRUD actions."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {catalog.categories.map((category) => (
              <article key={category.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                  <Tag tone={category.isActive ? "success" : "muted"}>{category.isActive ? "Active" : "Hidden"}</Tag>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">{category.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">
                  {catalog.items.filter((item) => item.categoryId === category.id).length} items
                </p>
              </article>
            ))}
          </div>
        </AdminSection>

        <AdminSection
          title="Quick create"
          description="A production form shell for adding new menu items. Backend mutation wiring comes next."
        >
          <form className="space-y-4">
            <div>
              <label className="text-sm text-white/70" htmlFor="item-name">Item name</label>
              <input
                id="item-name"
                defaultValue="Signature Cold Brew"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/35 focus:border-amber-400/50"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70" htmlFor="item-price">Price</label>
                <input
                  id="item-price"
                  defaultValue="180"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                />
              </div>
              <div>
                <label className="text-sm text-white/70" htmlFor="item-category">Category</label>
                <select
                  id="item-category"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                >
                  {catalog.categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="primary-button w-full" type="button">Save draft</button>
          </form>
        </AdminSection>
      </div>
    </main>
  );
}

        <AdminTable
          rows={demoMenuItems}
          emptyLabel="No menu items yet."
          columns={[
            {
              header: "Item",
              render: (item) => (
                <div>
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="mt-1 text-xs text-white/55">{item.categoryName}</div>
                </div>
              )
            },
            {
              header: "Price",
              render: (item) => formatCurrency(item.price)
            },
            {
              header: "Type",
              render: (item) => <Tag tone={item.foodType === "veg" ? "success" : item.foodType === "egg" ? "warning" : "default"}>{item.foodType.replace("_", " ")}</Tag>
            },
            {
              header: "Availability",
              render: (item) => (
                <Tag tone={item.isAvailable ? "success" : "danger"}>
                  {item.stockLabel}
                </Tag>
              )
            },
            {
              header: "Action",
              render: (item) => (
                <Link
                  className="text-amber-200 transition hover:text-amber-100"
                  href={`/admin/${params.restaurantSlug}/menu/${item.id}`}
                >
                  Edit
                </Link>
              )
            }
          ]}
        />
      </AdminSection>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <AdminSection
          title="Category snapshot"
          description="Categories are already modeled in the database and ready to be wired to the CRUD actions."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {demoCategories.map((category) => (
              <article
                key={category.id}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                  <Tag tone={category.isActive ? "success" : "muted"}>
                    {category.isActive ? "Active" : "Hidden"}
                  </Tag>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {category.description}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">
                  {category.itemCount} items
                </p>
              </article>
            ))}
          </div>
        </AdminSection>

        <AdminSection
          title="Quick create"
          description="A production form shell for adding new menu items. Backend mutation wiring comes next."
        >
          <form className="space-y-4">
            <div>
              <label className="text-sm text-white/70" htmlFor="item-name">
                Item name
              </label>
              <input
                id="item-name"
                defaultValue="Signature Cold Brew"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/35 focus:border-amber-400/50"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70" htmlFor="item-price">
                  Price
                </label>
                <input
                  id="item-price"
                  defaultValue="180"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                />
              </div>
              <div>
                <label className="text-sm text-white/70" htmlFor="item-category">
                  Category
                </label>
                <select
                  id="item-category"
                  defaultValue="cat-coffee"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                >
                  {catalog.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="primary-button w-full" type="button">
              Save draft
            </button>
          </form>
        </AdminSection>
      </div>
    </main>
  );
}
