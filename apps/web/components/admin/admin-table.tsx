import type { ReactNode } from "react";
import Link from "next/link";

type Column<T> = {
  header: string;
  render: (item: T) => ReactNode;
};

type AdminTableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  emptyLabel: string;
};

export function AdminTable<T>({ rows, columns, emptyLabel }: AdminTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <table className="w-full border-collapse">
        <thead className="bg-white/5">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className="px-5 py-4 text-left text-xs uppercase tracking-[0.28em] text-white/45"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-t border-white/10 bg-slate-950/30 transition hover:bg-white/[0.05]"
            >
              {columns.map((column) => (
                <td key={column.header} className="px-5 py-4 align-top text-sm text-white/80">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ActionLink({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="secondary-button text-sm" href={href}>
      {children}
    </Link>
  );
}
