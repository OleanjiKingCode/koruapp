"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { API_ROUTES } from "@/lib/constants";

export interface UnreadCounts {
  chats: number;
  inbox: number; // Received pending that need your reply
  sent: number; // Sent active that you need to respond to
  notifications: number;
  appeals: number;
}

interface ChatFromAPI {
  id: string;
  requester_id: string;
  creator_id: string;
  status: string;
  amount: number;
  created_at: string;
}

export function useUnreadCount(): UnreadCounts {
  const { data: session } = useSession();

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) return { chats: [] };
    return res.json();
  };

  const { data } = useSWR<{ chats: ChatFromAPI[] }>(
    session?.user?.dbId ? API_ROUTES.USER_CHATS : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  const counts = useMemo(() => {
    const userId = session?.user?.dbId;
    if (!data?.chats || !userId) {
      return {
        chats: 0,
        inbox: 0,
        sent: 0,
        notifications: 0,
        appeals: 0,
      };
    }

    // Count pending received chats (you need to respond)
    const inboxPending = data.chats.filter(
      (c) => c.creator_id === userId && c.status === "pending"
    ).length;

    // Count active chats where user needs to respond
    // For sent chats: active means they responded, you need to respond
    const sentNeedingReply = data.chats.filter(
      (c) => c.requester_id === userId && c.status === "active"
    ).length;

    const totalChats = inboxPending + sentNeedingReply;

    return {
      chats: totalChats,
      inbox: inboxPending,
      sent: sentNeedingReply,
      notifications: 0, // Real notifications would come from a separate API
      appeals: 0,
    };
  }, [data, session]);

  return counts;
}

// Helper to format count for display (e.g., 99+)
export function formatUnreadCount(count: number): string {
  if (count === 0) return "";
  if (count > 99) return "99+";
  return count.toString();
}
