"use client";

import { useMemo, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const quickPrompts = [
  "Quero cadastrar uma nova liderança. O que preciso informar?",
  "Quais campos são obrigatórios no formulário de liderança?",
  "Como preencher foto de capa e biografia de uma liderança?",
  "Sugira uma biografia curta para um coordenador municipal."
];

const compactQuickPrompts = [
  "Quero cadastrar uma nova liderança.",
  "Quais dados são obrigatórios?",
  "Gere uma biografia para minha liderança."
];

const systemPrompt =
  "Você é o assistente do LeadMap CRM, especializado em ajudar coordenadores a cadastrar novas lideranças políticas no sistema. " +
  "Ao cadastrar uma liderança, os campos obrigatórios são: Nome completo, Telefone (com DDD), Cidade (SP) e Votos estimados. " +
  "Campos opcionais: WhatsApp, E-mail, CPF, Bairro, Endereço, Foto de perfil (URL), Foto de capa (URL), Biografia, Custo total, Meta de votos individual, Status (Ativo/Pendente/Inativo), Observações e Cidades sob responsabilidade. " +
  "Quando o usuário informar dados de uma liderança em linguagem natural (ex: nome, telefone, cidade), organize essas informações e liste os campos que ainda faltam. " +
  "Responda sempre em português, de forma objetiva e prática.";

export function ChatAssistant({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending]
  );

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...nextMessages
          ]
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        data?: { role?: string; content?: string };
      };

      if (!response.ok || !payload.data?.content) {
        setError(payload.error ?? "Nao foi possivel obter resposta do assistente.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.data?.content ?? ""
        }
      ]);
    } catch {
      setError("Nao foi possivel obter resposta do assistente.");
    } finally {
      setIsSending(false);
    }
  }

  const prompts = compact ? compactQuickPrompts : quickPrompts;

  if (compact) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
              onClick={() => sendMessage(prompt)}
              disabled={isSending}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-xs italic text-slate-400">
              Pergunte como preencher o formulário, ou descreva a liderança em linguagem natural.
            </p>
          ) : null}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[90%] rounded-xl bg-brand-600 px-3 py-2 text-xs text-white"
                  : "mr-auto max-w-[90%] rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-800"
              }
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          ))}
          {isSending ? (
            <div className="mr-auto rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
              Pensando...
            </div>
          ) : null}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Descreva a liderança ou faça uma pergunta..."
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {isSending ? "..." : "Enviar"}
          </button>
        </form>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <p className="text-sm font-semibold text-slate-900">Prompts rapidos</p>
        <p className="text-xs text-slate-500">
          Use estes exemplos para testar o chat agora.
        </p>
        <div className="space-y-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
              onClick={() => sendMessage(prompt)}
              disabled={isSending}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[620px] flex-col rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Assistente de treinamento</p>
          <p className="text-xs text-slate-500">
            Apoio para cadastro de liderancas e orientacao de coordenadores.
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              Envie uma pergunta para iniciar. Exemplo: "Como cadastrar uma nova lideranca com biografia e foto de capa?"
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-brand-600 px-4 py-3 text-sm text-white"
                  : "mr-auto max-w-[85%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800"
              }
            >
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] opacity-70">
                {message.role === "user" ? "Voce" : "Assistente"}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          ))}

          {isSending ? (
            <div className="mr-auto max-w-[85%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Assistente pensando...
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-200 p-4">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={4}
              placeholder="Digite sua pergunta sobre cadastro, biografia, foto de capa ou treinamento..."
              className="w-full resize-none rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                As mensagens sao enviadas para o endpoint interno /api/chat.
              </p>
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
          {error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
