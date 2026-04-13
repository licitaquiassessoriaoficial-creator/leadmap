"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { findCityOptionByName } from "@/lib/domain/cities";
import {
  publicLeadershipCreateSchema,
  type PublicLeadershipCreateInput
} from "@/validations/leadership";

type CityOption = {
  id: string;
  nome: string;
  estado: string;
};

export function PublicSignupForm({
  cityOptions,
  referralCode,
  referralName
}: {
  cityOptions: CityOption[];
  referralCode?: string;
  referralName?: string;
}) {
  const cityListId = useId();
  const [citySearch, setCitySearch] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<PublicLeadershipCreateInput>({
    resolver: zodResolver(publicLeadershipCreateSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      cidadeId: "",
      estado: "SP",
      observacoes: "",
      origemRef: referralCode
    }
  });

  function handleCityChange(value: string) {
    setCitySearch(value);

    const match = findCityOptionByName(cityOptions, value);

    form.setValue("cidadeId", match?.id ?? "", {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  async function handleSubmit(values: PublicLeadershipCreateInput) {
    setServerError(null);
    setSuccessMessage(null);

    const response = await fetch("/api/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...values,
        origemRef: referralCode ?? values.origemRef
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      setServerError(payload.error ?? "Não foi possível concluir o cadastro.");
      return;
    }

    setSuccessMessage(
      referralName
        ? `Cadastro enviado com sucesso e vinculado a ${referralName}.`
        : "Cadastro enviado com sucesso."
    );
    form.reset({
      nome: "",
      telefone: "",
      email: "",
      cidadeId: "",
      estado: "SP",
      observacoes: "",
      origemRef: referralCode
    });
    setCitySearch("");
  }

  return (
    <form
      className="space-y-6 rounded-2xl bg-white p-6 shadow-panel"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {referralName ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Cadastro vinculado à indicação de <strong>{referralName}</strong>.
        </div>
      ) : null}

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
      </div>

      <Field
        label="Observações"
        error={form.formState.errors.observacoes?.message}
      >
        <Textarea
          {...form.register("observacoes")}
          placeholder="Conte um pouco sobre a sua atuação"
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

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Enviando..." : "Enviar cadastro"}
      </Button>
    </form>
  );
}
