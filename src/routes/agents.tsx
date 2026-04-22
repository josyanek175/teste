import { createFileRoute } from "@tanstack/react-router";
import { agents } from "@/lib/mock-data";
import { Circle } from "lucide-react";

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
  head: () => ({
    meta: [
      { title: "Atendentes — NexaBoot" },
      { name: "description", content: "Gestão de atendentes" },
    ],
  }),
});

function AgentsPage() {
  const statusColors = {
    online: "text-status-open",
    offline: "text-status-closed",
    busy: "text-status-active",
  };
  const statusLabels = { online: "Online", offline: "Offline", busy: "Ocupado" };
  const roleLabels = { admin: "Administrador", agent: "Atendente", supervisor: "Supervisor" };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Atendentes</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua equipe de atendimento</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {agent.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                <p className="text-xs text-muted-foreground">{roleLabels[agent.role]}</p>
              </div>
              <div className="flex items-center gap-1">
                <Circle className={`h-2.5 w-2.5 fill-current ${statusColors[agent.status]}`} />
                <span className="text-xs text-muted-foreground">{statusLabels[agent.status]}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">Chats ativos</span>
              <span className="text-sm font-semibold text-foreground">{agent.activeChats}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
