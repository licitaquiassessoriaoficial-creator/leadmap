import { notFound } from "next/navigation";

import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { PageHeader } from "@/components/shared/page-header";
import { getLeadershipById } from "@/services/leadership-service";

type Params = Promise<{ id: string }>;

export default async function EditLeadershipPage({
  params
}: {
  params: Params;
}) {
  const { id } = await params;
  const leadership = await getLeadershipById(id);

  if (!leadership) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar ${leadership.nome}`}
        description="Atualize dados cadastrais, potencial, indicacoes e localizacao."
      />
      <LeadershipForm mode="edit" initialData={leadership} />
    </div>
  );
}
