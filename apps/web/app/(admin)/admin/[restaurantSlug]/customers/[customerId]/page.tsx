import { Tag } from "@/components/admin/tag";
import { formatDateTime } from "@/lib/utils/format";

export default function CustomerDetailPage({
  params
}: {
  params: { restaurantSlug: string; customerId: string };
}) {
  return (
    <main className="glass-panel rounded-[2rem] p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
        Customer details
      </p>
      <h2 className="mt-4 text-4xl font-semibold text-white">
        Customer {params.customerId}
      </h2>
      <p className="section-subcopy">
        The detail view is ready for customer history, visit streaks, and order
        notes for {params.restaurantSlug}.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Status
          </p>
          <div className="mt-3">
            <Tag tone="success">Active customer</Tag>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Last visit
          </p>
          <p className="mt-3 text-lg font-semibold text-white">
            {formatDateTime(new Date())}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Visits
          </p>
          <p className="mt-3 text-lg font-semibold text-white">7</p>
        </div>
      </div>
    </main>
  );
}
