import type { Metadata } from "next";
import { CustomerEntry } from "@/components/customer/customer-entry";
import { createRepositoryFromServer } from "@/lib/supabase-repository";

export function generateMetadata({
  params
}: {
  params: { restaurantSlug: string };
}): Metadata {
  return {
    title: `${params.restaurantSlug} entry`,
    description: "Customer entry gate for QR and OTP access."
  };
}

export default async function RestaurantEntryPage({
  params,
  searchParams
}: {
  params: { restaurantSlug: string };
  searchParams?: { table?: string };
}) {
  try {
    const repository = createRepositoryFromServer();
    const restaurant = await repository.getRestaurantBySlug(params.restaurantSlug);

    if (!restaurant) {
      return (
        <main className="section-shell py-14">
          <section className="glass-panel rounded-[2rem] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-red-200/80">
              Error
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">
              Restaurant not found
            </h2>
          </section>
        </main>
      );
    }

    return (
      <CustomerEntry
        restaurantSlug={params.restaurantSlug}
        restaurantName={restaurant.name}
        restaurantCity={restaurant.city}
        tableId={searchParams?.table}
      />
    );
  } catch (error) {
    console.error("Error loading restaurant:", error);
    return (
      <main className="section-shell py-14">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-red-200/80">
            Error
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-white">
            Failed to load restaurant
          </h2>
        </section>
      </main>
    );
  }
}
