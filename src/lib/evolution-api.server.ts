// Evolution API helpers (VERSÃO CORRIGIDA FINAL)

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
  const res = await fetch(`${BASE_URL}/instance/fetchInstances`);

  if (!res.ok) {
    throw new Error("Erro ao buscar instâncias");
  }

  return res.json();
}

export async function createInstance(instanceName: string, number?: string) {
  const res = await fetch(`${BASE_URL}/instance/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instanceName,
      number,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
    }),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar instância");
  }

  return res.json();
}

export async function deleteInstance(instanceName: string) {
  const res = await fetch(`${BASE_URL}/instance/delete/${instanceName}`, {
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
  const res = await fetch(`${BASE_URL}/instance/connectionState/${instanceName}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar status");
  }

  return res.json();
}

export async function connectInstance(instanceName: string): Promise<EvolutionQrCode> {
  const res = await fetch(`${BASE_URL}/instance/connect/${instanceName}`);

  if (!res.ok) {
    throw new Error("Erro ao conectar instância");
  }

  return res.json();
}

export async function reconnectInstance(instanceName: string) {
  console.log("🔄 Reconnecting:", instanceName);

  // logout + reconnect
  await fetch(`${BASE_URL}/instance/logout/${instanceName}`, {
    method: "DELETE",
  }).catch(() => {});

  const res = await fetch(`${BASE_URL}/instance/connect/${instanceName}`);

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
  const res = await fetch(`${BASE_URL}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
  const res = await fetch(`${BASE_URL}/webhook/set/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      enabled: true,
      url: webhookUrl,
      events: [
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE",
        "CONNECTION_UPDATE",
        "QRCODE_UPDATED",
      ],
    }),
  });

  if (!res.ok) {
    throw new Error("Erro ao configurar webhook");
  }

  return res.json();
}