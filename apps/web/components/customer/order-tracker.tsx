"use client";

import { useEffect, useMemo, useState } from "react";
import { customerOrderStatuses } from "./customer-data";
import { useLoyaltyStreak } from "@/hooks/useLoyaltyStreak";
import { formatDateTime } from "@/lib/utils/format";

type OrderTrackerProps = {
  restaurantSlug: string;
  orderId: string;
  tableId?: string;
};

export function OrderTracker({
  restaurantSlug,
  orderId,
  tableId
}: OrderTrackerProps) {
  const [statusIndex, setStatusIndex] = useState(2);
  const [statusNote, setStatusNote] = useState("Loading order details...");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      const payload = await response.json().catch(() => null);
      if (cancelled) {
        return;
      }

      if (!response.ok || !payload?.ok) {
        setStatusNote("Using local tracking fallback.");
        return;
      }

      const nextIndex = customerOrderStatuses.indexOf(payload.data.status);
      setStatusIndex(nextIndex >= 0 ? nextIndex : 2);
      setStatusNote(`Order loaded from the API at ${formatDateTime(payload.data.createdAt)}`);
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const status = customerOrderStatuses[statusIndex];
  const timeline = useMemo(
    () =>
      customerOrderStatuses.map((entry, index) => ({
        entry,
        complete: index <= statusIndex
      })),
    [statusIndex]
  );
  const streak = useLoyaltyStreak(7, 5);

  return (
    <main className="section-shell py-14">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          Order tracking
        </p>
        <h2 className="mt-4 text-4xl font-semibold text-white">
          Order {orderId}
        </h2>
        <p className="section-subcopy">
          {restaurantSlug} order status is visible here with a clean production
          layout. Realtime updates will plug in later.
        </p>
        <p className="mt-3 text-sm text-white/45">{statusNote}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Current status
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{status}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Table
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {tableId ?? "Not assigned"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Updated
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {formatDateTime(new Date())}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Live timeline
          </p>
          <div className="mt-5 space-y-4">
            {timeline.map((step) => (
              <div
                key={step.entry}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-semibold ${
                    step.complete
                      ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-white/50"
                  }`}
                >
                  {step.complete ? "✓" : "•"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{step.entry}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Loyalty
          </p>
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">
              Visit streak progress for this customer is tracked as events so we
              can compute rewards cleanly later.
            </p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Progress
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {streak.progress}/{streak.target}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
                {streak.remaining} left
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
