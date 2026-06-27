import { AdminSection } from "@/components/admin/admin-section";
import { Tag } from "@/components/admin/tag";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { OrderStatusActions } from "@/components/admin/order-status-actions";

export default async function OrdersPage({
  params
}: {
  params: { restaurantSlug: string };
}) {
  try {
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

    const orders = await repository.getOrdersByRestaurantId(restaurant.id);

    const statusCounts = {
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      cancelRequested: orders.filter((o) => o.status === "cancel_requested").length
    };

    return (
      <main className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Order board</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Live operations for {params.restaurantSlug}</h2>
          <p className="section-subcopy">Real-time order statuses from Supabase, kitchen flow, and cashier review.</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {orders.slice(0, 6).map((order) => (
            <article key={order.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{order.id}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">Order</h3>
                </div>
                <Tag
                  tone={
                    order.status === "ready"
                      ? "warning"
                      : order.status === "paid"
                      ? "success"
                      : order.status === "cancel_requested"
                      ? "danger"
                      : "default"
                  }
                >
                  {order.status}
                </Tag>
              </div>

              <div className="mt-5 space-y-2 text-sm text-white/68">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Placed</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
              </div>

              <div className="mt-5">
                <OrderStatusActions orderId={order.id} currentStatus={order.status} />
              </div>
            </article>
          ))}
        </div>

        <AdminSection title="Operational queue" description="Order status distribution across the kitchen and cashier flow.">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Pending", statusCounts.pending],
              ["Paid", statusCounts.paid],
              ["Preparing", statusCounts.preparing],
              ["Ready", statusCounts.ready],
              ["Cancel requested", statusCounts.cancelRequested]
            ].map(([label, count]) => (
              <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{count}</p>
              </div>
            ))}
          </div>
        </AdminSection>
      </main>
    );
  } catch (error) {
    console.error("Orders page error:", error);
    return (
      <main className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-red-200/80">Error</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Failed to load orders</h2>
        </section>
      </main>
    );
  }
}
