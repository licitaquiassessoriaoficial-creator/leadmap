import { notFound } from "next/navigation";

import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getLeadershipById } from "@/services/leadership-service";

type Params = Promise<{ id: string }>;

export default async function EditLeadershipPage({
  params
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await auth();
  const [leadership, scope] = await Promise.all([
    getLeadershipById(id, session?.user.role),
    getCampaignScope(session?.user.role)
  ]);

  if (!leadership) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar ${leadership.nome}`}
        description="Atualize dados cadastrais, potencial, indicações e localização."
      />
      <LeadershipForm
        mode="edit"
        initialData={leadership}
        lockedState={scope.enforcedState}
      />
    </div>
  );
}
