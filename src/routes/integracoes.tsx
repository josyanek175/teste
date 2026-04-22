import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plug,
  Globe,
  Key,
  Webhook,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Save,
  ExternalLink,
  Bot,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/integracoes")({
  component: IntegracoesPage,
  head: () => ({
    meta: [
      { title: "Integrações — NexaBoot" },
      { name: "description", content: "Configure integrações e API WhatsApp" },
    ],
  }),
});

interface IntegrationConfig {
  apiUrl: string;
  apiKey: string;
  webhookUrl: string;
  webhookSecret: string;
  provider: string;
}

function IntegracoesPage() {
  const [config, setConfig] = useState<IntegrationConfig>({
    apiUrl: "",
    apiKey: "",
    webhookUrl: "",
    webhookSecret: "",
    provider: "evolution",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Configurações salvas com sucesso!");
    setTimeout(() => setSaved(false), 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const integrations = [
    {
      id: "chatbot",
      name: "Chatbot IA",
      description: "Conecte um chatbot para respostas automáticas inteligentes",
      icon: Bot,
      status: "available" as const,
    },
    {
      id: "notifications",
      name: "Notificações Push",
      description: "Receba alertas em tempo real no navegador",
      icon: Bell,
      status: "active" as const,
    },
    {
      id: "crm",
      name: "CRM",
      description: "Integre com seu CRM para sincronizar contatos",
      icon: Globe,
      status: "available" as const,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
        <p className="text-sm text-muted-foreground">Configure a API do WhatsApp e integrações externas</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Evolution API Config */}
        <div className="rounded-xl border-2 border-primary/30 bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-foreground">Evolution API</h2>
              <p className="text-xs text-muted-foreground">Gerenciamento de instâncias WhatsApp multi-sessão</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Configurado</span>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                As credenciais da Evolution API estão configuradas como variáveis de ambiente seguras (EVOLUTION_API_URL e EVOLUTION_API_KEY). Para alterar, acesse as configurações de secrets do projeto.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Provedor ativo</label>
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Evolution API (Baileys)</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">URL da API</label>
              <input
                type="text"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">API Key / Token</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Insira sua API key"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Config */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Webhook className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Webhook</h2>
              <p className="text-xs text-muted-foreground">Endpoint para receber mensagens</p>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">URL do Webhook</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => copyToClipboard(config.webhookUrl, "URL")}
                  className="rounded-lg border border-border px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Webhook Secret</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={config.webhookSecret}
                    onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                    placeholder="Secret para validação"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                Configure este URL no painel do provedor WhatsApp para receber mensagens em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Other Integrations */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Outras Integrações</h2>
              <p className="text-xs text-muted-foreground">Conecte serviços externos</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <integration.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{integration.name}</h3>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {integration.status === "active" ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Ativo</span>
                  </div>
                ) : (
                  <button
                    onClick={() => toast.info(`Integração "${integration.name}" será disponibilizada em breve`)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Conectar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Salvo!" : "Salvar configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}
