import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action,
  actionHref
}: {
  title: string;
  description?: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action && actionHref ? (
        <Link href={actionHref}>
          <Button>{action}</Button>
        </Link>
      ) : null}
    </div>
  );
}
