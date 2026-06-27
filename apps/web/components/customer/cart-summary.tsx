"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useSessionStore } from "@/stores/sessionStore";
import { formatCurrency } from "@/lib/utils/format";

type CartSummaryProps = {
  restaurantSlug: string;
  tableId?: string;
};

export function CartSummary({ restaurantSlug, tableId }: CartSummaryProps) {
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalItems = useCartStore((state) => state.totalItems());
  const clear = useCartStore((state) => state.clear);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const customerSessionToken = useSessionStore((state) => state.customerSessionToken);
  const [status, setStatus] = useState<string | null>(null);

  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const placeOrder = () => {
    void (async () => {
      setStatus("Placing order...");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantSlug,
          tableId,
          customerSessionToken,
          items: lines.map((line) => ({
            menuItemId: line.item.id,
            quantity: line.quantity
          }))
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setStatus(payload?.error?.message ?? "Unable to create order.");
        return;
      }

      clear();
      router.push(
        `/r/${restaurantSlug}/order/${payload.data.id}${
          tableId ? `?table=${tableId}` : ""
        }`
      );
    })();
  };

  return (
    <main className="section-shell py-14">
      <section className="glass-panel rounded-[2rem] p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              Cart review
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">
              Ready to place your order?
            </h2>
            <p className="section-subcopy">
              The cart persists locally so guests can continue the session even
              while the backend order endpoint is still being wired.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Items
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{totalItems}</p>
          </div>
        </div>
        {status ? (
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/70">
            {status}
          </div>
        ) : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          {lines.length > 0 ? (
            lines.map((line) => (
              <article
                key={line.item.id}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {line.item.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/60">
                      {line.item.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/45">Qty {line.quantity}</p>
                    <p className="mt-1 text-lg font-semibold text-amber-200">
                      {formatCurrency(line.item.price * line.quantity)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10"
                    type="button"
                    onClick={() => updateQuantity(line.item.id, line.quantity - 1)}
                  >
                    -
                  </button>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10"
                    type="button"
                    onClick={() => updateQuantity(line.item.id, line.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-400/10"
                    type="button"
                    onClick={() => removeItem(line.item.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
              Your cart is empty. Add items from the menu to continue.
            </div>
          )}
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Total
          </p>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              className="primary-button"
              type="button"
              disabled={lines.length === 0}
              onClick={placeOrder}
            >
              Place order
            </button>
            <Link
              className="secondary-button"
              href={`/r/${restaurantSlug}/menu${tableId ? `?table=${tableId}` : ""}`}
            >
              Back to menu
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
