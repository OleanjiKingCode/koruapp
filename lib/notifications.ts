import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side notification creation helper
// Use this in API routes to create notifications

// Lazy initialization to avoid build-time errors when env vars aren't available
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Supabase URL and service role key are required for notifications",
      );
    }

    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export type NotificationType =
  | "message"
  | "payment"
  | "request"
  | "completed"
  | "summon_backed"
  | "summon_created";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  description?: string;
  link?: string;
  relatedUserId?: string;
  relatedUserUsername?: string;
  relatedUserImage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  description,
  link,
  relatedUserId,
  relatedUserUsername,
  relatedUserImage,
  metadata = {},
}: CreateNotificationParams): Promise<string | null> {
  try {
    const { data, error } = await getSupabase()
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        description,
        link,
        related_user_id: relatedUserId,
        related_user_username: relatedUserUsername,
        related_user_image: relatedUserImage,
        metadata,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error in createNotification:", error);
    return null;
  }
}

/**
 * Notify user of a new chat request
 */
export async function notifyNewChatRequest(
  recipientId: string,
  senderName: string,
  senderUsername: string,
  senderImage: string | null,
  amount: number,
  chatId: string,
) {
  return createNotification({
    userId: recipientId,
    type: "request",
    title: "New chat request",
    description: `${senderName} wants to chat with you for $${amount}`,
    link: `/chats`,
    relatedUserUsername: senderUsername,
    relatedUserImage: senderImage || undefined,
    metadata: { chatId, amount },
  });
}

/**
 * Notify user of a new message
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  senderUsername: string,
  senderImage: string | null,
  messagePreview: string,
  chatId: string,
) {
  return createNotification({
    userId: recipientId,
    type: "message",
    title: `New message from @${senderUsername}`,
    description:
      messagePreview.substring(0, 100) +
      (messagePreview.length > 100 ? "..." : ""),
    link: `/chat/${chatId}`,
    relatedUserUsername: senderUsername,
    relatedUserImage: senderImage || undefined,
    metadata: { chatId },
  });
}

/**
 * Notify user of payment received
 */
export async function notifyPaymentReceived(
  recipientId: string,
  payerName: string,
  payerUsername: string,
  payerImage: string | null,
  amount: number,
  chatId?: string,
) {
  return createNotification({
    userId: recipientId,
    type: "payment",
    title: "Payment received",
    description: `You earned $${amount} from your chat with ${payerName}`,
    link: chatId ? `/chat/${chatId}` : "/chats",
    relatedUserUsername: payerUsername,
    relatedUserImage: payerImage || undefined,
    metadata: { amount, chatId },
  });
}

/**
 * Notify user that a chat was completed
 */
export async function notifyChatCompleted(
  recipientId: string,
  otherUserName: string,
  otherUserUsername: string,
  otherUserImage: string | null,
  chatId: string,
) {
  return createNotification({
    userId: recipientId,
    type: "completed",
    title: "Chat completed",
    description: `Your conversation with @${otherUserUsername} has been marked as complete`,
    link: `/chat/${chatId}`,
    relatedUserUsername: otherUserUsername,
    relatedUserImage: otherUserImage || undefined,
    metadata: { chatId },
  });
}

/**
 * Notify summon creator that someone backed their summon
 */
export async function notifySummonBacked(
  creatorId: string,
  backerName: string,
  backerUsername: string,
  backerImage: string | null,
  amount: number,
  targetHandle: string,
  summonId: string,
) {
  return createNotification({
    userId: creatorId,
    type: "summon_backed",
    title: "Someone backed your summon!",
    description: `${backerName} backed your summon for @${targetHandle} with $${amount}`,
    link: `/summons`,
    relatedUserUsername: backerUsername,
    relatedUserImage: backerImage || undefined,
    metadata: { summonId, amount, targetHandle },
  });
}

/**
 * Notify user that a summon was created for them (if they're on the platform)
 */
export async function notifySummonCreated(
  targetUserId: string,
  creatorName: string,
  creatorUsername: string,
  creatorImage: string | null,
  totalPledged: number,
  summonId: string,
) {
  return createNotification({
    userId: targetUserId,
    type: "summon_created",
    title: "Someone summoned you!",
    description: `${creatorName} created a summon for you with $${totalPledged} pledged`,
    link: `/summons`,
    relatedUserUsername: creatorUsername,
    relatedUserImage: creatorImage || undefined,
    metadata: { summonId, totalPledged },
  });
}

/**
 * Notify user that their chat request was accepted
 */
export async function notifyChatAccepted(
  requesterId: string,
  creatorName: string,
  creatorUsername: string,
  creatorImage: string | null,
  chatId: string,
) {
  return createNotification({
    userId: requesterId,
    type: "request",
    title: "Chat request accepted!",
    description: `${creatorName} accepted your chat request`,
    link: `/chat/${chatId}`,
    relatedUserUsername: creatorUsername,
    relatedUserImage: creatorImage || undefined,
    metadata: { chatId },
  });
}
