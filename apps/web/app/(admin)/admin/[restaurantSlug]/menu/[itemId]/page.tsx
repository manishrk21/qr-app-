import Link from "next/link";
import { Tag } from "@/components/admin/tag";
import { demoCategories, demoMenuItems } from "@/components/admin/admin-data";
import { formatCurrency } from "@/lib/utils/format";

export default function MenuItemPage({
  params
}: {
  params: { restaurantSlug: string; itemId: string };
}) {
  const item = demoMenuItems.find((menuItem) => menuItem.id === params.itemId) ?? demoMenuItems[0];
  const category = demoCategories.find((entry) => entry.id === item.categoryId);

  return (
    <main className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          Menu item editor
        </p>
        <h2 className="mt-4 text-4xl font-semibold text-white">{item.name}</h2>
        <p className="section-subcopy">
          Editing item {params.itemId} for {params.restaurantSlug}. The form is
          aligned with a production CRUD editor and ready for save actions.
        </p>

        <form className="mt-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/70" htmlFor="edit-name">
                Name
              </label>
              <input
                id="edit-name"
                defaultValue={item.name}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              />
            </div>
            <div>
              <label className="text-sm text-white/70" htmlFor="edit-price">
                Price
              </label>
              <input
                id="edit-price"
                defaultValue={String(item.price)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70" htmlFor="edit-description">
              Description
            </label>
            <textarea
              id="edit-description"
              defaultValue={item.description ?? ""}
              rows={6}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/70" htmlFor="edit-category">
                Category
              </label>
              <select
                id="edit-category"
                defaultValue={item.categoryId}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              >
                {demoCategories.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70" htmlFor="edit-food-type">
                Food type
              </label>
              <select
                id="edit-food-type"
                defaultValue={item.foodType}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              >
                <option value="veg">Veg</option>
                <option value="non_veg">Non veg</option>
                <option value="egg">Egg</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" defaultChecked={item.isAvailable} />
              Available
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" defaultChecked={item.isFeatured} />
              Featured
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" />
              Track allergens
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="primary-button" type="button">
              Save changes
            </button>
            <Link className="secondary-button" href={`/admin/${params.restaurantSlug}/menu`}>
              Back to menu
            </Link>
          </div>
        </form>
      </section>

      <aside className="glass-panel rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">
          Live summary
        </p>
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Tag tone={item.isAvailable ? "success" : "danger"}>
              {item.isAvailable ? "available" : "unavailable"}
            </Tag>
            <h3 className="mt-4 text-2xl font-semibold text-white">{item.name}</h3>
            <p className="mt-2 text-sm leading-7 text-white/60">
              {item.description}
            </p>
            <p className="mt-4 text-2xl font-semibold text-amber-200">
              {formatCurrency(item.price)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-white/65">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Category
            </p>
            <p className="mt-3 text-base text-white">{category?.name ?? "Unassigned"}</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
