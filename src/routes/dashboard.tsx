import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Clock,
  Timer,
  Users,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { MetricCard } from "@/components/MetricCard";
import { NumberSelector } from "@/components/NumberSelector";
import { useActiveNumber } from "@/hooks/use-active-number";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — NexaBoot" },
      { name: "description", content: "Métricas e desempenho do atendimento" },
    ],
  }),
});

function DashboardPage() {
  const { activeNumberId, activeNumber } = useActiveNumber();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    conversationsToday: 0,
    resolvedToday: 0,
    openConversations: 0,
    messagesTotal: 0,
    messagesToday: 0,
    totalContacts: 0,
    totalConversations: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const nid = activeNumberId;

      // Parallel queries
      const addFilter = (q: any) => nid && nid !== "all" ? q.eq("whatsapp_number_id", nid) : q;

      const [totalConvsRes, todayConvsRes, openRes, totalMsgsRes, msgsTodayRes, contactsRes] =
        await Promise.all([
          addFilter(supabase.from("conversations").select("id", { count: "exact" })),
          addFilter(supabase.from("conversations").select("id, status", { count: "exact" }).gte("created_at", todayStart)),
          addFilter(supabase.from("conversations").select("id", { count: "exact" }).eq("status", "aberto")),
          addFilter(supabase.from("messages").select("id", { count: "exact" })),
          addFilter(supabase.from("messages").select("id", { count: "exact" }).gte("created_at", todayStart)),
          supabase.from("contacts").select("id", { count: "exact" }),
        ]);

      const resolvedToday = todayConvsRes.data?.filter((c: any) => c.status === "fechado").length ?? 0;

      setMetrics({
        conversationsToday: todayConvsRes.count ?? 0,
        resolvedToday,
        openConversations: openRes.count ?? 0,
        messagesTotal: totalMsgsRes.count ?? 0,
        messagesToday: msgsTodayRes.count ?? 0,
        totalContacts: contactsRes.count ?? 0,
        totalConversations: totalConvsRes.count ?? 0,
      });

      // Chart data (last 7 days)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const [chartMsgsRes, convsChartRes] = await Promise.all([
        addFilter(supabase.from("messages").select("created_at").gte("created_at", sevenDaysAgo)),
        addFilter(supabase.from("conversations").select("id, created_at").gte("created_at", sevenDaysAgo)),
      ]);

      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const chartMap: Record<string, { mensagens: number; atendimentos: Set<string> }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        chartMap[d.toISOString().slice(0, 10)] = { mensagens: 0, atendimentos: new Set() };
      }
      for (const msg of chartMsgsRes.data ?? []) {
        const day = msg.created_at.slice(0, 10);
        if (chartMap[day]) chartMap[day].mensagens++;
      }
      for (const conv of convsChartRes.data ?? []) {
        const day = conv.created_at.slice(0, 10);
        if (chartMap[day]) chartMap[day].atendimentos.add(conv.id);
      }
      setChartData(
        Object.entries(chartMap).map(([date, v]) => ({
          name: dayNames[new Date(date + "T12:00:00").getDay()],
          atendimentos: v.atendimentos.size,
          mensagens: v.mensagens,
        }))
      );

      // Agent performance
      const { data: agents } = await supabase.from("profiles").select("user_id, nome");
      const perf = [];
      for (const agent of agents ?? []) {
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("user_id", agent.user_id)
          .eq("tipo", "saida");
        if ((count ?? 0) > 0) perf.push({ name: agent.nome, atendimentos: count ?? 0 });
      }
      perf.sort((a, b) => b.atendimentos - a.atendimentos);
      setAgentPerformance(perf);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [activeNumberId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const numberLabel = activeNumberId === "all" ? "todos os números" : activeNumber?.nome || "";

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral — {numberLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchMetrics} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
          <NumberSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <MetricCard title="Conversas Hoje" value={metrics.conversationsToday} subtitle={`${metrics.resolvedToday} resolvidas`} icon={MessageSquare} />
        <MetricCard title="Mensagens Hoje" value={metrics.messagesToday} subtitle={`${metrics.messagesTotal} total`} icon={Clock} />
        <MetricCard title="Em Aberto" value={metrics.openConversations} subtitle="aguardando resposta" icon={Timer} />
        <MetricCard title="Contatos" value={metrics.totalContacts} subtitle={`${metrics.totalConversations} conversas total`} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Atendimentos por dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="atendimentos" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Volume de mensagens</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="mensagens" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {agentPerformance.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Desempenho por Atendente</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Atendente</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Mensagens Enviadas</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent: any) => {
                  const maxMsgs = Math.max(...agentPerformance.map((a: any) => a.atendimentos), 1);
                  return (
                    <tr key={agent.name} className="border-b border-border/50">
                      <td className="py-3 font-medium text-foreground">{agent.name}</td>
                      <td className="py-3 text-right text-foreground">{agent.atendimentos}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-20 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${(agent.atendimentos / maxMsgs) * 100}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round((agent.atendimentos / maxMsgs) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
