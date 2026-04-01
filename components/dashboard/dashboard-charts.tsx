"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card } from "@/components/ui/card";
import { buildSearchParams } from "@/lib/utils";

type DashboardChartsProps = {
  potentialTotals: Array<{
    label: string;
    total: number;
    color: string;
  }>;
  statusTotals: Array<{
    label: string;
    total: number;
    color: string;
  }>;
  cityTotals: Array<{
    name: string;
    total: number;
  }>;
  enforcedState?: string;
};

export function DashboardCharts({
  potentialTotals,
  statusTotals,
  cityTotals,
  enforcedState
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <Card className="transition duration-200 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Distribuição por faixa de potencial
          </h3>
          <Link
            href="/liderancas"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
          >
            Abrir listagem
          </Link>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Panorama rápido das lideranças por potencial estimado.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={potentialTotals}>
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis allowDecimals={false} stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="total" radius={[10, 10, 0, 0]}>
                {potentialTotals.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="transition duration-200 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Situação operacional
          </h3>
          <Link
            href="/liderancas"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
          >
            Ver lideranças
          </Link>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Ativas, inativas e pendentes em um único gráfico.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusTotals}
                dataKey="total"
                nameKey="label"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={4}
              >
                {statusTotals.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="xl:col-span-2 transition duration-200 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">Top cidades</h3>
          <Link
            href="/mapa"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
          >
            Abrir mapa
          </Link>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Concentração de lideranças por cidade.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cityTotals.slice(0, 8).map((city) => (
            <Link
              key={city.name}
              href={`/liderancas?${buildSearchParams({
                cidade: city.name,
                estado: enforcedState
              })}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <p className="text-sm text-slate-500">{city.name}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {city.total}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                Ver lideranças
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
