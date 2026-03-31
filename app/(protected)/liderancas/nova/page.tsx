import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewLeadershipPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova lideranca"
        description="Cadastre uma nova lideranca com geocodificacao automatica por cidade e estado."
      />
      <LeadershipForm mode="create" />
    </div>
  );
}
