"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import type { RankingSortInput } from "@/validations/leadership";

export function RankingSortControl({
  value
}: {
  value: RankingSortInput;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<RankingSortInput>(value);

  function applySort() {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sortBy", sortBy);
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Field
          label="Ordenação do ranking"
          hint="Alterne entre volume, potencial, eficiência e score"
          className="w-full md:max-w-md"
        >
          <Select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as RankingSortInput)}
          >
            <option value="INDICATIONS_DESC">Mais indicações primeiro</option>
            <option value="POTENTIAL_DESC">Maior potencial primeiro</option>
            <option value="COST_PER_VOTE_ASC">Menor custo por voto primeiro</option>
            <option value="SCORE_DESC">Maior score primeiro</option>
          </Select>
        </Field>
        <Button onClick={applySort}>Aplicar ordenação</Button>
      </div>
    </div>
  );
}
