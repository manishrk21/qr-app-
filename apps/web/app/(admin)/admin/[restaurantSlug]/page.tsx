import Link from "next/link";

export default function RestaurantAdminHomePage({
  params
}: {
  params: { restaurantSlug: string };
}) {
  return (
    <main className="glass-panel rounded-[2rem] p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
        Dashboard
      </p>
      <h2 className="mt-4 text-4xl font-semibold text-white">
        {params.restaurantSlug} control center
      </h2>
      <p className="section-subcopy">
        This shell will become the daily operations hub for the restaurant
        admin.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="primary-button" href={`/admin/${params.restaurantSlug}/orders`}>
          View orders
        </Link>
        <Link className="secondary-button" href={`/admin/${params.restaurantSlug}/menu`}>
          Edit menu
        </Link>
      </div>
    </main>
  );
}
