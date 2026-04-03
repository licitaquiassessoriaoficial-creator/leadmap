import Link from "next/link";

import { PublicSignupForm } from "@/components/public/public-signup-form";
import { Card } from "@/components/ui/card";
import {
  getLeadershipFilters,
  getReferralLeadership
} from "@/services/leadership-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PublicRegistrationPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const referralReference =
    typeof resolvedSearchParams.ref === "string" ? resolvedSearchParams.ref : undefined;
  const [filterOptions, referralLeadership] = await Promise.all([
    getLeadershipFilters(),
    referralReference
      ? getReferralLeadership(referralReference)
      : Promise.resolve(null)
  ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
        <Card className="bg-slate-950 text-white shadow-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Radar de Lideranças
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            Cadastro público de lideranças para a operação em SP
          </h1>
          <p className="mt-4 text-sm text-slate-300">
            Preencha os dados básicos para registrar uma nova indicação. O time
            interno valida o cadastro e transforma isso em cobertura territorial.
          </p>
          <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p>
              Estado padrão: <strong>SP</strong>
            </p>
            <p>
              Base cartográfica: <strong>OpenStreetMap</strong>
            </p>
            <p>
              Contato rápido: <strong>WhatsApp</strong>
            </p>
          </div>
          <div className="mt-8 text-sm text-slate-400">
            Já possui acesso interno?{" "}
            <Link href="/login" className="font-semibold text-white">
              Entrar
            </Link>
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Novo cadastro
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              O formulário público registra a origem da indicação, cria um
              histórico do contato e disponibiliza o cadastro para análise da equipe.
            </p>
          </div>
          {referralReference && !referralLeadership ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              O link de indicação informado não foi encontrado. Você ainda pode
              concluir o cadastro sem vínculo.
            </div>
          ) : null}
          <PublicSignupForm
            cityOptions={filterOptions.cityOptions}
            referralCode={referralLeadership?.referralCode}
            referralName={referralLeadership?.nome}
          />
        </div>
      </div>
    </main>
  );
}
