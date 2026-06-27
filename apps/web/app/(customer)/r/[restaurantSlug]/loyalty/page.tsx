"use client";

import { useEffect, useState } from "react";
import { createRepositoryFromServer } from "@/lib/supabase-repository";
import { formatCurrency } from "@/lib/utils/format";
import { useSessionStore } from "@/stores/sessionStore";
import { useRouter } from "next/navigation";
import { formatCurrency as formatCurrencyHelper } from "@/lib/utils/format";

interface LoyaltyStatus {
  visitCount: number;
  target: number;
  currentProgress: number;
  remaining: number;
  rewards: any[];
}

export default function LoyaltyPage({
  params
}: {
  params: { restaurantSlug: string };
}) {
  const [status, setStatus] = useState<LoyaltyStatus | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const session = useSessionStore();

  useEffect(() => {
    async function loadData() {
      // Check session
      if (!session.customerId || !session.customerSessionToken) {
        router.push(`/r/${params.restaurantSlug}/entry`);
        return;
      }

      try {
        const repository = createRepositoryFromServer();

        // Fetch restaurant
        const restaurantData = await repository.getRestaurantBySlug(params.restaurantSlug);
        if (!restaurantData) {
          setLoading(false);
          return;
        }
        setRestaurant(restaurantData);

        // Fetch loyalty status
        const loyaltyData = await repository.getCustomerLoyaltyStatus(
          session.customerId,
          restaurantData.id
        );

        if (loyaltyData) {
          setStatus(loyaltyData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading loyalty data:", error);
        setLoading(false);
      }
    }

    loadData();
  }, [session.customerId, session.customerSessionToken, params.restaurantSlug, router]);

  if (loading) {
    return (
      <main className="section-shell py-14">
        <div className="text-center">
          <p className="text-white/60">Loading loyalty data...</p>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="section-shell py-14">
        <div className="text-center">
          <p className="text-white/60">Restaurant not found</p>
        </div>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="section-shell py-14">
        <div className="text-center">
          <p className="text-white/60">Unable to load loyalty details</p>
        </div>
      </main>
    );
  }

  const { visitCount, target, currentProgress, remaining, rewards } = status;
  const averageTicketValue = 220;

  return (
    <main className="section-shell py-14">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          Loyalty
        </p>
        <h2 className="mt-4 text-4xl font-semibold text-white">
          {restaurant.name} rewards
        </h2>
        <p className="section-subcopy">
          Collect visits and earn rewards! You're on a {visitCount} visit streak.
        </p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Progress to Reward
          </p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-sm text-white/60">Visits toward reward</p>
              <p className="mt-2 text-4xl font-semibold text-white">
                {currentProgress}/{target}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {remaining} remaining
            </div>
          </div>

          <div className="mt-6 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all"
              style={{ width: `${(currentProgress / target) * 100}%` }}
            />
          </div>
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Reward Info
          </p>
          <p className="mt-4 text-lg font-semibold text-white">
            {restaurant.loyaltyRewardDescription || "Free item reward"}
          </p>
          <p className="mt-3 text-sm text-white/60">
            Approximate value planning can later be tied to the menu pricing
            model. Example average ticket value: {formatCurrency(averageTicketValue)}.
          </p>
        </aside>
      </div>

      {rewards && rewards.length > 0 && (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Your Rewards
          </p>
          <div className="mt-6 space-y-3">
            {rewards.map((reward: any) => (
              <div
                key={reward.id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {reward.description || `Reward #${reward.milestone_number}`}
                  </p>
                  <p className="text-xs text-white/50">
                    {reward.status === "redeemed" ? "✓ Redeemed" : "Awaiting redemption"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    reward.status === "redeemed"
                      ? "bg-green-500/20 text-green-200"
                      : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {reward.status === "redeemed" ? "Redeemed" : "Active"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
