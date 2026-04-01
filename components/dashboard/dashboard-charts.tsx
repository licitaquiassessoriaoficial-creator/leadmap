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

type DashboardChartsProps = {
  potentialTotals: Array<{
    label: string;
    total: number;
    color: string;
  }>;
  coverageTotals: Array<{
    label: string;
    total: number;
    color: string;
  }>;
  topLeadershipChart: Array<{
    name: string;
    indicacoes: number;
  }>;
};

export function DashboardCharts({
  potentialTotals,
  coverageTotals,
  topLeadershipChart
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="transition duration-200 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Distribuicao por potencial
          </h3>
          <Link
            href="/liderancas"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
          >
            Abrir listagem
          </Link>
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
      <Card className="transition duration-200 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Top 5 por indicacoes
          </h3>
          <Link
            href="/ranking"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
          >
            Ver ranking
          </Link>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topLeadershipChart}
              layout="vertical"
              margin={{ left: 24 }}
            >
              <XAxis type="number" allowDecimals={false} stroke="#64748b" />
              <YAxis
                type="category"
                width={110}
                dataKey="name"
                stroke="#64748b"
              />
              <Tooltip />
              <Bar dataKey="indicacoes" radius={[0, 10, 10, 0]} fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="transition duration-200 hover:ring-1 hover:ring-brand-200 hover:shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Cidades cobertas
          </h3>
          <Link
            href="/cidades"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
          >
            Abrir cidades
          </Link>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={coverageTotals}
                dataKey="total"
                nameKey="label"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={4}
              >
                {coverageTotals.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
