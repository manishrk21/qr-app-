"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/utils/format";
import type { MenuItem } from "@/types/domain";
import { getCustomerCategoryName } from "./customer-data";

type MenuBrowserProps = {
  restaurantSlug: string;
  tableId?: string;
};

function MenuCard({
  item,
  onAdd
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
      {item.imageUrl ? (
        <div className="relative h-44 overflow-hidden rounded-[1.5rem] bg-slate-900/70">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
              {item.foodType.replace("_", " ")}
            </span>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
              {getCustomerCategoryName(item.categoryId)}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">{item.name}</h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            item.isAvailable
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : "border-white/10 bg-white/5 text-white/55"
          }`}
        >
          {item.isAvailable ? "Available" : "Sold out"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-amber-200">
            {formatCurrency(item.price)}
          </p>
          <p className="text-xs text-white/45">
            {item.preparationTimeMinutes
              ? `${item.preparationTimeMinutes} min prep`
              : "Quick serve"}
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          disabled={!item.isAvailable}
          onClick={() => onAdd(item)}
        >
          Add
        </button>
      </div>
    </article>
  );
}

export function MenuBrowser({ restaurantSlug, tableId }: MenuBrowserProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadStatus, setLoadStatus] = useState("Loading menu...");
  const addItem = useCartStore((state) => state.addItem);
  const setRestaurant = useCartStore((state) => state.setRestaurant);
  const currentRestaurantSlug = useCartStore((state) => state.restaurantSlug);
  const cartLines = useCartStore((state) => state.lines);
  const cartSubtotal = useCartStore((state) => state.subtotal());
  const cartItems = useCartStore((state) => state.totalItems());
  const clearCart = useCartStore((state) => state.clear);

  useEffect(() => {
    if (currentRestaurantSlug && currentRestaurantSlug !== restaurantSlug) {
      clearCart();
    }
    setRestaurant(restaurantSlug);
  }, [clearCart, currentRestaurantSlug, restaurantSlug, setRestaurant]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/menu`);
      const payload = await response.json().catch(() => null);
      if (cancelled) {
        return;
      }

      if (!response.ok || !payload?.ok) {
        setLoadStatus("Menu unavailable right now.");
        return;
      }

      setCategories(payload.data.categories);
      setItems(payload.data.items);
      setLoadStatus("Menu loaded from the API.");
    })();

    return () => {
      cancelled = true;
    };
  }, [restaurantSlug]);

  const filteredItems = items.filter(
    (item) => activeCategory === "all" || item.categoryId === activeCategory
  );

  return (
    <main className="section-shell py-14">
      <section className="glass-panel rounded-[2rem] p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              Browse menu
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">
              Menu for {restaurantSlug}
            </h2>
            <p className="section-subcopy">
              Browse featured items, add them to cart, and keep the session tied
              to the QR table context.
            </p>
            <p className="mt-3 text-sm text-white/45">{loadStatus}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Table
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {tableId ?? "Not assigned"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className={`rounded-full border px-4 py-2 text-sm ${
              activeCategory === "all"
                ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                : "border-white/10 bg-white/5 text-white/70"
            }`}
            type="button"
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`rounded-full border px-4 py-2 text-sm ${
                activeCategory === category.id
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                  : "border-white/10 bg-white/5 text-white/70"
              }`}
              type="button"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addItem} />
            ))}
            {filteredItems.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-white/55">
                No menu items found for this restaurant yet.
              </div>
            ) : null}
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-white/65">
            Featured items, sold-out states, and the cart state are already wired
            locally so the next step can focus on backend order creation.
          </div>
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Quick cart
          </p>
          <div className="mt-4 space-y-4">
            {cartLines.length > 0 ? (
              cartLines.map((line) => (
                <div
                  key={line.item.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{line.item.name}</p>
                      <p className="text-xs text-white/45">
                        {getCustomerCategoryName(line.item.categoryId)} • Qty {line.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-amber-200">
                      {formatCurrency(line.item.price * line.quantity)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-white/55">
                No items yet. Add a menu item to start the cart.
              </div>
            )}
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>{cartItems} items</span>
              <span>{formatCurrency(cartSubtotal)}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              className="primary-button"
              type="button"
              onClick={() =>
                router.push(
                  `/r/${restaurantSlug}/cart${tableId ? `?table=${tableId}` : ""}`
                )
              }
            >
              View cart
            </button>
            <Link className="secondary-button" href={`/r/${restaurantSlug}`}>
              Change entry
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
