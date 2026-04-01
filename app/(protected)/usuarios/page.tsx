import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { UsersTable } from "@/components/users/users-table";
import { auth } from "@/lib/auth";
import { canViewUsers } from "@/lib/permissions";
import { getUsers } from "@/services/user-service";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!canViewUsers(session.user.role)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Usuários"
          description="Apenas administradores podem visualizar a gestão de usuários."
        />
        <Card>
          <p className="text-sm text-slate-600">
            Seu perfil atual não possui permissão para acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Visão administrativa dos acessos cadastrados no sistema."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de usuários" value={users.length} />
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
