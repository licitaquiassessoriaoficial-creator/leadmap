import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { getCampaignScope } from "@/services/campaign-settings-service";

export default async function NewLeadershipPage() {
  const session = await auth();
  const scope = await getCampaignScope(session?.user.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova liderança"
        description="Cadastre uma nova liderança com geocodificação automática por cidade e estado."
      />
      <LeadershipForm mode="create" lockedState={scope.enforcedState} />
    </div>
  );
}
