"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill, EmptyState } from "@/components/shared";
import { AuthGuard } from "@/components/auth";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/lib/constants";
import { useChatMessages } from "@/lib/hooks/use-chat-messages";

interface ChatData {
  id: string;
  requester_id: string;
  creator_id: string;
  status: string;
  amount: number;
  slot_name: string | null;
  deadline_at: string | null;
  created_at: string;
  otherParty?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
}

export default function ChatPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatId = params.id as string;
  const userId = session?.user?.dbId || null;

  // Fetch chat data
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

  const {
    data: chatData,
    error: chatError,
    isLoading: chatLoading,
  } = useSWR<{ chats: ChatData[] }>(
    userId ? API_ROUTES.USER_CHATS : null,
    fetcher
  );

  // Find the specific chat
  const chat = useMemo(() => {
    if (!chatData?.chats) return null;
    return chatData.chats.find((c) => c.id === chatId);
  }, [chatData, chatId]);

  // Use real-time chat messages hook
  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    isSending,
    isConnected,
  } = useChatMessages({
    chatId,
    userId,
    enabled: !!chat && !!userId,
  });

  // Determine other party
  const otherParty = useMemo(() => {
    if (!chat || !userId) return null;
    return (
      chat.otherParty || {
        id: chat.requester_id === userId ? chat.creator_id : chat.requester_id,
        name: "Unknown User",
        username: "unknown",
        profile_image_url: null,
      }
    );
  }, [chat, userId]);

  // Booking info from localStorage
  const bookingInfo = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`koru-booking-${chatId}`);
      if (stored) return JSON.parse(stored);
    }
    return null;
  }, [chatId]);

  // Calculate deadline
  const deadline = useMemo(() => {
    const deadlineDate = chat?.deadline_at
      ? new Date(chat.deadline_at)
      : bookingInfo?.createdAt
      ? new Date(
          new Date(bookingInfo.createdAt).getTime() + 24 * 60 * 60 * 1000
        )
      : null;

    if (!deadlineDate) return "24h";

    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, [chat, bookingInfo]);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Initial scroll
  useEffect(() => {
    if (messages.length > 0 && !messagesLoading) {
      scrollToBottom("instant");
    }
  }, [messagesLoading, messages.length, scrollToBottom]);

  // Send message handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");

    const success = await sendMessage(content);
    if (!success) {
      setNewMessage(content); // Restore on failure
    }

    inputRef.current?.focus();
  };

  // Format timestamp
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    const time = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (diffDays === 0) return time;
    if (diffDays === 1) return `Yesterday ${time}`;
    if (diffDays < 7)
      return `${date.toLocaleDateString([], { weekday: "short" })} ${time}`;
    return `${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })} ${time}`;
  };

  // Loading state
  if (chatLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-koru-purple border-t-transparent" />
            <p className="text-sm text-neutral-500">Loading chat...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Error state
  if (chatError || !chat || !otherParty) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center p-4">
          <EmptyState
            icon="chat"
            title="Chat not found"
            description="This chat doesn't exist or you don't have access to it."
            ctaText="Go to Chats"
            ctaHref="/chats"
          />
        </div>
      </AuthGuard>
    );
  }

  const displayStatus =
    chat.status === "active"
      ? "Active"
      : chat.status === "pending"
      ? "Pending"
      : chat.status === "completed"
      ? "Completed"
      : chat.status === "refunded"
      ? "Refunded"
      : "Active";

  const canSendMessages = chat.status === "active" || chat.status === "pending";

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div className="max-w-container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/chats"
                className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <BackIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </Link>
              <Link
                href={`/profile/${otherParty.username}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white dark:ring-neutral-800 shadow-sm">
                    {otherParty.profile_image_url ? (
                      <img
                        src={otherParty.profile_image_url}
                        alt={otherParty.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarGenerator seed={otherParty.username} size={40} />
                    )}
                  </div>
                  {/* Real-time connection indicator */}
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900",
                      isConnected ? "bg-koru-lime" : "bg-neutral-400"
                    )}
                    title={
                      isConnected ? "Real-time connected" : "Connecting..."
                    }
                  />
                </div>
                <div>
                  <h1 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {otherParty.name}
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    @{otherParty.username}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <StatusPill status={displayStatus} />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                <ClockIcon className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {deadline}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
            >
              <div className="space-y-4">
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-koru-purple border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center mb-4"
                    >
                      <ChatIcon className="w-10 h-10 text-koru-purple" />
                    </motion.div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Start the conversation
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                      Send a message to {otherParty.name.split(" ")[0]} to begin
                      your chat session.
                    </p>
                    {isConnected && (
                      <p className="text-xs text-koru-lime mt-3 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-koru-lime animate-pulse" />
                        Real-time enabled
                      </p>
                    )}
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => {
                      const isMe = message.sender_id === userId;
                      const isOptimistic = message.id.startsWith("optimistic-");
                      const showAvatar =
                        !isMe &&
                        (index === 0 ||
                          messages[index - 1]?.sender_id !== message.sender_id);

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "flex gap-2",
                            isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isMe && (
                            <div className="w-8 flex-shrink-0">
                              {showAvatar && (
                                <div className="w-8 h-8 rounded-lg overflow-hidden">
                                  {otherParty.profile_image_url ? (
                                    <img
                                      src={otherParty.profile_image_url}
                                      alt={otherParty.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <AvatarGenerator
                                      seed={otherParty.username}
                                      size={32}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                              isMe
                                ? "bg-koru-purple text-white rounded-br-md"
                                : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/50 dark:border-neutral-700/50 rounded-bl-md",
                              isOptimistic && "opacity-70"
                            )}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div
                              className={cn(
                                "flex items-center gap-1.5 mt-1.5",
                                isMe ? "justify-end" : "justify-start"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[10px]",
                                  isMe ? "text-white/60" : "text-neutral-400"
                                )}
                              >
                                {formatMessageTime(message.created_at)}
                              </span>
                              {isMe && (
                                <span className="text-white/60">
                                  {isOptimistic ? (
                                    <SendingIcon className="w-3 h-3" />
                                  ) : message.is_read ? (
                                    <DoubleCheckIcon className="w-3 h-3" />
                                  ) : (
                                    <CheckIcon className="w-3 h-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-200/50 dark:border-neutral-800/50 p-4 pb-24 sm:pb-4">
              {canSendMessages ? (
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-3 max-w-3xl mx-auto"
                >
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 focus:ring-2 focus:ring-koru-purple/50 transition-all"
                    disabled={isSending}
                    maxLength={2000}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-xl transition-all",
                      newMessage.trim()
                        ? "bg-koru-purple hover:bg-koru-purple/90 shadow-lg shadow-koru-purple/25"
                        : "bg-neutral-200 dark:bg-neutral-700 cursor-not-allowed"
                    )}
                    disabled={!newMessage.trim() || isSending}
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      animate={isSending ? { rotate: 360 } : {}}
                      transition={
                        isSending ? { duration: 1, repeat: Infinity } : {}
                      }
                    >
                      <SendIcon
                        className={cn(
                          "w-5 h-5",
                          newMessage.trim() ? "text-white" : "text-neutral-400"
                        )}
                      />
                    </motion.div>
                  </Button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-neutral-500">
                    This chat is {chat.status}. You cannot send new messages.
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 border-l border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/50 p-6">
            <div className="sticky top-24">
              <h2 className="text-lg text-neutral-900 dark:text-neutral-100 mb-6">
                Session Details
              </h2>

              <div className="bg-gradient-to-br from-koru-purple/10 to-koru-golden/10 rounded-2xl p-5 mb-4 border border-koru-purple/20">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Amount Paid
                </p>
                <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
                  {chat.amount === 0
                    ? "Free"
                    : `$${bookingInfo?.price || chat.amount}`}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 mb-4 border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Auto-Refund In
                </p>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-koru-golden" />
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {deadline}
                  </p>
                </div>
              </div>

              {(chat.slot_name || bookingInfo?.slotName) && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 mb-4 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    Session Type
                  </p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {chat.slot_name || bookingInfo?.slotName}
                  </p>
                  {bookingInfo?.date && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {bookingInfo.date} · {bookingInfo.time}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 mb-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Messages
                </p>
                <div className="flex items-center gap-2">
                  <ChatIcon className="w-5 h-5 text-koru-purple" />
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {messages.length}
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              <div
                className={cn(
                  "rounded-xl p-4 mb-4 border",
                  isConnected
                    ? "bg-koru-lime/10 border-koru-lime/30"
                    : "bg-orange-500/10 border-orange-500/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isConnected
                        ? "bg-koru-lime animate-pulse"
                        : "bg-orange-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isConnected ? "text-koru-lime" : "text-orange-500"
                    )}
                  >
                    {isConnected ? "Real-time connected" : "Connecting..."}
                  </span>
                </div>
              </div>

              <div className="bg-koru-lime/10 rounded-xl p-4 border border-koru-lime/30">
                <div className="flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-koru-lime flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    If {otherParty.name.split(" ")[0]} doesn&apos;t reply within
                    24 hours, your payment will be{" "}
                    <span className="text-koru-lime font-medium">
                      automatically refunded
                    </span>{" "}
                    to your wallet.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AuthGuard>
  );
}

// Icons
function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

function SendingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, "animate-spin")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
