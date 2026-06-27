import { AdminSection } from "@/components/admin/admin-section";
import { StatCard } from "@/components/admin/stat-card";
import { Tag } from "@/components/admin/tag";

export default function SettingsPage({
  params
}: {
  params: { restaurantSlug: string };
}) {
  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          Settings
        </p>
        <h2 className="mt-4 text-4xl font-semibold text-white">
          Operational settings for {params.restaurantSlug}
        </h2>
        <p className="section-subcopy">
          These controls are the kind of guardrails a single café admin needs to
          manage QR ordering safely.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Orders open" value="Yes" helper="Customers can place QR orders" />
        <StatCard label="Tax rate" value="5%" helper="Configured at the restaurant level" />
        <StatCard label="Loyalty target" value="5 visits" helper="Reward cycle length" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <AdminSection
          title="Operational controls"
          description="Keep the café online, keep the QR journey healthy, and expose the right toggles for daily management."
        >
          <div className="grid gap-4">
            {[
              ["Accepting orders", "Enabled", "success"],
              ["Table QR regeneration", "Ready", "default"],
              ["Menu visibility", "Live", "success"],
              ["Payment callback", "Configured", "warning"]
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="mt-1 text-sm text-white/55">{value}</p>
                </div>
                <Tag tone={tone as "success" | "warning" | "default"}>{value}</Tag>
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection
          title="Hardening checklist"
          description="A quick view of the operational checks that matter before launch."
        >
          <div className="space-y-3 text-sm text-white/70">
            <p>• Customer OTP path is available in the UI.</p>
            <p>• Restaurant and menu endpoints return demo-backed data.</p>
            <p>• Cart validates against the menu catalog.</p>
            <p>• Orders can be created and tracked with the route handlers.</p>
            <p>• Jarvis remains disabled for this phase.</p>
          </div>
        </AdminSection>
      </div>
    </main>
  );
}
