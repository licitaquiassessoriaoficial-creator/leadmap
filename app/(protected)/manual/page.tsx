import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

const sections = [
  {
    id: "dashboard",
    emoji: "📊",
    title: "Dashboard",
    description: "Visão geral dos indicadores da campanha.",
    items: [
      {
        title: "Total de lideranças",
        text: "Soma de todas as lideranças cadastradas, independentemente do status."
      },
      {
        title: "Votos estimados",
        text: "Soma dos votos estimados de todas as lideranças ativas. Indica o potencial eleitoral total do território."
      },
      {
        title: "Votos reais",
        text: "Votos confirmados nas urnas (preenchidos após a eleição). Antes da eleição, esse campo fica em branco ou zerado."
      },
      {
        title: "Custo por voto",
        text: "Calculado automaticamente: Custo total ÷ Votos estimados. Ajuda a medir a eficiência do investimento."
      },
      {
        title: "Gráficos de desempenho",
        text: "Exibem a distribuição por cidade, potencial de votos por região e evolução histórica do cadastro."
      }
    ]
  },
  {
    id: "liderancas",
    emoji: "🤝",
    title: "Lideranças",
    description: "Cadastro e gestão de cada apoiador ou coordenador municipal.",
    items: [
      {
        title: "Cadastrar nova liderança",
        text: "Clique em \"Nova liderança\". Os campos obrigatórios são: Nome completo, Telefone (com DDD), Cidade e Votos estimados. Todos os outros são opcionais."
      },
      {
        title: "Status da liderança",
        text: "Ativo: em plena atividade. Pendente: aguarda confirmação. Inativo: desligado ou em pausa. O status afeta o ranking e os totais do dashboard."
      },
      {
        title: "Foto de perfil e foto de capa",
        text: "Use a ferramenta de upload (ícone de câmera) para enviar a foto de perfil. Para foto de capa, cole a URL pública da imagem no campo correspondente."
      },
      {
        title: "Biografia",
        text: "Texto livre sobre a trajetória da liderança. Aparece na página de detalhe com destaque visual. Ideal para registrar o histórico político e social."
      },
      {
        title: "Cidades sob responsabilidade",
        text: "Lista de municípios que essa liderança cobre além da cidade principal. Útil para coordenadores regionais."
      },
      {
        title: "Pesquisa e filtros",
        text: "Use a barra de busca para encontrar pelo nome. Use os filtros de cidade, status e potencial para segmentar a lista."
      },
      {
        title: "Editar ou excluir",
        text: "Abra a liderança e clique em \"Editar\". Para remover, clique em \"Excluir\" no rodapé do formulário de edição. Exclusões são permanentes."
      }
    ]
  },
  {
    id: "assistente",
    emoji: "💬",
    title: "Assistente de Cadastro (Chat)",
    description: "Use linguagem natural para cadastrar lideranças mais rápido.",
    items: [
      {
        title: "Como funciona",
        text: "O assistente entende português natural. Você pode descrever uma liderança como falaria normalmente: "Maria Silva, (19) 99999-0000, Campinas, estima uns 300 votos"."
      },
      {
        title: "Pré-preencher o formulário",
        text: "Quando o assistente identificar nome, telefone, cidade e votos estimados, aparecerá um botão verde \"\u2705 Pré-preencher formulário\". Ao clicar, o formulário de nova liderança abre com os dados já preenchidos. Você só precisa conferir e salvar."
      },
      {
        title: "Campos reconhecidos pelo chat",
        text: "Nome completo, telefone (com ou sem +55), cidade, votos estimados, e-mail, bairro e observações. Todos os outros campos você preenche manualmente no formulário."
      },
      {
        title: "Chat flutuante",
        text: "O ícone de balão no canto inferior direito de qualquer página abre o assistente em modo compacto, sem sair da tela em que você está."
      },
      {
        title: "Dica de uso",
        text: "Descreva os dados de uma vez só na mesma mensagem para o assistente reconhecer tudo de uma vez. Ex: \"Cadastrar João Costa, 11987654321, São Paulo capital, 500 votos estimados\"."
      }
    ]
  },
  {
    id: "ranking",
    emoji: "🏆",
    title: "Ranking",
    description: "Classificação automática das lideranças por pontuação.",
    items: [
      {
        title: "Como o score é calculado",
        text: "O sistema combina: votos estimados, votos reais (quando disponíveis), custo por voto e meta individual atingida. Lideranças mais eficientes e com maior potencial sobem no ranking."
      },
      {
        title: "Nível de potencial",
        text: "Classificado automaticamente em: Baixo, Médio, Alto e Muito alto, com base nos votos estimados em relação às demais lideranças cadastradas."
      },
      {
        title: "Filtros do ranking",
        text: "Filtre por cidade ou estado para ver o ranking regional. Útil para comparar desempenho dentro de um mesmo município."
      }
    ]
  },
  {
    id: "mapa",
    emoji: "🗺️",
    title: "Mapa",
    description: "Visualização geográfica das lideranças por município.",
    items: [
      {
        title: "Pins no mapa",
        text: "Cada liderança aparece como um pin na cidade cadastrada. A cor indica o nível de potencial de votos."
      },
      {
        title: "Agrupamento (clusters)",
        text: "Em regiões com muitas lideranças, os pins se agrupam automaticamente. Clique no grupo para expandir e ver individualmente."
      },
      {
        title: "Clique no pin",
        text: "Abre um painel rápido com nome, telefone e votos estimados da liderança. Há um link direto para o perfil completo."
      },
      {
        title: "Geocodificação automática",
        text: "Ao cadastrar uma liderança com cidade e estado, o sistema busca automaticamente as coordenadas geográficas. Não é necessário informar latitude e longitude manualmente."
      }
    ]
  },
  {
    id: "cidades",
    emoji: "🏙️",
    title: "Cidades",
    description: "Painel de métricas por município.",
    items: [
      {
        title: "Indicadores por cidade",
        text: "Para cada cidade são exibidos: número de lideranças, total de votos estimados, votos reais e custo médio por voto."
      },
      {
        title: "Meta eleitoral",
        text: "A meta de votos por cidade é definida nas Configurações. O progresso aparece como barra de porcentagem na lista de cidades."
      },
      {
        title: "Ordenação",
        text: "Ordene por nome, número de lideranças ou votos estimados clicando no cabeçalho da coluna."
      }
    ]
  },
  {
    id: "usuarios",
    emoji: "👤",
    title: "Usuários",
    description: "Gerenciamento de quem acessa o sistema (apenas Admins).",
    items: [
      {
        title: "Perfis disponíveis",
        text: "Admin: acesso completo, pode cadastrar e excluir usuários, ver e editar configurações. Operador: pode cadastrar e editar lideranças, visualizar mapa, ranking e cidades, mas não acessa configurações."
      },
      {
        title: "Criar usuário",
        text: "Clique em \"Novo usuário\", informe nome, e-mail e senha inicial. O usuário deve trocar a senha no primeiro acesso."
      },
      {
        title: "Desativar acesso",
        text: "Para remover o acesso de um colaborador sem excluir o histórico, edite o usuário e altere o status para Inativo."
      },
      {
        title: "Operadores e territórios",
        text: "Cada operador pode ter um estado ou conjunto de municípios associados. Isso limita quais lideranças ele vê na lista."
      }
    ]
  },
  {
    id: "configuracoes",
    emoji: "⚙️",
    title: "Configurações",
    description: "Parâmetros gerais da campanha (apenas Admins).",
    items: [
      {
        title: "Meta de votos total",
        text: "Define o objetivo geral de votos da campanha. Usado nos gráficos do dashboard para mostrar o progresso."
      },
      {
        title: "Meta por cidade",
        text: "Distribui a meta total entre os municípios. Aparece na tela de Cidades como barra de progresso."
      },
      {
        title: "Estado restrito",
        text: "Quando definido, todos os cadastros ficam limitados àquele estado. Útil para campanhas estaduais focadas em um único UF."
      },
      {
        title: "Custo de campanha",
        text: "Informe o orçamento total para que o sistema calcule o custo por voto automaticamente no dashboard."
      }
    ]
  },
  {
    id: "dicas",
    emoji: "💡",
    title: "Dicas rápidas",
    description: "Boas práticas para aproveitar melhor o sistema.",
    items: [
      {
        title: "Use o chat para agilizar o cadastro",
        text: "Em campo, anote nome, telefone, cidade e votos estimados. Depois, abra o chat, descreva tudo de uma vez e clique em "Pré-preencher formulário"."
      },
      {
        title: "Mantenha o status atualizado",
        text: "Lideranças inativas inflam a contagem. Marque como Inativo quem não estiver mais engajado."
      },
      {
        title: "Preencha votos reais após a eleição",
        text: "Isso alimenta o histórico e melhora a precisão do ranking em futuras campanhas."
      },
      {
        title: "Foto de perfil melhora o engajamento",
        text: "Cadastrar a foto ajuda os coordenadores a reconhecer rapidamente quem é cada liderança na lista."
      },
      {
        title: "Use filtros antes de exportar",
        text: "Filtre por cidade ou status antes de exportar a lista para ter um relatório segmentado."
      }
    ]
  }
];

export default function ManualPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Manual de uso"
        description="Guia completo do LeadMap CRM — aprenda a usar cada funcionalidade do sistema."
      />

      {/* Índice rápido */}
      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Ir para seção</p>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {section.emoji} {section.title}
            </a>
          ))}
        </div>
      </Card>

      {/* Seções */}
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-xl">
              {section.emoji}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-500">{section.description}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <Card key={item.title} className="p-4">
                <p className="mb-1 text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm leading-relaxed text-slate-600">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {/* Rodapé */}
      <Card className="border-brand-100 bg-brand-50 p-5">
        <p className="text-sm font-semibold text-brand-900">Precisa de mais ajuda?</p>
        <p className="mt-1 text-sm text-brand-700">
          Use o assistente de chat (ícone de balão no canto inferior direito) para tirar dúvidas
          específicas sobre o sistema a qualquer momento.
        </p>
      </Card>
    </div>
  );
}
