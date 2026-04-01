import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LinkCardProps = {
  href: string;
  children: ReactNode;
  className?: string;
  actionLabel?: string;
  ariaLabel?: string;
};

export function LinkCard({
  href,
  children,
  className,
  actionLabel = "Abrir",
  ariaLabel
}: LinkCardProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="group block h-full focus-visible:outline-none"
    >
      <Card
        className={cn(
          "flex h-full flex-col transition duration-200 hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl group-focus-visible:ring-2 group-focus-visible:ring-brand-500 group-focus-visible:ring-offset-2",
          className
        )}
      >
        <div className="flex-1">{children}</div>
        <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          {actionLabel}
          <span className="ml-2 transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </Card>
    </Link>
  );
}
