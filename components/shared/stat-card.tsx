import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  helper,
  href,
  actionLabel = "Abrir"
}: {
  label: string;
  value: string | number;
  helper?: string;
  href?: string;
  actionLabel?: string;
}) {
  const content = (
    <Card
      className={cn(
        "space-y-2",
        href
          ? "h-full transition duration-200 hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl"
          : undefined
      )}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
      {href ? (
        <p className="pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          {actionLabel}
        </p>
      ) : null}
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full focus-visible:outline-none">
      {content}
    </Link>
  );
}
