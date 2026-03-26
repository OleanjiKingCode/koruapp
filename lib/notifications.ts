import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import {
  sendEmail,
  buildBookingCreatedHostEmail,
  buildBookingCreatedSeekerEmail,
  buildDisputeRaisedEmail,
  buildEscrowRefundEmail,
} from "@/lib/email";

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

/**
 * Look up a user's email and name by their DB user ID
 */
async function getUserEmail(
  userId: string,
): Promise<{ email: string | null; name: string | null }> {
  try {
    const { data } = await getSupabase()
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .single();
    return { email: data?.email || null, name: data?.name || null };
  } catch {
    return { email: null, name: null };
  }
}

export type NotificationType =
  | "message"
  | "payment"
  | "request"
  | "completed"
  | "session_expiring"
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
      if (process.env.NODE_ENV === "production") {
        Sentry.captureException(error, {
          tags: { operation: "notifications:create" },
          extra: { userId, type, title },
        });
      }
      return null;
    }

    return data?.id || null;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, {
        tags: { operation: "notifications:create" },
        extra: { userId, type, title },
      });
    }
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
  const result = await createNotification({
    userId: recipientId,
    type: "request",
    title: "New chat request",
    description: `${senderName} wants to chat with you for $${amount}`,
    link: `/chats`,
    relatedUserUsername: senderUsername,
    relatedUserImage: senderImage || undefined,
    metadata: { chatId, amount },
  });

  // Fire-and-forget email to the host
  getUserEmail(recipientId).then(({ email }) => {
    if (email) {
      const { subject, html } = buildBookingCreatedHostEmail({
        seekerName: senderName,
        seekerUsername: senderUsername,
        amount,
        chatId,
      });
      sendEmail({ to: email, subject, html });
    }
  });

  return result;
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
  const result = await createNotification({
    userId: targetUserId,
    type: "summon_created",
    title: "Someone summoned you!",
    description: `${creatorName} created a summon for you with $${totalPledged} pledged`,
    link: `/summons`,
    relatedUserUsername: creatorUsername,
    relatedUserImage: creatorImage || undefined,
    metadata: { summonId, totalPledged },
  });

  return result;
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

/**
 * Send booking confirmation email to the seeker (no DB notification — they initiated it)
 */
export function sendBookingSeekerEmail(
  seekerId: string,
  hostName: string,
  hostUsername: string,
  amount: number,
  chatId: string,
) {
  getUserEmail(seekerId).then(({ email }) => {
    if (email) {
      const { subject, html } = buildBookingCreatedSeekerEmail({
        hostName,
        hostUsername,
        amount,
        chatId,
      });
      sendEmail({ to: email, subject, html });
    }
  });
}

/**
 * Notify both users that their chat session is expiring in 30 minutes
 */
export async function notifySessionExpiring(
  userId: string,
  otherUserName: string,
  otherUserUsername: string,
  otherUserImage: string | null,
  chatId: string,
) {
  return createNotification({
    userId,
    type: "session_expiring",
    title: "Session ending soon",
    description: `Your chat with @${otherUserUsername} ends in 30 minutes`,
    link: `/chat/${chatId}`,
    relatedUserUsername: otherUserUsername,
    relatedUserImage: otherUserImage || undefined,
    metadata: { chatId },
  });
}

/**
 * Notify the other party about a dispute (DB notification + email)
 */
export async function notifyDisputeRaised(
  otherPartyId: string,
  disputerUsername: string,
  amount: number,
  chatId: string,
) {
  const result = await createNotification({
    userId: otherPartyId,
    type: "payment",
    title: "Dispute raised on your escrow",
    description: `@${disputerUsername} raised a dispute on a $${amount} escrow`,
    link: `/chats`,
    relatedUserUsername: disputerUsername,
    metadata: { chatId, amount },
  });

  getUserEmail(otherPartyId).then(({ email }) => {
    if (email) {
      const { subject, html } = buildDisputeRaisedEmail({
        disputerUsername,
        amount,
        chatId,
      });
      sendEmail({ to: email, subject, html });
    }
  });

  return result;
}

/**
 * Notify the depositor about an escrow refund (DB notification + email)
 */
export async function notifyEscrowRefund(
  depositorId: string,
  amount: number,
  reason: "rejection" | "expiry",
) {
  const description =
    reason === "rejection"
      ? `Your $${amount} escrow was refunded because the host declined.`
      : `Your $${amount} escrow expired and has been refunded.`;

  const result = await createNotification({
    userId: depositorId,
    type: "payment",
    title: "Escrow refund processed",
    description,
    link: `/chats`,
    metadata: { amount, reason },
  });

  getUserEmail(depositorId).then(({ email }) => {
    if (email) {
      const { subject, html } = buildEscrowRefundEmail({ amount, reason });
      sendEmail({ to: email, subject, html });
    }
  });

  return result;
}
