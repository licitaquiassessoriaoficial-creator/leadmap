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
import { LeadershipStatusBadge, RoleBadge } from "@/components/shared/status-badge";
import type { LeadershipWithRelations } from "@/types/app";

export function LeadershipTable({
  data
}: {
  data: LeadershipWithRelations[];
}) {
  const columns = useMemo<ColumnDef<LeadershipWithRelations>[]>(
    () => [
      {
        header: "Liderança",
        accessorKey: "nome",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-900">{row.original.nome}</p>
            <p className="text-xs text-slate-500">{row.original.telefone}</p>
          </div>
        )
      },
      {
        header: "Cidade / Estado",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {row.original.cidade} / {row.original.estado}
          </span>
        )
      },
      {
        header: "Potencial",
        cell: ({ row }) => (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">
              {row.original.potencialVotosEstimado}
            </p>
            <PotentialBadge level={row.original.faixaPotencial} />
          </div>
        )
      },
      {
        header: "Indicações",
        accessorKey: "quantidadeIndicacoes"
      },
      {
        header: "Status",
        cell: ({ row }) => <LeadershipStatusBadge status={row.original.status} />
      },
      {
        header: "Responsável",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">
              {row.original.cadastradoPor.name}
            </p>
            <RoleBadge role={row.original.cadastradoPor.role} />
          </div>
        )
      },
      {
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link
              href={`/liderancas/${row.original.id}`}
              className="text-sm font-medium text-brand-600"
            >
              Ver
            </Link>
            <Link
              href={`/liderancas/${row.original.id}/editar`}
              className="text-sm font-medium text-slate-600"
            >
              Editar
            </Link>
          </div>
        )
      }
    ],
    []
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
                  Nenhuma liderança encontrada para os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
