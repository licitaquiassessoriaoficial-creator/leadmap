import { LeadershipStatus, Role } from "@prisma/client";

import { listAllLeaderships } from "@/repositories/leadership-repository";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getCitiesCoverageSnapshot } from "@/services/city-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";

export type StrategicAlert = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  href?: string;
};

export async function getStrategicAlerts(role?: Role | null, userId?: string) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const responsavelIds = await getScopedLeadershipUserIds(userId, role);
  const [coverage, leaderships] = await Promise.all([
    getCitiesCoverageSnapshot(role, userId),
    listAllLeaderships({
      estado: scope?.enforcedState ?? "SP",
      responsavelIds
    })
  ]);

  const alerts: StrategicAlert[] = [];
  const biggestMissingCity = coverage.priorityCities.find(
    (city) => city.totalResponsaveis === 0
  );
  const expensiveLeadership = leaderships
    .filter(
      (item) =>
        item.status === LeadershipStatus.ACTIVE &&
        item.custoPorVoto != null &&
        item.custoPorVoto > 10
    )
    .sort((a, b) => (b.custoPorVoto ?? 0) - (a.custoPorVoto ?? 0))[0];
  const delayedCity = coverage.priorityCities.find(
    (city) => city.totalResponsaveis > 0 && city.progresso < 30
  );
  const inactiveLeadership = leaderships.find(
    (item) => item.status === LeadershipStatus.INACTIVE
  );
  const pendingLeadership = leaderships.find(
    (item) => item.status === LeadershipStatus.PENDING
  );

  if (biggestMissingCity) {
    alerts.push({
      id: `missing-${biggestMissingCity.id}`,
      severity: "high",
      title: "Cidade estratégica sem cobertura",
      description: `${biggestMissingCity.nome} segue sem liderança e tem ${new Intl.NumberFormat(
        "pt-BR"
      ).format(biggestMissingCity.totalEleitores)} eleitores.`,
      href: "/cidades"
    });
  }

  if (expensiveLeadership) {
    alerts.push({
      id: `cost-${expensiveLeadership.id}`,
      severity: "high",
      title: "Custo por voto elevado",
      description: `${expensiveLeadership.nome} está com custo por voto de ${new Intl.NumberFormat(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      ).format(expensiveLeadership.custoPorVoto ?? 0)}.`,
      href: `/liderancas/${expensiveLeadership.id}`
    });
  }

  if (delayedCity) {
    alerts.push({
      id: `delay-${delayedCity.id}`,
      severity: "medium",
      title: "Meta da cidade atrasada",
      description: `${delayedCity.nome} está com ${delayedCity.progresso.toFixed(
        1
      )}% da meta atingida.`,
      href: `/cidades/${delayedCity.id}`
    });
  }

  if (inactiveLeadership) {
    alerts.push({
      id: `inactive-${inactiveLeadership.id}`,
      severity: "medium",
      title: "Liderança inativa",
      description: `${inactiveLeadership.nome} segue inativa e pode impactar a cobertura territorial.`,
      href: `/liderancas/${inactiveLeadership.id}`
    });
  }

  if (pendingLeadership) {
    alerts.push({
      id: `pending-${pendingLeadership.id}`,
      severity: "low",
      title: "Cadastro aguardando validação",
      description: `${pendingLeadership.nome} está pendente e pode virar reforço de cobertura após revisão.`,
      href: `/liderancas/${pendingLeadership.id}`
    });
  }

  return alerts.slice(0, 6);
}
