"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LeadershipStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { ProfilePhotoUpload } from "@/components/liderancas/profile-photo-upload";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { findCityOptionByName } from "@/lib/domain/cities";
import { calculateCostPerVote } from "@/lib/domain/leadership";
import { formatCurrency } from "@/lib/utils";
import type { LeadershipWithDetails } from "@/types/app";
import {
  leadershipCreateSchema,
  type LeadershipCreateInput
} from "@/validations/leadership";

type CityOption = {
  id: string;
  nome: string;
  estado: string;
};

type LeadershipFormProps = {
  mode: "create" | "edit";
  initialData?: LeadershipWithDetails | null;
  cityOptions: CityOption[];
  lockedState?: string;
};

export function LeadershipForm({
  mode,
  initialData,
  cityOptions,
  lockedState
}: LeadershipFormProps) {
  const router = useRouter();
  const cityListId = useId();
  const initialCity = cityOptions.find((item) => item.id === initialData?.cidadeId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState(initialCity?.nome ?? "");
  const form = useForm<LeadershipCreateInput>({
    resolver: zodResolver(leadershipCreateSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      telefone: initialData?.telefone ?? "",
      email: initialData?.email ?? "",
      cpf: initialData?.cpf ?? "",
      cidadeId: initialData?.cidadeId ?? "",
      estado: initialData?.estado ?? lockedState ?? "SP",
      bairro: initialData?.bairro ?? "",
      endereco: initialData?.endereco ?? "",
      observacoes: initialData?.observacoes ?? "",
      fotoPerfilUrl: initialData?.fotoPerfilUrl ?? "",
      potencialVotosEstimado: initialData?.potencialVotosEstimado ?? 0,
      votosReais: initialData?.votosReais ?? undefined,
      custoTotal: initialData?.custoTotal ?? undefined,
      metaVotosIndividual: initialData?.metaVotosIndividual ?? undefined,
      cidadesResponsaveisIds:
        initialData?.cidadesResponsaveis.map((item) => item.cityId) ?? [],
      status: initialData?.status ?? LeadershipStatus.ACTIVE
    }
  });

  const watchedCityId = form.watch("cidadeId");
  const watchedPotentialVotes = form.watch("potencialVotosEstimado");
  const watchedRealVotes = form.watch("votosReais");
  const watchedCostTotal = form.watch("custoTotal");
  const selectedCity = cityOptions.find((item) => item.id === watchedCityId);
  const selectedState = selectedCity?.estado ?? lockedState ?? "SP";
  const costPerVotePreview = calculateCostPerVote(
    watchedCostTotal,
    watchedRealVotes,
    watchedPotentialVotes
  );

  function handleCityChange(value: string) {
    setCitySearch(value);

    const matchedCity = findCityOptionByName(cityOptions, value);

    form.setValue("cidadeId", matchedCity?.id ?? "", {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  async function handleSubmit(values: LeadershipCreateInput) {
    setServerError(null);

    const requestPayload = {
      ...values,
      estado: selectedState
    };

    const endpoint =
      mode === "create" ? "/api/liderancas" : `/api/liderancas/${initialData?.id}`;

    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    const responsePayload = (await response.json().catch(() => ({}))) as {
      error?: string;
      data?: { id: string };
    };

    if (!response.ok) {
      setServerError(
        responsePayload.error ?? "Não foi possível salvar a liderança."
      );
      return;
    }

    const targetId = responsePayload.data?.id ?? initialData?.id;
    const feedback =
      mode === "create"
        ? "Liderança criada com sucesso."
        : "Liderança atualizada com sucesso.";

    router.push(`/liderancas/${targetId}?feedback=${encodeURIComponent(feedback)}`);
    router.refresh();
  }

  return (
    <form
      className="space-y-6 rounded-2xl bg-white p-6 shadow-panel"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <ProfilePhotoUpload
        value={form.watch("fotoPerfilUrl")}
        onChange={(value) =>
          form.setValue("fotoPerfilUrl", value ?? "", {
            shouldDirty: true,
            shouldValidate: true
          })
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Nome" error={form.formState.errors.nome?.message}>
          <Input {...form.register("nome")} placeholder="Nome completo" />
        </Field>
        <Field label="Telefone" error={form.formState.errors.telefone?.message}>
          <Input {...form.register("telefone")} placeholder="5511999999999" />
        </Field>
        <Field label="E-mail" error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} type="email" placeholder="E-mail" />
        </Field>
        <Field label="CPF" error={form.formState.errors.cpf?.message}>
          <Input {...form.register("cpf")} placeholder="Somente números" />
        </Field>
        <Field label="Cidade" error={form.formState.errors.cidadeId?.message}>
          <>
            <input type="hidden" {...form.register("cidadeId")} />
            <Input
              value={citySearch}
              list={cityListId}
              placeholder="Digite o nome da cidade"
              onChange={(event) => handleCityChange(event.target.value)}
            />
            <datalist id={cityListId}>
              {cityOptions.map((city) => (
                <option key={city.id} value={city.nome} />
              ))}
            </datalist>
          </>
        </Field>
        <Field
          label="Estado"
          hint={lockedState ? "Definido pelo escopo atual" : "Padrão SP"}
        >
          <Input value={selectedState} readOnly />
        </Field>
        <Field label="Bairro" error={form.formState.errors.bairro?.message}>
          <Input {...form.register("bairro")} placeholder="Bairro" />
        </Field>
        <Field label="Endereço" error={form.formState.errors.endereco?.message}>
          <Input {...form.register("endereco")} placeholder="Endereço" />
        </Field>
        <Field
          label="Potencial de votos"
          error={form.formState.errors.potencialVotosEstimado?.message}
        >
          <Input
            type="number"
            min={0}
            {...form.register("potencialVotosEstimado")}
          />
        </Field>
        <Field label="Votos reais" error={form.formState.errors.votosReais?.message}>
          <Input type="number" min={0} {...form.register("votosReais")} />
        </Field>
        <Field label="Custo total" error={form.formState.errors.custoTotal?.message}>
          <Input type="number" min={0} step="0.01" {...form.register("custoTotal")} />
        </Field>
        <Field
          label="Meta individual"
          error={form.formState.errors.metaVotosIndividual?.message}
        >
          <Input
            type="number"
            min={0}
            {...form.register("metaVotosIndividual")}
          />
        </Field>
        <Field
          label="Custo por voto"
          hint="Calculado automaticamente com prioridade para votos reais."
        >
          <Input
            readOnly
            value={
              costPerVotePreview == null
                ? "Aguardando base válida"
                : formatCurrency(costPerVotePreview)
            }
          />
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            <option value={LeadershipStatus.ACTIVE}>Ativa</option>
            <option value={LeadershipStatus.INACTIVE}>Inativa</option>
            <option value={LeadershipStatus.PENDING}>Pendente</option>
          </Select>
        </Field>
        <Field
          label="Cidades sob responsabilidade"
          hint="A cidade base será incluída automaticamente"
          error={form.formState.errors.cidadesResponsaveisIds?.message as
            | string
            | undefined}
          className="md:col-span-2 xl:col-span-3"
        >
          <Select
            multiple
            className="min-h-40"
            {...form.register("cidadesResponsaveisIds")}
          >
            {cityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.nome}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Observações"
        error={form.formState.errors.observacoes?.message}
      >
        <Textarea
          {...form.register("observacoes")}
          placeholder="Observações adicionais"
        />
      </Field>

      {serverError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        O sistema não define valor de voto. Você informa custo, votos reais e
        potencial, e o CRM calcula automaticamente o custo por voto para análise
        de eficiência.
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Cadastrar liderança"
              : "Salvar alterações"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
