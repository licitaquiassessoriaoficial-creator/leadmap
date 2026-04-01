import { LeadershipFilters } from "@/components/liderancas/leadership-filters";
import { MapPanel } from "@/components/mapa/map-panel";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
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
    getMapData(resolvedSearchParams, session.user.role, session.user.id),
    getLeadershipFilters(session.user.role, session.user.id)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa de liderancas"
        description="Visualizacao focada em Sao Paulo, com pins por potencial e cobertura por cidade."
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
        lockedState={filterOptions.enforcedState ?? "SP"}
      />
      <MapPanel
        points={mapData.points}
        cityPoints={mapData.cityPoints}
        leadershipCoverage={mapData.leadershipCoverage}
      />
    </div>
  );
}
