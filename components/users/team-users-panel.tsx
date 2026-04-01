"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { RoleBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SafeUser } from "@/repositories/user-repository";
import { formatDate } from "@/lib/utils";
import {
  teamUserCreateSchema,
  type TeamUserCreateInput
} from "@/validations/team-user";

type DraftState = Record<
  string,
  {
    name: string;
    email: string;
    password: string;
    loading: boolean;
    error?: string;
    success?: string;
  }
>;

export function TeamUsersPanel({ users }: { users: SafeUser[] }) {
  const router = useRouter();
  const [createMessage, setCreateMessage] = useState<string>();
  const [createError, setCreateError] = useState<string>();
  const [drafts, setDrafts] = useState<DraftState>(() =>
    Object.fromEntries(
      users.map((user) => [
        user.id,
        {
          name: user.name,
          email: user.email,
          password: "",
          loading: false
        }
      ])
    )
  );

  const form = useForm<TeamUserCreateInput>({
    resolver: zodResolver(teamUserCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  function updateDraft(userId: string, patch: Partial<DraftState[string]>) {
    setDrafts((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        ...patch
      }
    }));
  }

  async function handleCreate(values: TeamUserCreateInput) {
    setCreateMessage(undefined);
    setCreateError(undefined);

    const response = await fetch("/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      setCreateError(payload.error ?? "Não foi possível cadastrar o operador.");
      return;
    }

    setCreateMessage("Operador cadastrado com sucesso.");
    form.reset();
    router.refresh();
  }

  async function handleUpdate(userId: string) {
    const draft = drafts[userId];

    if (!draft) {
      return;
    }

    updateDraft(userId, {
      loading: true,
      error: undefined,
      success: undefined
    });

    const response = await fetch(`/api/usuarios/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: draft.name,
        email: draft.email,
        password: draft.password || undefined
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      updateDraft(userId, {
        loading: false,
        error: payload.error ?? "Não foi possível atualizar o operador."
      });
      return;
    }

    updateDraft(userId, {
      loading: false,
      password: "",
      success: "Operador atualizado com sucesso."
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
        <Card id="novo-operador">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Novo operador
            </h3>
            <p className="text-sm text-slate-500">
              Cadastre apenas acessos vinculados ao seu time.
            </p>
          </div>
          <FeedbackBanner message={createMessage} />
          {createError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createError}
            </div>
          ) : null}
          <form className="space-y-4" onSubmit={form.handleSubmit(handleCreate)}>
            <Field label="Nome" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Nome completo" />
            </Field>
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input
                {...form.register("email")}
                type="email"
                placeholder="operador@campanha.com"
              />
            </Field>
            <Field label="Senha" error={form.formState.errors.password?.message}>
              <Input
                {...form.register("password")}
                type="password"
                placeholder="Mínimo de 6 caracteres"
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Cadastrando..."
                  : "Cadastrar operador"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Regra do seu painel
          </h3>
          <p className="text-sm text-slate-600">
            Aqui você gerencia apenas operadores criados por você. Perfis de
            admin global e outros administradores ficam fora deste escopo.
          </p>
          <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>Você pode cadastrar operadores novos.</p>
            <p>Você pode atualizar nome, email e senha da sua equipe.</p>
            <p>Os dados do dashboard, mapa, ranking e lideranças também seguem esse mesmo escopo.</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Operadores do seu time
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} operador{users.length === 1 ? "" : "es"} vinculado
            {users.length === 1 ? "" : "s"} ao seu acesso.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Perfil
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nova senha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Criado em
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.length ? (
                users.map((user) => {
                  const draft = drafts[user.id];

                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-4 align-top">
                        <Input
                          value={draft?.name ?? user.name}
                          onChange={(event) =>
                            updateDraft(user.id, {
                              name: event.target.value,
                              success: undefined,
                              error: undefined
                            })
                          }
                        />
                        {draft?.error ? (
                          <p className="mt-2 text-xs text-red-600">{draft.error}</p>
                        ) : null}
                        {draft?.success ? (
                          <p className="mt-2 text-xs text-emerald-600">
                            {draft.success}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Input
                          type="email"
                          value={draft?.email ?? user.email}
                          onChange={(event) =>
                            updateDraft(user.id, {
                              email: event.target.value,
                              success: undefined,
                              error: undefined
                            })
                          }
                        />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Input
                          type="password"
                          value={draft?.password ?? ""}
                          placeholder="Opcional"
                          onChange={(event) =>
                            updateDraft(user.id, {
                              password: event.target.value,
                              success: undefined,
                              error: undefined
                            })
                          }
                        />
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 align-top text-right">
                        <Button
                          onClick={() => handleUpdate(user.id)}
                          disabled={draft?.loading}
                        >
                          {draft?.loading ? "Salvando..." : "Salvar"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Nenhum operador cadastrado no seu time até agora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
