type TagProps = {
  children: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

const toneClasses: Record<NonNullable<TagProps["tone"]>, string> = {
  default: "border-white/10 bg-white/5 text-white/75",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  muted: "border-white/10 bg-white/5 text-white/55"
};

export function Tag({ children, tone = "default" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

