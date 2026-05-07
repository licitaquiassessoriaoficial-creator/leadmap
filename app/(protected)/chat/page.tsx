import { ChatAssistant } from "@/components/chat/chat-assistant";
import { PageHeader } from "@/components/shared/page-header";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assistente"
        description="Chat para treinamento rapido da equipe sobre cadastro de liderancas."
      />
      <ChatAssistant />
    </div>
  );
}
