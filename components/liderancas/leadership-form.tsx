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
  variant?: "internal" | "public";
  initialData?: LeadershipWithDetails | null;
  cityOptions: CityOption[];
  lockedState?: string;
  referralId?: string;
  referralName?: string;
};

function normalizeCityName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function LeadershipForm({
  mode,
  variant = "internal",
  initialData,
  cityOptions,
  lockedState,
  referralId,
  referralName
}: LeadershipFormProps) {
  const router = useRouter();
  const cityListId = useId();
  const initialCity = cityOptions.find((item) => item.id === initialData?.cidadeId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
      custoTotal: initialData?.custoTotal ?? undefined,
      cidadesResponsaveisIds:
        initialData?.cidadesResponsaveis.map((item) => item.cityId) ?? [],
      status: initialData?.status ?? LeadershipStatus.ACTIVE
    }
  });

  const watchedCityId = form.watch("cidadeId");
  const selectedCity = cityOptions.find((item) => item.id === watchedCityId);
  const selectedState = selectedCity?.estado ?? lockedState ?? "SP";

  function handleCityChange(value: string) {
    setCitySearch(value);

    const matchedCity = cityOptions.find(
      (item) => normalizeCityName(item.nome) === normalizeCityName(value)
    );

    form.setValue("cidadeId", matchedCity?.id ?? "", {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  async function handleSubmit(values: LeadershipCreateInput) {
    setServerError(null);
    setSuccessMessage(null);

    const requestPayload = {
      ...values,
      estado: selectedState,
      indicadoPorId: referralId
    };

    const endpoint =
      variant === "public"
        ? "/api/cadastro"
        : mode === "create"
          ? "/api/liderancas"
          : `/api/liderancas/${initialData?.id}`;

    const response = await fetch(endpoint, {
      method: variant === "public" || mode === "create" ? "POST" : "PUT",
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

    if (variant === "public") {
      setSuccessMessage("Cadastro recebido com sucesso. Nossa equipe fará a validação.");
      form.reset({
        nome: "",
        telefone: "",
        email: "",
        cpf: "",
        cidadeId: "",
        estado: lockedState ?? "SP",
        bairro: "",
        endereco: "",
        observacoes: "",
        fotoPerfilUrl: "",
        potencialVotosEstimado: 0,
        custoTotal: undefined,
        cidadesResponsaveisIds: [],
        status: LeadershipStatus.ACTIVE
      });
      setCitySearch("");
      return;
    }

    const targetId = responsePayload.data?.id ?? initialData?.id;
    const feedback =
      mode === "create"
        ? "Liderança criada com sucesso."
        : "Liderança atualizada com sucesso.";

    router.push(
      `/liderancas/${targetId}?feedback=${encodeURIComponent(feedback)}`
    );
    router.refresh();
  }

  return (
    <form
      className="space-y-6 rounded-2xl bg-white p-6 shadow-panel"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {variant === "public" && referralName ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Cadastro vinculado à indicação de <strong>{referralName}</strong>.
        </div>
      ) : null}
      <ProfilePhotoUpload
        value={form.watch("fotoPerfilUrl")}
        onChange={(value) =>
          form.setValue("fotoPerfilUrl", value ?? "", {
            shouldDirty: true,
            shouldValidate: true
          })
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
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
        <Field label="Custo total" error={form.formState.errors.custoTotal?.message}>
          <Input type="number" min={0} step="0.01" {...form.register("custoTotal")} />
        </Field>
        {variant === "internal" ? (
          <Field label="Status" error={form.formState.errors.status?.message}>
            <Select {...form.register("status")}>
              <option value={LeadershipStatus.ACTIVE}>Ativa</option>
              <option value={LeadershipStatus.INACTIVE}>Inativa</option>
              <option value={LeadershipStatus.PENDING}>Pendente</option>
            </Select>
          </Field>
        ) : null}
        <Field
          label="Cidades sob responsabilidade"
          hint="A cidade base será incluída automaticamente"
          error={form.formState.errors.cidadesResponsaveisIds?.message as string | undefined}
          className="md:col-span-2"
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
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Salvando..."
            : variant === "public"
              ? "Enviar cadastro"
              : mode === "create"
                ? "Cadastrar liderança"
                : "Salvar alterações"}
        </Button>
        {variant === "internal" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
