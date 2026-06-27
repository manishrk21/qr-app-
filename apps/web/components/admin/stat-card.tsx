type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</p>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {helper ? <p className="mt-2 text-sm text-white/60">{helper}</p> : null}
    </div>
  );
}

