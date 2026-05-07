import Image from "next/image";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

const osvaldoBio = [
  "Osvaldo Quadro nasceu em Campinas, São Paulo, em 10 de março de 1974. Filho caçula, cresceu em uma família simples, cercado de amor, fé e trabalho, ao lado dos pais e de duas irmãs mais velhas.",
  "Sua trajetória profissional começou cedo, em uma loja de calçados. Formou-se técnico em Processamento de Dados, graduou-se em Direito e fez pós-graduação em Direito Civil, sempre usando a educação como ferramenta de transformação.",
  "Empreendedor por natureza, atuou por cerca de 20 anos no ramo de comunicação visual. Em 2005, após o assassinato de sua mãe durante um assalto, enfrentou depressão profunda, graves problemas de saúde e extrema dificuldade financeira. Foi nesse momento que encontrou força para recomeçar do zero.",
  "Ao lado de um amigo que acreditou em seu potencial, fundou uma empresa voltada para licitações públicas. Com disciplina, visão de gestão e foco em resultado, a empresa cresceu, tornou-se referência no setor e passou a atender clientes de alto nível, como a Petrobras.",
  "Ao longo da carreira, Osvaldo já empregou mais de mil pessoas e hoje mantém cerca de 270 colaboradores diretos. Também apoiou o crescimento de outras empresas por meio de licitações e desenvolvimento estratégico de negócios.",
  "Cristão desde 1998 e pastor por formação, sempre esteve envolvido com igrejas, ONGs e projetos sociais. Sua fé se manifesta em princípios como lealdade, caráter, responsabilidade e compromisso com o próximo.",
  "Depois de ver de perto as distorções do sistema público, decidiu entrar para a política por propósito, não por carreira. Osvaldo Quadro é o nome que irá concorrer como deputado, defendendo empreendedorismo, educação de qualidade, políticas sociais que gerem autonomia, modernização das relações de trabalho e menos burocracia."
];

export default function OsvaldoQuadroPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quem é Osvaldo Quadro"
        description="Conheça a trajetória do nome que irá concorrer como deputado."
      />

      <Card className="overflow-hidden p-0">
        <div className="relative w-full">
          <Image
            src="/osvaldo-quadro-capa.jpg"
            alt="Osvaldo Quadro"
            width={1200}
            height={500}
            className="w-full object-contain"
            priority
          />
          <div className="border-t border-slate-100 bg-white px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Pré-candidato a Deputado Federal
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Osvaldo Quadro</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Empresário, cristão e nome que irá concorrer como deputado, com base política e história de vida ligadas a Campinas e ao empreendedorismo.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">História de vida</p>
            <p className="mt-1 text-sm text-slate-500">
              Resumo institucional para apresentação dentro do LeadMap.
            </p>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            {osvaldoBio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Posicionamento</p>
            <p className="mt-1 text-sm text-slate-500">
              Síntese para uso rápido da equipe e das lideranças.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Candidatura
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              Deputado
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Osvaldo Quadro é o nome que irá concorrer e deve ser apresentado como referência principal da operação.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Bandeiras principais</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Fomento ao empreendedorismo</li>
              <li>Educação de qualidade</li>
              <li>Políticas sociais com autonomia</li>
              <li>Modernização das relações de trabalho</li>
              <li>Menos burocracia e mais eficiência pública</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}