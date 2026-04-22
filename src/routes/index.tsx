import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";
import { EmptyChatState } from "@/components/EmptyChatState";
import { NumberSelector } from "@/components/NumberSelector";
import { useActiveNumber } from "@/hooks/use-active-number";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ConversationsPage,
  head: () => ({
    meta: [
      { title: "NexaBoot — Gestão de Atendimento WhatsApp" },
      { name: "description", content: "Plataforma profissional de atendimento via WhatsApp" },
    ],
  }),
});

function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const { activeNumberId } = useActiveNumber();

  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    let query = supabase
      .from("conversations")
      .select("*, contacts(*)")
      .order("updated_at", { ascending: false });

    if (activeNumberId && activeNumberId !== "all") {
      query = query.eq("whatsapp_number_id", activeNumberId);
    }

    const { data: convs } = await query;

    if (convs) {
      // Fetch last message for each conversation
      const enriched = await Promise.all(
        convs.map(async (conv) => {
          const { data: msgs } = await supabase
            .from("messages")
            .select("conteudo, data_envio")
            .eq("conversation_id", conv.id)
            .order("data_envio", { ascending: false })
            .limit(1);
          const lastMsg = msgs?.[0];
          return {
            ...conv,
            lastMessage: lastMsg?.conteudo ?? "",
            lastMessageTime: lastMsg?.data_envio ?? conv.updated_at,
          };
        })
      );
      setConversations(enriched);
    }
    setLoadingConvs(false);
  }, [activeNumberId]);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from("messages")
      .select("*, profiles:user_id(nome)")
      .eq("conversation_id", convId)
      .order("data_envio", { ascending: true });
    setMessages(data ?? []);
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId, fetchMessages]);

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as any;
          // If the new message belongs to the selected conversation, add it
          if (selectedId && newMsg.conversation_id === selectedId) {
            fetchMessages(selectedId);
          }
          // Refresh conversation list
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, fetchConversations, fetchMessages]);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const handleMessageSent = () => {
    if (selectedId) {
      fetchMessages(selectedId);
      fetchConversations();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <NumberSelector />
        {activeNumberId !== "all" && (
          <span className="text-xs text-muted-foreground">
            {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {loadingConvs ? (
          <div className="flex w-80 items-center justify-center border-r border-border bg-card lg:w-96">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
        {selectedConv && selectedId ? (
          loadingMsgs ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ChatView
              conversation={selectedConv}
              messages={messages}
              onMessageSent={handleMessageSent}
            />
          )
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
}
