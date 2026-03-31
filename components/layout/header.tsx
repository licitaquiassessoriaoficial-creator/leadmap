"use client";

import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/layout/logout-button";
import { getInitials } from "@/lib/utils";
import type { Session } from "next-auth";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/liderancas": "Liderancas",
  "/ranking": "Ranking",
  "/mapa": "Mapa",
  "/usuarios": "Usuarios",
  "/configuracoes": "Configuracoes"
};

export function Header({
  user,
  onMenuClick
}: {
  user: Session["user"];
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title =
    Object.entries(routeTitles).find(([route]) => pathname.startsWith(route))?.[1] ??
    "LeadMap CRM";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 md:hidden"
        >
          Menu
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Painel administrativo
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 md:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {getInitials(user.name ?? "LM")}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
