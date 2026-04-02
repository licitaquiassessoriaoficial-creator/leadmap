"use client";

import { LeadershipStatus, PotentialLevel } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";

import { POTENTIAL_METADATA } from "@/lib/constants/potential";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type FiltersProps = {
  cities: string[];
  states: string[];
  users?: Array<{ id: string; name: string }>;
  initialValues: {
    search?: string;
    cidade?: string;
    estado?: string;
    faixaPotencial?: PotentialLevel;
    status?: LeadershipStatus;
    responsavelId?: string;
    startDate?: string;
    endDate?: string;
  };
  showSearch?: boolean;
  showResponsible?: boolean;
  showPeriod?: boolean;
  lockedState?: string;
};

export function LeadershipFilters({
  cities,
  states,
  users = [],
  initialValues,
  showSearch = true,
  showResponsible = true,
  showPeriod = true,
  lockedState
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityListId = useId();
  const [values, setValues] = useState({
    search: initialValues.search ?? "",
    cidade: initialValues.cidade ?? "",
    estado: lockedState ?? initialValues.estado ?? "",
    faixaPotencial: initialValues.faixaPotencial ?? "",
    status: initialValues.status ?? "",
    responsavelId: initialValues.responsavelId ?? "",
    startDate: initialValues.startDate ?? "",
    endDate: initialValues.endDate ?? ""
  });

  const sortedCities = useMemo(() => [...cities].sort(), [cities]);
  const sortedStates = useMemo(() => [...states].sort(), [states]);

  function handleChange(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    setValues({
      search: "",
      cidade: "",
      estado: lockedState ?? "",
      faixaPotencial: "",
      status: "",
      responsavelId: "",
      startDate: "",
      endDate: ""
    });
    router.push("?");
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-panel">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {showSearch ? (
          <Field label="Busca textual">
            <Input
              placeholder="Nome, telefone, email ou cidade"
              value={values.search}
              onChange={(event) => handleChange("search", event.target.value)}
            />
          </Field>
        ) : null}
        <Field
          label="Cidade"
          hint="Digite para buscar entre os municípios disponíveis"
        >
          <Input
            list={cityListId}
            value={values.cidade}
            placeholder="Digite o nome da cidade"
            onChange={(event) => handleChange("cidade", event.target.value)}
          />
          <datalist id={cityListId}>
            {sortedCities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </Field>
        <Field
          label="Estado"
          hint={lockedState ? "Definido pelo admin global" : undefined}
        >
          <Select
            value={values.estado}
            disabled={Boolean(lockedState)}
            onChange={(event) => handleChange("estado", event.target.value)}
          >
            {!lockedState ? <option value="">Todos</option> : null}
            {(lockedState ? [lockedState] : sortedStates).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Faixa de potencial">
          <Select
            value={values.faixaPotencial}
            onChange={(event) =>
              handleChange("faixaPotencial", event.target.value)
            }
          >
            <option value="">Todas</option>
            {Object.entries(POTENTIAL_METADATA).map(([value, metadata]) => (
              <option key={value} value={value}>
                {metadata.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={values.status}
            onChange={(event) => handleChange("status", event.target.value)}
          >
            <option value="">Todos</option>
            <option value={LeadershipStatus.ACTIVE}>Ativa</option>
            <option value={LeadershipStatus.INACTIVE}>Inativa</option>
            <option value={LeadershipStatus.PENDING}>Pendente</option>
          </Select>
        </Field>
        {showResponsible ? (
          <Field label="Responsável">
            <Select
              value={values.responsavelId}
              onChange={(event) =>
                handleChange("responsavelId", event.target.value)
              }
            >
              <option value="">Todos</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        {showPeriod ? (
          <Field label="Cadastro de">
            <Input
              type="date"
              value={values.startDate}
              onChange={(event) => handleChange("startDate", event.target.value)}
            />
          </Field>
        ) : null}
        {showPeriod ? (
          <Field label="Cadastro até">
            <Input
              type="date"
              value={values.endDate}
              onChange={(event) => handleChange("endDate", event.target.value)}
            />
          </Field>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={applyFilters}>Aplicar filtros</Button>
        <Button variant="secondary" onClick={clearFilters}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
