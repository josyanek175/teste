import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type WhatsAppNumberRow = Tables<"whatsapp_numbers">;

interface NumberContextType {
  activeNumberId: string;
  setActiveNumberId: (id: string) => void;
  numbers: WhatsAppNumberRow[];
  activeNumber: WhatsAppNumberRow | null;
  loading: boolean;
  refresh: () => void;
}

const NumberContext = createContext<NumberContextType | null>(null);

export function NumberProvider({ children }: { children: ReactNode }) {
  const [activeNumberId, setActiveNumberId] = useState<string>("all");
  const [numbers, setNumbers] = useState<WhatsAppNumberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNumbers = useCallback(async () => {
    const { data } = await supabase
      .from("whatsapp_numbers")
      .select("*")
      .order("created_at", { ascending: true });
    setNumbers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  const activeNumber = numbers.find((n) => n.id === activeNumberId) || null;

  return (
    <NumberContext.Provider value={{ activeNumberId, setActiveNumberId, numbers, activeNumber, loading, refresh: fetchNumbers }}>
      {children}
    </NumberContext.Provider>
  );
}

export function useActiveNumber() {
  const ctx = useContext(NumberContext);
  if (!ctx) throw new Error("useActiveNumber must be used within NumberProvider");
  return ctx;
}
