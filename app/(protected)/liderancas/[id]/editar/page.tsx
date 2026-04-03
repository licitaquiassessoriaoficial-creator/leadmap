import { notFound } from "next/navigation";

import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { getCampaignScope } from "@/services/campaign-settings-service";
import {
  getLeadershipById,
  getLeadershipFilters
} from "@/services/leadership-service";

type Params = Promise<{ id: string }>;

export default async function EditLeadershipPage({
  params
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await auth();
  const [leadership, scope, filterOptions] = await Promise.all([
    getLeadershipById(id, session?.user.role, session?.user.id),
    getCampaignScope(session?.user.role),
    getLeadershipFilters(session?.user.role, session?.user.id)
  ]);

  if (!leadership) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar ${leadership.nome}`}
        description="Atualize dados cadastrais, potencial, custo, score e território."
      />
      <LeadershipForm
        mode="edit"
        initialData={leadership}
        lockedState={scope.enforcedState}
        cityOptions={filterOptions.cityOptions}
      />
    </div>
  );
}
