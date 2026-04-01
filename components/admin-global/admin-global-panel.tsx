"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CampaignSettings,
  Role
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BRAZILIAN_STATES } from "@/lib/constants/brazil-states";
import type { SafeUser } from "@/repositories/user-repository";
import { formatDate } from "@/lib/utils";
import {
  campaignSettingsSchema,
  type CampaignSettingsInput
} from "@/validations/campaign-settings";
import {
  managedUserCreateSchema,
  type ManagedUserCreateInput
} from "@/validations/user-management";

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: Role.GLOBAL_ADMIN, label: "Admin global" },
  { value: Role.ADMIN, label: "Administrador" },
  { value: Role.OPERATOR, label: "Operador" }
];

type UserDraftState = Record<
  string,
  {
    role: Role;
    password: string;
    loading: boolean;
    error?: string;
    success?: string;
  }
>;

export function AdminGlobalPanel({
  settings,
  users,
  currentUserId,
  bootstrapMode
}: {
  settings: CampaignSettings;
  users: SafeUser[];
  currentUserId: string;
  bootstrapMode: boolean;
}) {
  const router = useRouter();
  const [settingsMessage, setSettingsMessage] = useState<string>();
  const [settingsError, setSettingsError] = useState<string>();
  const [userCreateMessage, setUserCreateMessage] = useState<string>();
  const [userCreateError, setUserCreateError] = useState<string>();
  const [userDrafts, setUserDrafts] = useState<UserDraftState>(() =>
    Object.fromEntries(
      users.map((user) => [
        user.id,
        {
          role: user.role,
          password: "",
          loading: false
        }
      ])
    )
  );

  const settingsForm = useForm<CampaignSettingsInput>({
    resolver: zodResolver(campaignSettingsSchema),
    defaultValues: {
      nomeCampanha: settings.nomeCampanha ?? "",
      estadoPadrao: settings.estadoPadrao ?? "",
      restringirAoEstadoPadrao: settings.restringirAoEstadoPadrao
    }
  });

  const userCreateForm = useForm<ManagedUserCreateInput>({
    resolver: zodResolver(managedUserCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: Role.OPERATOR
    }
  });

  const globalAdminCount = useMemo(
    () => users.filter((user) => user.role === Role.GLOBAL_ADMIN).length,
    [users]
  );

  function updateUserDraft(
    userId: string,
    patch: Partial<UserDraftState[string]>
  ) {
    setUserDrafts((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        ...patch
      }
    }));
  }

  async function handleSettingsSubmit(values: CampaignSettingsInput) {
    setSettingsMessage(undefined);
    setSettingsError(undefined);

    const response = await fetch("/api/admin-global/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      setSettingsError(payload.error ?? "Não foi possível salvar a campanha.");
      return;
    }

    setSettingsMessage("Configuração global atualizada com sucesso.");
    router.refresh();
  }

  async function handleCreateUser(values: ManagedUserCreateInput) {
    setUserCreateMessage(undefined);
    setUserCreateError(undefined);

    const response = await fetch("/api/admin-global/users", {
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
      setUserCreateError(payload.error ?? "Não foi possível criar o usuário.");
      return;
    }

    setUserCreateMessage("Acesso criado com sucesso.");
    userCreateForm.reset({
      name: "",
      email: "",
      password: "",
      role: Role.OPERATOR
    });
    router.refresh();
  }

  async function handleUpdateUser(userId: string) {
    const draft = userDrafts[userId];

    if (!draft) {
      return;
    }

    updateUserDraft(userId, {
      loading: true,
      error: undefined,
      success: undefined
    });

    const response = await fetch(`/api/admin-global/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: draft.role,
        password: draft.password || undefined
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      updateUserDraft(userId, {
        loading: false,
        error: payload.error ?? "Não foi possível atualizar o usuário."
      });
      return;
    }

    updateUserDraft(userId, {
      loading: false,
      password: "",
      success: "Acesso atualizado."
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {bootstrapMode ? (
        <Card className="border border-amber-200 bg-amber-50">
          <h3 className="text-lg font-semibold text-amber-900">
            Modo de bootstrap ativo
          </h3>
          <p className="mt-2 text-sm text-amber-800">
            Ainda não existe nenhum usuário com perfil admin global. Use esta
            tela para criar o primeiro acesso mestre da operação.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card id="configuracoes">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Escopo da campanha
            </h3>
            <p className="text-sm text-slate-500">
              Defina o estado padrão e, se necessário, trave toda a operação
              nele.
            </p>
          </div>
          <FeedbackBanner message={settingsMessage} />
          {settingsError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {settingsError}
            </div>
          ) : null}
          <form
            className="space-y-4"
            onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)}
          >
            <Field
              label="Nome da campanha"
              error={settingsForm.formState.errors.nomeCampanha?.message}
            >
              <Input
                {...settingsForm.register("nomeCampanha")}
                placeholder="Ex.: Deputado Estadual SP 2026"
              />
            </Field>
            <Field
              label="Estado padrão"
              error={settingsForm.formState.errors.estadoPadrao?.message}
            >
              <Select {...settingsForm.register("estadoPadrao")}>
                <option value="">Selecione</option>
                {BRAZILIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600"
                checked={settingsForm.watch("restringirAoEstadoPadrao")}
                onChange={(event) =>
                  settingsForm.setValue(
                    "restringirAoEstadoPadrao",
                    event.target.checked,
                    { shouldValidate: true }
                  )
                }
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Restringir operação ao estado padrão
                </p>
                <p className="text-sm text-slate-500">
                  Quando ativo, admins e operadores só visualizam e cadastram
                  lideranças no estado configurado.
                </p>
              </div>
            </label>
            <div className="flex justify-end">
              <Button type="submit" disabled={settingsForm.formState.isSubmitting}>
                {settingsForm.formState.isSubmitting
                  ? "Salvando..."
                  : "Salvar campanha"}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Novo acesso
            </h3>
            <p className="text-sm text-slate-500">
              Crie usuários e defina o nível de permissão já na liberação.
            </p>
          </div>
          <FeedbackBanner message={userCreateMessage} />
          {userCreateError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {userCreateError}
            </div>
          ) : null}
          <form
            className="space-y-4"
            onSubmit={userCreateForm.handleSubmit(handleCreateUser)}
          >
            <Field label="Nome" error={userCreateForm.formState.errors.name?.message}>
              <Input {...userCreateForm.register("name")} placeholder="Nome completo" />
            </Field>
            <Field
              label="Email"
              error={userCreateForm.formState.errors.email?.message}
            >
              <Input
                {...userCreateForm.register("email")}
                type="email"
                placeholder="usuario@campanha.com"
              />
            </Field>
            <Field
              label="Senha inicial"
              error={userCreateForm.formState.errors.password?.message}
            >
              <Input
                {...userCreateForm.register("password")}
                type="password"
                placeholder="Mínimo de 6 caracteres"
              />
            </Field>
            <Field label="Perfil" error={userCreateForm.formState.errors.role?.message}>
              <Select {...userCreateForm.register("role")}>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={userCreateForm.formState.isSubmitting}>
                {userCreateForm.formState.isSubmitting
                  ? "Criando..."
                  : "Liberar acesso"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card id="usuarios" className="overflow-hidden p-0">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Acessos liberados
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {users.length} usuários cadastrados. {globalAdminCount} com perfil
            admin global.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Usuário
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
              {users.map((user) => {
                const draft = userDrafts[user.id];

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-medium text-slate-900">
                        {user.name}
                        {user.id === currentUserId ? " (você)" : ""}
                      </p>
                      <p className="text-sm text-slate-500">{user.email}</p>
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
                      <Select
                        value={draft?.role ?? user.role}
                        onChange={(event) =>
                          updateUserDraft(user.id, {
                            role: event.target.value as Role,
                            success: undefined,
                            error: undefined
                          })
                        }
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Input
                        type="password"
                        value={draft?.password ?? ""}
                        placeholder="Opcional"
                        onChange={(event) =>
                          updateUserDraft(user.id, {
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
                        onClick={() => handleUpdateUser(user.id)}
                        disabled={draft?.loading}
                      >
                        {draft?.loading ? "Salvando..." : "Salvar"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
