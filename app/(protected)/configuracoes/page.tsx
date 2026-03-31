import { Role } from "@prisma/client";

import { PageHeader } from "@/components/shared/page-header";
import { RoleBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { POTENTIAL_THRESHOLDS } from "@/lib/constants/potential";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracoes"
        description="Resumo tecnico das regras operacionais, permissões e parametros do CRM."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Faixas de potencial
          </h3>
          <p className="text-sm text-slate-600">Regras centralizadas em constante reutilizavel.</p>
          <div className="space-y-2 text-sm text-slate-700">
            <p>Baixo: 0 a {POTENTIAL_THRESHOLDS.LOW_MAX}</p>
            <p>
              Medio: {POTENTIAL_THRESHOLDS.LOW_MAX + 1} a{" "}
              {POTENTIAL_THRESHOLDS.MEDIUM_MAX}
            </p>
            <p>Alto: acima de {POTENTIAL_THRESHOLDS.MEDIUM_MAX}</p>
          </div>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Permissoes</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Administrador</span>
              <RoleBadge role={Role.ADMIN} />
            </div>
            <p>
              Pode visualizar, criar, editar, inativar, reativar e excluir
              liderancas.
            </p>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Operador</span>
              <RoleBadge role={Role.OPERATOR} />
            </div>
            <p>Pode visualizar, criar e editar, sem exclusao definitiva.</p>
          </div>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Geocodificacao</h3>
          <p className="text-sm text-slate-600">
            Servico desacoplado com OpenStreetMap/Nominatim, pronto para troca
            futura de provedor.
          </p>
          <div className="space-y-2 text-sm text-slate-700">
            <p>Entrada: cidade + estado</p>
            <p>Saida: latitude e longitude</p>
            <p>Falha: cadastro mantido com localizacao pendente</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
