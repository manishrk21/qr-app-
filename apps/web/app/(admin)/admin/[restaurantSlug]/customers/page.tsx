export default function CustomersPage({
  params
}: {
  params: { restaurantSlug: string };
}) {
  return (
    <main className="glass-panel rounded-[2rem] p-8">
      <h2 className="text-3xl font-semibold text-white">Customers</h2>
      <p className="section-subcopy">
        Per-restaurant customer records for {params.restaurantSlug} will be
        shown here.
      </p>
    </main>
  );
}
