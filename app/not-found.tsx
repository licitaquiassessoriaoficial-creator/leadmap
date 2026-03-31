import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-4 rounded-3xl bg-white p-8 text-center shadow-panel">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-600">
          LeadMap CRM
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Conteúdo não encontrado
        </h1>
        <p className="text-sm text-slate-500">
          A página solicitada não existe ou foi removida.
        </p>
        <Link href="/dashboard">
          <Button>Voltar ao dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
