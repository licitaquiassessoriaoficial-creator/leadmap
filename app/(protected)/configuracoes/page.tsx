import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { LinkCard } from "@/components/shared/link-card";
import { PageHeader } from "@/components/shared/page-header";
import { RoleBadge } from "@/components/shared/status-badge";
import { POTENTIAL_THRESHOLDS } from "@/lib/constants/potential";
import { auth } from "@/lib/auth";
import { canViewSettings } from "@/lib/permissions";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!canViewSettings(session.user.role)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Configurações"
          description="Área disponível apenas para administradores."
        />
        <Card>
          <p className="text-sm text-slate-600">
            Seu perfil atual não possui permissão para acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Resumo técnico das regras operacionais, permissões e parâmetros do CRM."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <LinkCard
          href="/admin-global"
          className="space-y-3"
          actionLabel="Gerenciar regra global"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Faixas de potencial
          </h3>
          <p className="text-sm text-slate-600">Regras centralizadas em constante reutilizável.</p>
          <div className="space-y-2 text-sm text-slate-700">
            <p>Baixo: 0 a {POTENTIAL_THRESHOLDS.LOW_MAX}</p>
            <p>
              Médio: {POTENTIAL_THRESHOLDS.LOW_MAX + 1} a{" "}
              {POTENTIAL_THRESHOLDS.MEDIUM_MAX}
            </p>
            <p>Alto: acima de {POTENTIAL_THRESHOLDS.MEDIUM_MAX}</p>
          </div>
        </LinkCard>
        <LinkCard href="/usuarios" className="space-y-3" actionLabel="Abrir acessos">
          <h3 className="text-lg font-semibold text-slate-900">Permissões</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Administrador</span>
              <RoleBadge role={Role.ADMIN} />
            </div>
            <p>
              Pode visualizar, criar, editar, inativar, reativar e excluir
              lideranças.
            </p>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Operador</span>
              <RoleBadge role={Role.OPERATOR} />
            </div>
            <p>Pode visualizar, criar e editar, sem exclusão definitiva.</p>
          </div>
        </LinkCard>
        <LinkCard href="/mapa" className="space-y-3" actionLabel="Abrir mapa">
          <h3 className="text-lg font-semibold text-slate-900">Geocodificação</h3>
          <p className="text-sm text-slate-600">
            Serviço desacoplado com OpenStreetMap/Nominatim, pronto para troca
            futura de provedor.
          </p>
          <div className="space-y-2 text-sm text-slate-700">
            <p>Entrada: cidade + estado</p>
            <p>Saída: latitude e longitude</p>
            <p>Falha: cadastro mantido com localização pendente</p>
          </div>
        </LinkCard>
      </div>
    </div>
  );
}
