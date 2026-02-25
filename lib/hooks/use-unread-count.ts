"use client";

import { useMemo, useCallback, useEffect } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { useSession } from "next-auth/react";
import { API_ROUTES, STORAGE_KEYS } from "@/lib/constants";

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
  updated_at: string;
}

// Get seen chat IDs from localStorage
function getSeenChatIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SEEN_CHATS);
    if (stored) {
      const data = JSON.parse(stored);
      return new Set(data.ids || []);
    }
  } catch {
    // Ignore errors
  }
  return new Set();
}

// Mark chat IDs as seen in localStorage
function markChatsAsSeen(chatIds: string[]) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSeenChatIds();
    chatIds.forEach((id) => existing.add(id));
    localStorage.setItem(
      STORAGE_KEYS.SEEN_CHATS,
      JSON.stringify({
        ids: Array.from(existing),
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore errors
  }
}

// Clear specific chat from seen (when it's updated and needs attention again)
function clearSeenChat(chatId: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSeenChatIds();
    existing.delete(chatId);
    localStorage.setItem(
      STORAGE_KEYS.SEEN_CHATS,
      JSON.stringify({
        ids: Array.from(existing),
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore errors
  }
}

export function useUnreadCount(): UnreadCounts & {
  markAllAsSeen: () => void;
  markChatAsSeen: (chatId: string) => void;
  refresh: () => void;
} {
  const { data: session } = useSession();

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) return { chats: [] };
    return res.json();
  };

  const { data, mutate } = useSWR<{ chats: ChatFromAPI[] }>(
    session?.user?.dbId ? API_ROUTES.USER_CHATS : null,
    fetcher,
    {
      revalidateOnFocus: true, // Revalidate when user comes back to tab
      dedupingInterval: 30000, // Cache for 30 seconds
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

    const seenChatIds = getSeenChatIds();

    // Count pending/active received chats that haven't been seen
    // These are chats where you are the CREATOR (person being requested)
    const inboxChats = data.chats.filter(
      (c) =>
        c.creator_id === userId &&
        (c.status === "pending" || c.status === "active")
    );

    // Only count unseen chats
    const unseenInboxCount = inboxChats.filter(
      (c) => !seenChatIds.has(c.id)
    ).length;

    // Sent count is for reference only, not shown in badge
    const sentCount = data.chats.filter(
      (c) => c.requester_id === userId
    ).length;

    return {
      // Badge only shows unseen inbox chats
      chats: unseenInboxCount,
      inbox: unseenInboxCount,
      sent: sentCount,
      notifications: 0,
      appeals: 0,
    };
  }, [data, session]);

  // Mark all inbox chats as seen
  const markAllAsSeen = useCallback(() => {
    const userId = session?.user?.dbId;
    if (!data?.chats || !userId) return;

    const inboxChatIds = data.chats
      .filter(
        (c) =>
          c.creator_id === userId &&
          (c.status === "pending" || c.status === "active")
      )
      .map((c) => c.id);

    markChatsAsSeen(inboxChatIds);
    // Trigger re-render by mutating
    mutate();
  }, [data, session, mutate]);

  // Mark a specific chat as seen
  const markChatAsSeen = useCallback(
    (chatId: string) => {
      markChatsAsSeen([chatId]);
      mutate();
    },
    [mutate]
  );

  // Refresh the data
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    ...counts,
    markAllAsSeen,
    markChatAsSeen,
    refresh,
  };
}

// Helper to format count for display (e.g., 99+)
export function formatUnreadCount(count: number): string {
  if (count === 0) return "";
  if (count > 99) return "99+";
  return count.toString();
}

// Export for use in other components
export { markChatsAsSeen, getSeenChatIds, clearSeenChat };

// Global mutate function for refreshing from anywhere
export function refreshUnreadCounts() {
  globalMutate(API_ROUTES.USER_CHATS);
}
