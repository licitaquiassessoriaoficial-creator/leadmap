import Link from "next/link";

import { LeadershipForm } from "@/components/liderancas/leadership-form";
import { Card } from "@/components/ui/card";
import { getLeadershipFilters, getReferralLeadership } from "@/services/leadership-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PublicRegistrationPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const referralId =
    typeof resolvedSearchParams.ref === "string" ? resolvedSearchParams.ref : undefined;
  const [filterOptions, referralLeadership] = await Promise.all([
    getLeadershipFilters(),
    referralId ? getReferralLeadership(referralId) : Promise.resolve(null)
  ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
        <Card className="bg-slate-950 text-white shadow-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            LeadMap CRM
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            Cadastro de liderancas para a operacao em SP
          </h1>
          <p className="mt-4 text-sm text-slate-300">
            Preencha os dados principais, informe sua cidade e registre as
            cidades sob responsabilidade. Se este cadastro vier por indicacao,
            o vinculo sera feito automaticamente.
          </p>
          <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p>
              Estado padrao: <strong>SP</strong>
            </p>
            <p>
              Base cartografica: <strong>OpenStreetMap</strong>
            </p>
            <p>
              Contato rapido: <strong>WhatsApp</strong>
            </p>
          </div>
          <div className="mt-8 text-sm text-slate-400">
            Ja possui acesso interno? <Link href="/login" className="font-semibold text-white">Entrar</Link>
          </div>
        </Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Novo cadastro
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Os dados enviados entram em validacao e ja podem alimentar a malha
              territorial quando aprovados.
            </p>
          </div>
          {referralId && !referralLeadership ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              O link de indicacao informado nao foi encontrado. Voce ainda pode
              concluir o cadastro sem vinculo.
            </div>
          ) : null}
          <LeadershipForm
            mode="create"
            variant="public"
            cityOptions={filterOptions.cityOptions}
            lockedState="SP"
            referralId={referralLeadership?.id}
            referralName={referralLeadership?.nome}
          />
        </div>
      </div>
    </main>
  );
}
