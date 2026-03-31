import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-100",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 disabled:bg-transparent",
  danger: "bg-danger text-white hover:bg-red-800 disabled:bg-red-300"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
