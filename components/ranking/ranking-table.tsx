"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

import { PotentialBadge } from "@/components/shared/potential-badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import type { LeadershipWithRelations } from "@/types/app";
import { calculateCostPerVote } from "@/lib/domain/leadership";
import { formatCurrency, formatInteger } from "@/lib/utils";

export function RankingTable({
  data,
  page,
  pageSize
}: {
  data: LeadershipWithRelations[];
  page: number;
  pageSize: number;
}) {
  const columns = useMemo<ColumnDef<LeadershipWithRelations>[]>(
    () => [
      {
        header: "Posicao",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            {(page - 1) * pageSize + row.index + 1}
          </span>
        )
      },
      {
        header: "Lideranca",
        cell: ({ row }) => (
          <Link href={`/liderancas/${row.original.id}`} className="flex items-center gap-3">
            <ProfileAvatar
              name={row.original.nome}
              imageUrl={row.original.fotoPerfilUrl}
              className="h-11 w-11"
            />
            <div>
              <p className="font-medium text-slate-900">{row.original.nome}</p>
              <p className="text-xs text-slate-500">
                {row.original.cidade} / {row.original.estado}
              </p>
            </div>
          </Link>
        )
      },
      {
        header: "Indicacoes",
        cell: ({ row }) => formatInteger(row.original.quantidadeIndicacoes)
      },
      {
        header: "Votos estimados",
        cell: ({ row }) => (
          <div className="space-y-2">
            <p className="font-medium text-slate-900">
              {formatInteger(row.original.potencialVotosEstimado)}
            </p>
            <PotentialBadge level={row.original.faixaPotencial} />
          </div>
        )
      },
      {
        header: "Custo por voto",
        cell: ({ row }) =>
          formatCurrency(
            calculateCostPerVote(
              row.original.custoTotal,
              row.original.potencialVotosEstimado
            )
          )
      }
    ],
    [page, pageSize]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-brand-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-sm text-slate-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  Nenhuma lideranca encontrada para o ranking atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
