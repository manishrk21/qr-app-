import type { ReactNode } from "react";

type AdminSectionProps = {
  title: string;
  description: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function AdminSection({
  title,
  description,
  children,
  action
}: AdminSectionProps) {
  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">
            {description}
          </p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

