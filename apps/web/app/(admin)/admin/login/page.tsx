import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="section-shell py-16">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">
          Café admin access
        </p>
        <h2 className="mt-4 text-4xl font-semibold text-white">
          Admin login shell
        </h2>
        <p className="section-subcopy">
          Authentication, route protection, and restaurant linking will be
          connected in the next phase.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="primary-button" href="/admin/demo-cafe">
            Open dashboard shell
          </Link>
          <Link className="secondary-button" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
