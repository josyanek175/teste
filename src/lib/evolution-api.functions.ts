import { createServerFn } from "@tanstack/react-start";
import {
  fetchInstances,
  createInstance,
  deleteInstance,
  getConnectionState,
  connectInstance,
  reconnectInstance,
  sendTextMessage,
  fetchMessages,
  fetchChats,
  setWebhook,
} from "./evolution-api.server";

// ── List all instances ──
export const listInstances = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const instances = await fetchInstances();
      return { instances, error: null };
    } catch (error) {
      console.error("Failed to list instances:", error);
      return {
        instances: [],
        error: error instanceof Error ? error.message : "Falha ao listar instâncias",
      };
    }
  }
);

// ── Create instance ──
export const createNewInstance = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string; number?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const result = await createInstance(data.instanceName, data.number) as {
        instance?: { instanceName?: string; instanceId?: string; status?: string } | null;
        qrcode?: { base64?: string; pairingCode?: string; code?: string; count?: number } | null;
      };
      return {
        instance: result.instance ?? null,
        qrcode: result.qrcode ?? null,
        error: null,
      };
    } catch (error) {
      console.error("Failed to create instance:", error);
      return {
        instance: null,
        qrcode: null,
        error: error instanceof Error ? error.message : "Falha ao criar instância",
      };
    }
  });

// ── Delete instance ──
export const removeInstance = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string }) => data)
  .handler(async ({ data }) => {
    try {
      await deleteInstance(data.instanceName);
      return { success: true, error: null };
    } catch (error) {
      console.error("Failed to delete instance:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Falha ao excluir instância",
      };
    }
  });

// ── Connection state ──
export const getInstanceState = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string }) => data)
  .handler(async ({ data }) => {
    try {
      const state = await getConnectionState(data.instanceName);
      return { state: state.state, error: null };
    } catch (error) {
      console.error("Failed to get connection state:", error);
      return {
        state: "close" as const,
        error: error instanceof Error ? error.message : "Falha ao obter estado",
      };
    }
  });

// ── Connect (get QR code) ──
export const connectToInstance = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string }) => data)
  .handler(async ({ data }) => {
    try {
      const qrcode = await connectInstance(data.instanceName);
      return { qrcode, error: null };
    } catch (error) {
      console.error("Failed to connect instance:", error);
      return {
        qrcode: null,
        error: error instanceof Error ? error.message : "Falha ao conectar",
      };
    }
  });

// ── Logout (disconnect / reconnect) ──
export const disconnectInstance = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string }) => data)
  .handler(async ({ data }) => {
    try {
      await reconnectInstance(data.instanceName);
      return { success: true, error: null };
    } catch (error) {
      console.error("Failed to disconnect instance:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Falha ao desconectar",
      };
    }
  });

// ── Restart (alias to reconnect) ──
export const restartEvolutionInstance = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string }) => data)
  .handler(async ({ data }) => {
    try {
      await reconnectInstance(data.instanceName);
      return { success: true, error: null };
    } catch (error) {
      console.error("Failed to restart instance:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Falha ao reiniciar",
      };
    }
  });

// ── Send message ──
export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { instanceName: string; remoteJid: string; text: string }) => data
  )
  .handler(async ({ data }) => {
    try {
      const result = await sendTextMessage(
        data.instanceName,
        data.remoteJid,
        data.text
      );
      return { result: JSON.stringify(result ?? {}), error: null };
    } catch (error) {
      console.error("Failed to send message:", error);
      return {
        result: null,
        error: error instanceof Error ? error.message : "Falha ao enviar mensagem",
      };
    }
  });

// ── Fetch messages ──
export const getMessages = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { instanceName: string; remoteJid: string; limit?: number }) => data
  )
  .handler(async ({ data }) => {
    try {
      const messages = await fetchMessages(
        data.instanceName,
        data.remoteJid,
        data.limit
      );
      return { messages, error: null };
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return {
        messages: [],
        error: error instanceof Error ? error.message : "Falha ao buscar mensagens",
      };
    }
  });

// ── Fetch chats ──
export const getChats = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string }) => data)
  .handler(async ({ data }) => {
    try {
      const chats = await fetchChats(data.instanceName);
      return { chats: JSON.stringify(chats ?? []), error: null };
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      return {
        chats: "[]",
        error: error instanceof Error ? error.message : "Falha ao buscar chats",
      };
    }
  });

// ── Set webhook ──
export const configureWebhook = createServerFn({ method: "POST" })
  .inputValidator((data: { instanceName: string; webhookUrl: string }) => data)
  .handler(async ({ data }) => {
    try {
      await setWebhook(data.instanceName, data.webhookUrl);
      return { success: true, error: null };
    } catch (error) {
      console.error("Failed to set webhook:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Falha ao configurar webhook",
      };
    }
  });
