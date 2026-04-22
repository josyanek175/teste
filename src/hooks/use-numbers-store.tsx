import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { WhatsAppNumber } from "@/lib/mock-data";
import { whatsappNumbers as initialNumbers } from "@/lib/mock-data";

interface NumbersStoreContextType {
  numbers: WhatsAppNumber[];
  addNumber: (num: Omit<WhatsAppNumber, "id">) => void;
  updateNumber: (id: string, data: Partial<WhatsAppNumber>) => void;
  deleteNumber: (id: string) => void;
  toggleConnection: (id: string) => void;
}

const NumbersStoreContext = createContext<NumbersStoreContextType | null>(null);

export function NumbersStoreProvider({ children }: { children: ReactNode }) {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([...initialNumbers]);

  const addNumber = useCallback((num: Omit<WhatsAppNumber, "id">) => {
    const newNum: WhatsAppNumber = {
      ...num,
      id: `wn${Date.now()}`,
    };
    setNumbers((prev) => [...prev, newNum]);
  }, []);

  const updateNumber = useCallback((id: string, data: Partial<WhatsAppNumber>) => {
    setNumbers((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...data } : n))
    );
  }, []);

  const deleteNumber = useCallback((id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleConnection = useCallback((id: string) => {
    setNumbers((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: n.status === "connected" ? "disconnected" : "connected",
              connectedAt: n.status === "disconnected" ? new Date() : n.connectedAt,
            }
          : n
      )
    );
  }, []);

  return (
    <NumbersStoreContext.Provider value={{ numbers, addNumber, updateNumber, deleteNumber, toggleConnection }}>
      {children}
    </NumbersStoreContext.Provider>
  );
}

export function useNumbersStore() {
  const ctx = useContext(NumbersStoreContext);
  if (!ctx) throw new Error("useNumbersStore must be used within NumbersStoreProvider");
  return ctx;
}
