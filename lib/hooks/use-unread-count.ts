"use client";

import { useMemo } from "react";
import { MOCK_CHATS } from "@/lib/data";

export interface UnreadCounts {
  chats: number;
  inbox: number; // Received pending that need your reply
  sent: number; // Sent active that you need to respond to
  notifications: number;
  appeals: number;
}

export function useUnreadCount(): UnreadCounts {
  const counts = useMemo(() => {
    // Count chats awaiting user's reply
    const inboxPending = MOCK_CHATS.filter(
      (c) => c.type === "received" && c.awaitingReply === "me"
    ).length;
    
    const sentNeedingReply = MOCK_CHATS.filter(
      (c) => c.type === "sent" && c.awaitingReply === "me"
    ).length;
    
    const totalChats = inboxPending + sentNeedingReply;
    
    return {
      chats: totalChats,
      inbox: inboxPending,
      sent: sentNeedingReply,
      notifications: 3, // Mock notification count
      appeals: 0,
    };
  }, []);

  return counts;
}

// Helper to format count for display (e.g., 99+)
export function formatUnreadCount(count: number): string {
  if (count === 0) return "";
  if (count > 99) return "99+";
  return count.toString();
}




