import Link from "next/link";

import { LeadershipFilters } from "@/components/liderancas/leadership-filters";
import { MapPanel } from "@/components/mapa/map-panel";
import { PageHeader } from "@/components/shared/page-header";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { buildSearchParams } from "@/lib/utils";
import { getLeadershipFilters } from "@/services/leadership-service";
import { getMapData } from "@/services/map-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MapPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session) {
    return null;
  }

  const [mapData, filterOptions] = await Promise.all([
    getMapData(resolvedSearchParams, session.user.role),
    getLeadershipFilters(session.user.role)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa"
        description="Pins por liderança com cor baseada na faixa de potencial e agrupamento automático."
      />
      <LeadershipFilters
        cities={filterOptions.cities}
        states={filterOptions.states}
        initialValues={{
          cidade: mapData.filters.cidade,
          estado: mapData.filters.estado,
          faixaPotencial: mapData.filters.faixaPotencial,
          status: mapData.filters.status
        }}
        showSearch={false}
        showResponsible={false}
        showPeriod={false}
        lockedState={filterOptions.enforcedState}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr,260px]">
        <MapPanel points={mapData.points} />
        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Legenda</h3>
            <p className="text-sm text-slate-500">
              {mapData.points.length} pins visíveis de {mapData.total} lideranças filtradas.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href={`/mapa?${buildSearchParams({
                cidade: mapData.filters.cidade,
                estado: mapData.filters.estado,
                faixaPotencial: "HIGH",
                status: mapData.filters.status
              })}`}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="text-sm text-slate-600">Potencial alto</span>
              <PotentialBadge level="HIGH" />
            </Link>
            <Link
              href={`/mapa?${buildSearchParams({
                cidade: mapData.filters.cidade,
                estado: mapData.filters.estado,
                faixaPotencial: "MEDIUM",
                status: mapData.filters.status
              })}`}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="text-sm text-slate-600">Potencial médio</span>
              <PotentialBadge level="MEDIUM" />
            </Link>
            <Link
              href={`/mapa?${buildSearchParams({
                cidade: mapData.filters.cidade,
                estado: mapData.filters.estado,
                faixaPotencial: "LOW",
                status: mapData.filters.status
              })}`}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="text-sm text-slate-600">Potencial baixo</span>
              <PotentialBadge level="LOW" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
