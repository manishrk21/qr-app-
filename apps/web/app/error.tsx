"use client";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.15),_transparent_36%),linear-gradient(180deg,#07111f_0%,#04070d_100%)] px-6 py-24 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
          Something broke
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold">
          We hit a runtime issue.
        </h1>
        <p className="mt-4 max-w-xl text-white/70">
          The app caught an unexpected error. Reset the route once the failure
          is resolved.
        </p>
        <pre className="mt-6 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/60">
          {error.message}
        </pre>
        <button
          className="mt-6 inline-flex items-center rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
