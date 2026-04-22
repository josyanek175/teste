import type { Tables } from "@/integrations/supabase/types";

export type ContactRow = Tables<"contacts">;

export type ClientStatus = "CLIENTE" | "LEAD_FRIO" | "ATIVO" | "INATIVO";

export function computeClientStatus(contact: ContactRow): ClientStatus {
  if (contact.ultimo_trabalho_data) return "CLIENTE";
  if (contact.total_tentativas_sem_resposta > 3) return "LEAD_FRIO";
  if (contact.ultima_conversa) {
    const lastConv = new Date(contact.ultima_conversa);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (lastConv >= sevenDaysAgo) return "ATIVO";
  }
  return "INATIVO";
}

export const statusLabels: Record<ClientStatus, string> = {
  CLIENTE: "Cliente",
  LEAD_FRIO: "Lead Frio",
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const statusColors: Record<ClientStatus, string> = {
  CLIENTE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  LEAD_FRIO: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ATIVO: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  INATIVO: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export function parseCSVContacts(csvText: string): { nome: string; telefone: string }[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const separator = header.includes(";") ? ";" : ",";
  const cols = header.split(separator).map((c) => c.trim().replace(/"/g, ""));

  const nameIdx = cols.findIndex((c) => ["nome", "name", "nome completo"].includes(c));
  const phoneIdx = cols.findIndex((c) => ["telefone", "phone", "celular", "whatsapp", "fone"].includes(c));

  if (nameIdx === -1 || phoneIdx === -1) return [];

  const results: { nome: string; telefone: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map((v) => v.trim().replace(/"/g, ""));
    const nome = values[nameIdx];
    const telefone = values[phoneIdx]?.replace(/\D/g, "");
    if (nome && telefone && telefone.length >= 8) {
      results.push({ nome, telefone });
    }
  }
  return results;
}
