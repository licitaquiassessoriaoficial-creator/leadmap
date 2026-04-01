import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TeamUsersPanel } from "@/components/users/team-users-panel";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { canManageTeamUsers } from "@/lib/permissions";
import { getManagedUserSummary, getManagedUsers } from "@/services/user-service";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === Role.GLOBAL_ADMIN) {
    redirect("/admin-global");
  }

  if (!canManageTeamUsers(session.user.role)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Usuários"
          description="Somente administradores podem gerenciar operadores vinculados ao próprio time."
        />
        <Card>
          <p className="text-sm text-slate-600">
            Seu perfil atual não possui permissão para acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  const [users, summary] = await Promise.all([
    getManagedUsers(session.user.id, session.user.role),
    getManagedUserSummary(session.user.id, session.user.role)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha equipe"
        description="Gerencie apenas operadores cadastrados por você e acompanhe seu escopo de operação."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Operadores do time"
          value={summary.operators}
          helper="Ir para cadastro"
          href="/usuarios#novo-operador"
          actionLabel="Cadastrar"
        />
        <StatCard
          label="Meu perfil"
          value="Admin"
          helper="Escopo restrito à sua equipe"
          href="/configuracoes"
          actionLabel="Ver regras"
        />
        <StatCard
          label="Escopo"
          value="Próprio"
          helper="Dashboard, mapa e ranking seguem esse time"
          href="/dashboard"
          actionLabel="Abrir painel"
        />
      </div>
      <TeamUsersPanel users={users} />
    </div>
  );
}
