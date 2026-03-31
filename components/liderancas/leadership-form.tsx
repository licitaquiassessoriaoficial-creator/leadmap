"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LeadershipStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LeadershipWithRelations } from "@/types/app";
import {
  leadershipCreateSchema,
  type LeadershipCreateInput
} from "@/validations/leadership";

type LeadershipFormProps = {
  mode: "create" | "edit";
  initialData?: LeadershipWithRelations;
};

export function LeadershipForm({
  mode,
  initialData
}: LeadershipFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LeadershipCreateInput>({
    resolver: zodResolver(leadershipCreateSchema),
    defaultValues: {
      nome: initialData?.nome ?? "",
      telefone: initialData?.telefone ?? "",
      email: initialData?.email ?? "",
      cpf: initialData?.cpf ?? "",
      cidade: initialData?.cidade ?? "",
      estado: initialData?.estado ?? "",
      bairro: initialData?.bairro ?? "",
      endereco: initialData?.endereco ?? "",
      observacoes: initialData?.observacoes ?? "",
      potencialVotosEstimado: initialData?.potencialVotosEstimado ?? 0,
      quantidadeIndicacoes: initialData?.quantidadeIndicacoes ?? 0,
      status: initialData?.status ?? LeadershipStatus.ACTIVE
    }
  });

  async function handleSubmit(values: LeadershipCreateInput) {
    setServerError(null);

    const endpoint =
      mode === "create"
        ? "/api/liderancas"
        : `/api/liderancas/${initialData?.id}`;

    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      data?: { id: string };
    };

    if (!response.ok) {
      setServerError(payload.error ?? "Nao foi possivel salvar a lideranca.");
      return;
    }

    const targetId = payload.data?.id ?? initialData?.id;
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
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" error={form.formState.errors.nome?.message}>
          <Input {...form.register("nome")} placeholder="Nome completo" />
        </Field>
        <Field label="Telefone" error={form.formState.errors.telefone?.message}>
          <Input {...form.register("telefone")} placeholder="(11) 99999-9999" />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} type="email" placeholder="Email" />
        </Field>
        <Field label="CPF" error={form.formState.errors.cpf?.message}>
          <Input {...form.register("cpf")} placeholder="Somente numeros" />
        </Field>
        <Field label="Cidade" error={form.formState.errors.cidade?.message}>
          <Input {...form.register("cidade")} placeholder="Cidade" />
        </Field>
        <Field label="Estado" error={form.formState.errors.estado?.message}>
          <Input {...form.register("estado")} placeholder="Estado" />
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
        <Field
          label="Quantidade de indicacoes"
          error={form.formState.errors.quantidadeIndicacoes?.message}
        >
          <Input
            type="number"
            min={0}
            {...form.register("quantidadeIndicacoes")}
          />
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            <option value={LeadershipStatus.ACTIVE}>Ativa</option>
            <option value={LeadershipStatus.INACTIVE}>Inativa</option>
            <option value={LeadershipStatus.PENDING}>Pendente</option>
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
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Cadastrar lideranca"
              : "Salvar alteracoes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
