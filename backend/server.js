import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// 🔐 CONFIG
const EVOLUTION_URL = process.env.EVOLUTION_API_URL || "http://72.61.133.41:8080";
const API_KEY = process.env.EVOLUTION_API_KEY || "SUA_API_KEY_AQUI";

/* =========================
   🔥 FUNÇÃO BASE (EVOLUTION)
========================= */
async function evolutionRequest(path, method = "GET", body = null) {
  const res = await fetch(`${EVOLUTION_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Erro desconhecido");
    console.error("❌ Evolution erro:", res.status, errorText);
    throw new Error(errorText);
  }

  return res.json();
}

/* =========================
   📱 INSTÂNCIAS
========================= */

// listar instâncias
app.get("/api/instances", async (req, res) => {
  try {
    const data = await evolutionRequest("/instance/fetchInstances");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// criar instância
app.post("/api/instance", async (req, res) => {
  try {
    const { name, number } = req.body;

    const data = await evolutionRequest("/instance/create", "POST", {
      instanceName: name,
      number,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
    });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// conectar (QR Code)
app.get("/api/connect/:name", async (req, res) => {
  try {
    const data = await evolutionRequest(`/instance/connect/${req.params.name}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// status da conexão
app.get("/api/status/:name", async (req, res) => {
  try {
    const data = await evolutionRequest(`/instance/connectionState/${req.params.name}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// deletar instância
app.delete("/api/instance/:name", async (req, res) => {
  try {
    const data = await evolutionRequest(`/instance/delete/${req.params.name}`, "DELETE");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =========================
   💬 MENSAGENS
========================= */

// enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { instance, number, text } = req.body;

    const data = await evolutionRequest(`/message/sendText/${instance}`, "POST", {
      number,
      text,
    });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =========================
   🔗 WEBHOOK
========================= */

// configurar webhook
app.post("/api/webhook", async (req, res) => {
  try {
    const { instance, url } = req.body;

    const data = await evolutionRequest(`/webhook/set/${instance}`, "POST", {
      enabled: true,
      url,
      events: [
        "MESSAGES_UPSERT",
        "MESSAGES_UPDATE",
        "CONNECTION_UPDATE",
        "QRCODE_UPDATED",
      ],
    });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =========================
   📩 RECEBER MENSAGENS
========================= */

app.post("/webhook", (req, res) => {
  const data = req.body;

  const numero = data?.key?.remoteJid;

  const mensagem =
    data?.message?.conversation ||
    data?.message?.extendedTextMessage?.text;

  console.log("📩 NOVA MENSAGEM");
  console.log("Número:", numero);
  console.log("Mensagem:", mensagem);

  // 👉 Aqui você pode salvar no banco depois

  res.sendStatus(200);
});

/* ========================= */

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});