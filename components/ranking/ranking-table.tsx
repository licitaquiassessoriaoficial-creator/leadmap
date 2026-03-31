"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useMemo } from "react";

import { PotentialBadge } from "@/components/shared/potential-badge";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import type { LeadershipWithRelations } from "@/types/app";

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
        header: "Posição",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            {(page - 1) * pageSize + row.index + 1}
          </span>
        )
      },
      {
        header: "Nome",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-900">{row.original.nome}</p>
            <p className="text-xs text-slate-500">
              {row.original.cidade} / {row.original.estado}
            </p>
          </div>
        )
      },
      {
        header: "Indicações",
        accessorKey: "quantidadeIndicacoes"
      },
      {
        header: "Potencial",
        cell: ({ row }) => (
          <div className="space-y-2">
            <p className="font-medium text-slate-900">
              {row.original.potencialVotosEstimado}
            </p>
            <PotentialBadge level={row.original.faixaPotencial} />
          </div>
        )
      },
      {
        header: "Status",
        cell: ({ row }) => <LeadershipStatusBadge status={row.original.status} />
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
                <tr key={row.id}>
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
                  Nenhuma liderança encontrada para o ranking atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
