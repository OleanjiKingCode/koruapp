"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { API_ROUTES } from "@/lib/constants";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
}

interface UseChatMessagesOptions {
  chatId: string;
  userId: string | null;
  enabled?: boolean;
}

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<boolean>;
  isSending: boolean;
  isConnected: boolean;
}

export function useChatMessages({
  chatId,
  userId,
  enabled = true,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const optimisticIdCounter = useRef(0);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!chatId || !userId || !enabled) return;

    try {
      setIsLoading(true);
      const res = await fetch(API_ROUTES.CHAT_MESSAGES(chatId));
      
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [chatId, userId, enabled]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatId || !userId || !enabled) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Fallback to polling if Supabase client is not available
      console.warn("Real-time not available, falling back to polling");
      const pollInterval = setInterval(fetchMessages, 3000);
      return () => clearInterval(pollInterval);
    }

    // Fetch initial messages
    fetchMessages();

    // Subscribe to new messages for this chat
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Add the new message if it's not from us (our messages are added optimistically)
          // or if it's a confirmation of our optimistic message
          setMessages((prev) => {
            // Check if this message already exists (was added optimistically)
            const existsAsOptimistic = prev.some(
              (m) =>
                m.id.startsWith("optimistic-") &&
                m.content === newMessage.content &&
                m.sender_id === newMessage.sender_id
            );

            if (existsAsOptimistic) {
              // Replace the optimistic message with the real one
              return prev.map((m) =>
                m.id.startsWith("optimistic-") &&
                m.content === newMessage.content &&
                m.sender_id === newMessage.sender_id
                  ? newMessage
                  : m
              );
            }

            // Check if message already exists
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }

            // Add new message
            return [...prev, newMessage];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId, userId, enabled, fetchMessages]);

  // Send message function
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!chatId || !userId || !content.trim()) return false;

      const trimmedContent = content.trim();
      setIsSending(true);

      // Create optimistic message
      const optimisticId = `optimistic-${Date.now()}-${optimisticIdCounter.current++}`;
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        chat_id: chatId,
        sender_id: userId,
        content: trimmedContent,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Add optimistic message immediately
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const res = await fetch(API_ROUTES.CHAT_MESSAGES(chatId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmedContent }),
        });

        if (!res.ok) {
          throw new Error("Failed to send message");
        }

        // The real message will come through the real-time subscription
        // and replace the optimistic one
        return true;
      } catch (err) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        console.error("Error sending message:", err);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [chatId, userId]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending,
    isConnected,
  };
}

