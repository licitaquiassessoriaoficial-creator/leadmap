"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LeadershipStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<LeadershipCreateInput>({
    resolver: zodResolver(leadershipCreateSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      telefone: initialData?.telefone ?? "",
      email: initialData?.email ?? "",
      cpf: initialData?.cpf ?? "",
      cidadeId: initialData?.cidadeId ?? cityOptions[0]?.id ?? "",
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
        responsePayload.error ?? "Nao foi possivel salvar a lideranca."
      );
      return;
    }

    if (variant === "public") {
      setSuccessMessage("Cadastro recebido com sucesso. Nossa equipe fara a validacao.");
      form.reset({
        nome: "",
        telefone: "",
        email: "",
        cpf: "",
        cidadeId: cityOptions[0]?.id ?? "",
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
      return;
    }

    const targetId = responsePayload.data?.id ?? initialData?.id;
    const feedback =
      mode === "create"
        ? "Lideranca criada com sucesso."
        : "Lideranca atualizada com sucesso.";

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
          Cadastro vinculado a indicacao de <strong>{referralName}</strong>.
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
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} type="email" placeholder="Email" />
        </Field>
        <Field label="CPF" error={form.formState.errors.cpf?.message}>
          <Input {...form.register("cpf")} placeholder="Somente numeros" />
        </Field>
        <Field label="Cidade" error={form.formState.errors.cidadeId?.message}>
          <Select {...form.register("cidadeId")}>
            <option value="">Selecione</option>
            {cityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Estado"
          hint={lockedState ? "Definido pelo escopo atual" : "Default SP"}
        >
          <Input value={selectedState} readOnly />
        </Field>
        <Field label="Bairro" error={form.formState.errors.bairro?.message}>
          <Input {...form.register("bairro")} placeholder="Bairro" />
        </Field>
        <Field label="Endereco" error={form.formState.errors.endereco?.message}>
          <Input {...form.register("endereco")} placeholder="Endereco" />
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
          hint="A cidade base sera incluida automaticamente"
          error={form.formState.errors.cidadesResponsaveisIds?.message as string | undefined}
          className={variant === "internal" ? "md:col-span-2" : "md:col-span-2"}
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
        label="Observacoes"
        error={form.formState.errors.observacoes?.message}
      >
        <Textarea
          {...form.register("observacoes")}
          placeholder="Observacoes adicionais"
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
                ? "Cadastrar lideranca"
                : "Salvar alteracoes"}
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
