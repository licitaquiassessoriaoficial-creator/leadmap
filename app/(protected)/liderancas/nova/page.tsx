import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewLeadershipPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova liderança"
        description="Cadastre uma nova liderança com geocodificação automática por cidade e estado."
      />
      <LeadershipForm mode="create" />
    </div>
  );
}
