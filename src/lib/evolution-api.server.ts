// Evolution API helpers (VERSÃO FINAL - usando backend Node)

export interface EvolutionInstance {
  id?: string;
  name?: string;
  instanceName?: string;
  connectionStatus?: string;
  ownerJid?: string;
  profileName?: string;
  profilePicUrl?: string;
}

export interface EvolutionQrCode {
  base64?: string;
  code?: string;
}

export interface EvolutionConnectionState {
  instance: string;
  state: "open" | "close" | "connecting";
}

export interface EvolutionMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: { text: string };
  };
  messageTimestamp: number;
  pushName?: string;
  status?: string;
}

const BASE_URL = "https://pajamas-grapple-crook.ngrok-free.dev";

// ─────────────────────────────
// 📱 INSTÂNCIAS
// ─────────────────────────────

export async function fetchInstances(): Promise<EvolutionInstance[]> {
  const res = await fetch(`${BASE_URL}/api/instances`);

  if (!res.ok) {
    throw new Error("Erro ao buscar instâncias");
  }

  return res.json();
}

export async function createInstance(instanceName: string, number?: string) {
  const res = await fetch(`${BASE_URL}/api/instance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: instanceName,
      number,
    }),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar instância");
  }

  return res.json();
}

export async function deleteInstance(instanceName: string) {
  const res = await fetch(`${BASE_URL}/api/instance/${instanceName}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erro ao deletar instância");
  }

  return res.json();
}

// ─────────────────────────────
// 🔌 CONEXÃO
// ─────────────────────────────

export async function getConnectionState(instanceName: string): Promise<EvolutionConnectionState> {
  const res = await fetch(`${BASE_URL}/api/status/${instanceName}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar status");
  }

  return res.json();
}

export async function connectInstance(instanceName: string): Promise<EvolutionQrCode> {
  const res = await fetch(`${BASE_URL}/api/connect/${instanceName}`);

  if (!res.ok) {
    throw new Error("Erro ao conectar instância");
  }

  return res.json();
}

export async function reconnectInstance(instanceName: string) {
  console.log("🔄 Reconnecting:", instanceName);

  const res = await fetch(`${BASE_URL}/api/connect/${instanceName}`);

  if (!res.ok) {
    throw new Error("Erro ao reconectar");
  }

  return res.json();
}

// ─────────────────────────────
// 💬 MENSAGENS
// ─────────────────────────────

export async function sendTextMessage(
  instanceName: string,
  remoteJid: string,
  text: string
) {
  const res = await fetch(`${BASE_URL}/api/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instance: instanceName,
      number: remoteJid,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error("Erro ao enviar mensagem");
  }

  return res.json();
}

// ─────────────────────────────
// 🔗 WEBHOOK
// ─────────────────────────────

export async function setWebhook(instanceName: string, webhookUrl: string) {
  const res = await fetch(`${BASE_URL}/api/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instance: instanceName,
      url: webhookUrl,
    }),
  });

  if (!res.ok) {
    throw new Error("Erro ao configurar webhook");
  }

  return res.json();
}