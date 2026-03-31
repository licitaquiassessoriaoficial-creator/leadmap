"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/liderancas", label: "Lideranças" },
  { href: "/ranking", label: "Ranking" },
  { href: "/mapa", label: "Mapa" },
  { href: "/usuarios", label: "Usuários" },
  { href: "/configuracoes", label: "Configurações" }
];

export function Sidebar({
  user,
  isOpen,
  onNavigate
}: {
  user: Session["user"];
  isOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 px-5 py-6 text-slate-200 transition-transform md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="space-y-2 border-b border-white/10 pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          LeadMap CRM
        </p>
        <h1 className="text-2xl font-semibold text-white">Painel territorial</h1>
        <p className="text-sm text-slate-400">
          {user.role === "ADMIN" ? "Perfil administrador" : "Perfil operador"}
        </p>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm transition",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-white">Território monitorado</p>
        <p className="mt-2 text-xs text-slate-400">
          Cadastro, filtros, ranking e mapa em uma única operação.
        </p>
      </div>
    </aside>
  );
}
