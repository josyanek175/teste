import { MessageSquare } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted/20">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">NexaBoot</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecione uma conversa para iniciar
      </p>
    </div>
  );
}
