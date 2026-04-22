import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Clock, Bot, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/automations")({
  component: AutomationsPage,
  head: () => ({
    meta: [
      { title: "Automações — NexaBoot" },
      { name: "description", content: "Configure automações de atendimento" },
    ],
  }),
});

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  active: boolean;
  icon: typeof MessageSquare;
}

const defaultAutomations: Automation[] = [
  {
    id: "1",
    name: "Boas-vindas",
    description: "Envia mensagem de boas-vindas automática para novos contatos",
    trigger: "Novo contato",
    active: true,
    icon: MessageSquare,
  },
  {
    id: "2",
    name: "Fora do horário",
    description: "Responde automaticamente fora do horário de atendimento",
    trigger: "Fora do expediente",
    active: true,
    icon: Clock,
  },
  {
    id: "3",
    name: "Chatbot FAQ",
    description: "Responde perguntas frequentes automaticamente",
    trigger: "Palavras-chave",
    active: false,
    icon: Bot,
  },
];

function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>(defaultAutomations);

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newState = !a.active;
          toast.success(`${a.name} ${newState ? "ativada" : "desativada"}`);
          return { ...a, active: newState };
        }
        return a;
      })
    );
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automações</h1>
          <p className="text-sm text-muted-foreground">Configure respostas automáticas e fluxos</p>
        </div>
        <button
          onClick={() => toast.info("Criação de automações personalizadas em breve!")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova automação
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {automations.map((auto) => (
          <div key={auto.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <auto.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{auto.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{auto.description}</p>
                  <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Gatilho: {auto.trigger}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleAutomation(auto.id)}
                className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${
                  auto.active ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${
                    auto.active ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
