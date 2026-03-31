import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { UsersTable } from "@/components/users/users-table";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import { getUsers } from "@/services/user-service";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session.user.role)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Usuarios"
          description="Apenas administradores podem visualizar a gestao de usuarios."
        />
        <Card>
          <p className="text-sm text-slate-600">
            Seu perfil atual nao possui permissao para acessar esta pagina.
          </p>
        </Card>
      </div>
    );
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Visao administrativa dos acessos cadastrados no sistema."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de usuarios" value={users.length} />
        <StatCard
          label="Administradores"
          value={users.filter((user) => user.role === "ADMIN").length}
        />
        <StatCard
          label="Operadores"
          value={users.filter((user) => user.role === "OPERATOR").length}
        />
      </div>
      <UsersTable users={users} />
    </div>
  );
}
