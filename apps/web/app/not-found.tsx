import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_36%),linear-gradient(180deg,#08111b_0%,#04070d_100%)] px-6 py-24 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-200/80">
          Page not found
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold">
          This route does not exist.
        </h1>
        <p className="mt-4 max-w-xl text-white/70">
          The page you tried to open is missing or has not been built yet.
        </p>
        <Link
          className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-100"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
