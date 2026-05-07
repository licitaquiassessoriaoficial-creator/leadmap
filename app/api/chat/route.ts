import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { chatRequestSchema } from "@/validations/chat";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Nao autenticado", 401);
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  if (!apiKey) {
    return jsonError("GROQ_API_KEY nao configurada no ambiente", 500);
  }

  try {
    const payload = chatRequestSchema.parse(await request.json());

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        temperature: 0.3
      })
    });

    const data = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: Array<{ message?: { role?: string; content?: string } }>;
    };

    if (!response.ok) {
      return jsonError(data.error?.message ?? "Falha ao consultar chat", response.status);
    }

    const message = data.choices?.[0]?.message;

    if (!message?.content) {
      return jsonError("Resposta vazia do provedor de chat", 502);
    }

    return NextResponse.json({
      data: {
        role: message.role ?? "assistant",
        content: message.content
      }
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Falha ao processar chat");
  }
}
