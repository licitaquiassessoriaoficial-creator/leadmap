"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updatePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        Pagina {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => updatePage(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          onClick={() => updatePage(page + 1)}
          disabled={page >= totalPages}
        >
          Proxima
        </Button>
      </div>
    </div>
  );
}
