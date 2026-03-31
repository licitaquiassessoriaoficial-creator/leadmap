"use client";

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
};

export function DashboardCharts({
  potentialTotals,
  statusTotals,
  cityTotals
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Distribuição por faixa de potencial
          </h3>
          <p className="text-sm text-slate-500">
            Panorama rápido das lideranças por potencial estimado.
          </p>
        </div>
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
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Situação operacional
          </h3>
          <p className="text-sm text-slate-500">
            Ativas, inativas e pendentes em um único gráfico.
          </p>
        </div>
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
      <Card className="xl:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Top cidades</h3>
          <p className="text-sm text-slate-500">
            Concentração de lideranças por cidade.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cityTotals.slice(0, 8).map((city) => (
            <div
              key={city.name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm text-slate-500">{city.name}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {city.total}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
