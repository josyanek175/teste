import { ChevronDown, Phone, Circle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useActiveNumber } from "@/hooks/use-active-number";

export function NumberSelector() {
  const { activeNumberId, setActiveNumberId, numbers, activeNumber } = useActiveNumber();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = activeNumberId === "all"
    ? "Todos os números"
    : `${activeNumber?.nome} — ${activeNumber?.phone_number || activeNumber?.instance_name}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
      >
        <Phone className="h-4 w-4 text-primary" />
        <span className="max-w-[200px] truncate">{label}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-card p-1 shadow-lg">
          <button
            onClick={() => { setActiveNumberId("all"); setOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              activeNumberId === "all" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Todos os números</p>
              <p className="text-xs text-muted-foreground">{numbers.length} números cadastrados</p>
            </div>
          </button>

          <div className="my-1 h-px bg-border" />

          {numbers.map((num) => (
            <button
              key={num.id}
              onClick={() => { setActiveNumberId(num.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                activeNumberId === num.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{num.nome}</p>
                <p className="text-xs text-muted-foreground">{num.phone_number || num.instance_name}</p>
              </div>
              <Circle
                className={`h-2.5 w-2.5 shrink-0 fill-current ${
                  num.status === "conectado" ? "text-status-open" : "text-status-closed"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
