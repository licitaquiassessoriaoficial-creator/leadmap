"use client";

import { useState } from "react";

import { ChatAssistant } from "./chat-assistant";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-20 right-4 z-50 w-[min(95vw,480px)] rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-3xl border-b border-slate-200 bg-brand-600 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Assistente de Cadastro</p>
              <p className="text-xs text-brand-100">Ajuda para inserir novas lideranças</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-1.5 text-white transition hover:bg-brand-700"
              aria-label="Fechar chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            <ChatAssistant compact />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl"
        aria-label="Abrir assistente de cadastro"
        title="Assistente de cadastro de lideranças"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
}
