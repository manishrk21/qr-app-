import Link from "next/link";

const highlights = [
  "Single-tenant admin per café",
  "QR-first customer experience",
  "Supabase-backed data isolation",
  "Built for production ops"
];

const phases = [
  {
    title: "Foundation",
    description:
      "Workspace setup, shared types, app shell, and stable visual system."
  },
  {
    title: "Identity",
    description:
      "Restaurant lookup, OTP entry, and a secure customer session layer."
  },
  {
    title: "Operations",
    description:
      "Menu, categories, tables, and order management for the café admin."
  },
  {
    title: "Growth",
    description:
      "Loyalty, analytics, notifications, and operational hardening."
  }
];

export default function MarketingPage() {
  return (
    <main>
      <section className="section-shell grid gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-28">
        <div>
          <span className="chip">Production-ready QR ordering for cafés</span>
          <h1 className="hero-title mt-6 max-w-4xl">
            MenuFlow gives each café one sharp operating system for QR ordering.
          </h1>
          <p className="hero-copy mt-6">
            We are building the platform as a single monorepo with secure tenant
            separation, a polished customer flow, and an admin surface designed
            for real daily use.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="primary-button" href="#phases">
              See the build plan
            </Link>
            <Link className="secondary-button" href="/admin/login">
              Open admin shell
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_22%)]" />
          <div className="relative space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                Live status
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="font-display text-2xl font-semibold text-white">
                    Orders ready
                  </div>
                  <p className="mt-1 text-sm text-white/60">
                    Built for dine-in QR journeys
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-200">
                  98.4% uptime target
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Tenant model", "restaurant_id everywhere"],
                ["Admin scope", "one café admin only"],
                ["Customer entry", "QR + OTP gate"],
                ["Storage", "menu images and QR codes"]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                    {label}
                  </p>
                  <p className="mt-3 text-base font-medium text-white/90">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section-shell py-8">
        <div className="max-w-3xl">
          <h2 className="section-heading">What this first build needs to do well</h2>
          <p className="section-subcopy">
            The first release is less about feature count and more about the
            product behaving like something a café would trust every day.
          </p>
        </div>
      </section>

      <section id="phases" className="section-shell">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {phases.map((phase, index) => (
            <article key={phase.title} className="glass-panel rounded-[1.75rem] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                Phase {index + 1}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">{phase.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{phase.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="admin" className="section-shell">
        <div className="glass-panel grid gap-8 rounded-[2rem] p-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="section-heading">Admin shell, simplified for one café owner</h2>
            <p className="section-subcopy">
              We are not wiring owner/staff permission flows right now. The
              platform starts with one authenticated admin per restaurant, which
              keeps the first production rollout lean and reliable.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-6">
            <div className="text-sm uppercase tracking-[0.3em] text-white/45">
              Dashboard modules
            </div>
            <ul className="mt-4 space-y-3 text-sm text-white/72">
              <li>Orders board</li>
              <li>Menu and categories</li>
              <li>Tables and QR codes</li>
              <li>Customer history</li>
              <li>Analytics and settings</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="contact" className="section-shell pb-24">
        <div className="glass-panel rounded-[2rem] p-8 text-center">
          <h2 className="section-heading">Ready to build this out piece by piece</h2>
          <p className="section-subcopy mx-auto">
            The first milestone is now grounded. Next we can wire the shared
            domain layer and then move into the restaurant, customer, and order
            flows.
          </p>
        </div>
      </section>
    </main>
  );
}
