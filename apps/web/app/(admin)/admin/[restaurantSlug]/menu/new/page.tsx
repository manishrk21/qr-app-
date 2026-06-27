import Link from "next/link";
import { demoCategories } from "@/components/admin/admin-data";

export default function NewMenuItemPage({
  params
}: {
  params: { restaurantSlug: string };
}) {
  return (
    <main className="glass-panel rounded-[2rem] p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
        New menu item
      </p>
      <h2 className="mt-4 text-4xl font-semibold text-white">
        Add an item for {params.restaurantSlug}
      </h2>
      <p className="section-subcopy">
        This form is ready for the create-item API. For now it gives us the
        right production-grade structure and UX.
      </p>

      <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/70" htmlFor="name">
                Item name
              </label>
              <input
                id="name"
                placeholder="Cinnamon Latte"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              />
            </div>
            <div>
              <label className="text-sm text-white/70" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                placeholder="220"
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="A balanced house blend with a warm cinnamon finish."
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/70" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
              >
                {demoCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70" htmlFor="food-type">
                Food type
              </label>
              <select
                id="food-type"
                defaultValue="veg"
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
              <input type="checkbox" defaultChecked />
              Available
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" defaultChecked />
              Featured
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
              <input type="checkbox" />
              Add allergens
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="primary-button" type="button">
              Save item
            </button>
            <Link className="secondary-button" href={`/admin/${params.restaurantSlug}/menu`}>
              Back to menu
            </Link>
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Preview
          </p>
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="h-36 rounded-[1.2rem] bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(56,189,248,0.12))]" />
            <h3 className="mt-4 text-2xl font-semibold text-white">
              Cinnamon Latte
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/60">
              A balanced house blend with a warm cinnamon finish.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-white/45">Coffee</span>
              <span className="text-lg font-semibold text-amber-200">₹220</span>
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
}
