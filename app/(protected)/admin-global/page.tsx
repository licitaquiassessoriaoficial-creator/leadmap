import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { AdminGlobalPanel } from "@/components/admin-global/admin-global-panel";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getAdminGlobalPageData } from "@/services/admin-global-service";

export default async function AdminGlobalPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const data = await getAdminGlobalPageData(session.user.role);

  if (!data.allowed || !data.settings) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Global"
          description="Área reservada para configuração mestre da operação."
        />
        <Card>
          <p className="text-sm text-slate-600">
            O acesso a esta área é exclusivo do perfil admin global.
          </p>
        </Card>
      </div>
    );
  }

  const globalAdminCount = data.users.filter(
    (user) => user.role === Role.GLOBAL_ADMIN
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Global"
        description="Pré-configuração da campanha, escopo territorial e liberação de acessos."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Usuários liberados" value={data.users.length} />
        <StatCard label="Admins globais" value={globalAdminCount} />
        <StatCard
          label="Estado travado"
          value={data.settings.restringirAoEstadoPadrao
            ? data.settings.estadoPadrao ?? "Configurar"
            : "Livre"}
        />
      </div>
      <AdminGlobalPanel
        settings={data.settings}
        users={data.users}
        currentUserId={session.user.id}
        bootstrapMode={data.bootstrapMode}
      />
    </div>
  );
}
