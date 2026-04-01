import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getLeadershipFilters } from "@/services/leadership-service";

export default async function NewLeadershipPage() {
  const session = await auth();
  const [scope, filterOptions] = await Promise.all([
    getCampaignScope(session?.user.role),
    getLeadershipFilters(session?.user.role, session?.user.id)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova lideranca"
        description="Cadastre uma nova lideranca com geocodificacao automatica por cidade e estado."
      />
      <LeadershipForm
        mode="create"
        lockedState={scope.enforcedState}
        cityOptions={filterOptions.cityOptions}
      />
    </div>
  );
}
