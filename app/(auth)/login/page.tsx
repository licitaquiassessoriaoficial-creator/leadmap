import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-panel lg:grid-cols-[1.1fr,0.9fr]">
        <section className="hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
              LeadMap CRM
            </p>
            <h1 className="max-w-md text-4xl font-semibold leading-tight">
              Mapeie lideranças, acompanhe potencial e enxergue o território em
              um painel único.
            </h1>
            <p className="max-w-lg text-sm text-brand-100">
              Plataforma administrativa para cadastro, ranking e análise
              geográfica de lideranças políticas ou comunitárias.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="#login-access"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              <p className="text-sm text-brand-100">Visão executiva</p>
              <p className="mt-2 text-2xl font-semibold">Dashboard em tempo real</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
                Acessar formulário
              </p>
            </Link>
            <Link
              href="#login-access"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              <p className="text-sm text-brand-100">Cobertura territorial</p>
              <p className="mt-2 text-2xl font-semibold">Mapa com pins por cidade</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
                Entrar no sistema
              </p>
            </Link>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 md:p-10">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
