"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  StatusPill,
  EmptyState,
  ChatCardSkeleton,
  StatCardSkeleton,
} from "@/components/shared";
import { AuthGuard } from "@/components/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/lib/constants";
import { ChatIcon, ChevronRightIcon } from "@/components/icons";

// Chat type from API
interface ChatFromAPI {
  id: string;
  requester_id: string;
  creator_id: string;
  status:
    | "pending"
    | "active"
    | "completed"
    | "expired"
    | "refunded"
    | "cancelled";
  amount: number;
  slot_name: string | null;
  deadline_at: string | null;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_at: string | null;
  // Joined user data
  requester?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
  creator?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
  otherParty?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
}

// Display chat type (transformed)
interface DisplayChat {
  id: string;
  otherParty: string;
  handle: string;
  profileImage: string | null;
  status: "Pending" | "Active" | "Completed" | "Refunded";
  amount: string;
  deadline: string;
  lastMessage: string;
  type: "sent" | "received";
  createdAt: string;
  awaitingReply: "me" | "them" | null;
}

// Icons
function SendIcon({ className }: { className?: string }) {
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
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
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
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

// Chat Card Component
function ChatCard({
  chat,
  variant = "sent",
}: {
  chat: DisplayChat;
  variant?: "sent" | "received";
}) {
  const isPaying = variant === "sent";
  const needsMyResponse = chat.awaitingReply === "me";
  const isCompleted = chat.status === "Completed" || chat.status === "Refunded";

  return (
    <Link href={`/chat/${chat.id}`}>
      <div
        className={cn(
          "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 transition-all cursor-pointer group hover:shadow-lg",
          isPaying
            ? "hover:border-koru-purple/30 dark:hover:border-koru-purple/30"
            : "hover:border-koru-golden/30 dark:hover:border-koru-golden/30"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl overflow-hidden",
                isPaying
                  ? "bg-gradient-to-br from-koru-purple/20 to-koru-golden/20"
                  : "bg-gradient-to-br from-koru-golden/20 to-koru-lime/20"
              )}
            >
              {chat.profileImage ? (
                <img
                  src={chat.profileImage}
                  alt={chat.otherParty}
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarGenerator seed={chat.handle} size={48} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "font-semibold text-neutral-900 dark:text-neutral-100 transition-colors",
                    isPaying
                      ? "group-hover:text-koru-purple"
                      : "group-hover:text-koru-golden"
                  )}
                >
                  {chat.otherParty}
                </h3>
                <StatusPill status={chat.status} />
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                @{chat.handle}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="text-right shrink-0">
            <p
              className={cn(
                "font-semibold",
                isPaying
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-koru-golden"
              )}
            >
              {isPaying ? chat.amount : `+${chat.amount}`}
            </p>
            <p
              className={cn(
                "text-xs",
                chat.deadline.includes("left")
                  ? needsMyResponse
                    ? "text-orange-500"
                    : "text-koru-golden"
                  : chat.status === "Completed"
                  ? "text-koru-lime"
                  : chat.status === "Refunded"
                  ? "text-red-400"
                  : "text-neutral-400"
              )}
            >
              {chat.deadline}
            </p>
          </div>
        </div>

        {/* Last message preview */}
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
          {chat.lastMessage}
        </p>

        {/* Status hints */}
        {!isCompleted && (
          <div className="mt-3 flex items-center justify-between">
            {needsMyResponse ? (
              <span className="text-xs text-orange-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Your turn to respond
              </span>
            ) : chat.status === "Pending" && isPaying ? (
              <span className="text-xs text-koru-golden">
                ⏳ Waiting for them to accept
              </span>
            ) : (
              <span className="text-xs text-neutral-400">
                ⏳ Waiting for their response
              </span>
            )}
            <ChevronRightIcon
              className={cn(
                "w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-all",
                isPaying
                  ? "group-hover:text-koru-purple"
                  : "group-hover:text-koru-golden"
              )}
            />
          </div>
        )}

        {chat.status === "Refunded" && (
          <div className="mt-3 flex items-center">
            <span className="text-xs text-red-400">
              💸 Payment refunded - no response within 24h
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// Helper function to format deadline
function formatDeadline(deadlineAt: string | null, status: string): string {
  if (status === "completed") return "Completed";
  if (status === "refunded") return "Expired";
  if (!deadlineAt) return "24h left";

  const deadline = new Date(deadlineAt);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h left`;
}

// Helper function to transform API chat to display chat
function transformChat(chat: ChatFromAPI, userId: string): DisplayChat {
  const isSent = chat.requester_id === userId;
  const otherUser = chat.otherParty || (isSent ? chat.creator : chat.requester);

  const statusMap: Record<
    string,
    "Pending" | "Active" | "Completed" | "Refunded"
  > = {
    pending: "Pending",
    active: "Active",
    completed: "Completed",
    refunded: "Refunded",
    expired: "Refunded",
    cancelled: "Refunded",
  };

  // Determine last message text
  let lastMessage = "Chat started";
  if (chat.last_message) {
    lastMessage = chat.last_message;
  } else if (chat.slot_name) {
    lastMessage = `Session: ${chat.slot_name}`;
  }

  return {
    id: chat.id,
    otherParty: otherUser?.name || "Unknown User",
    handle: otherUser?.username || "unknown",
    profileImage: otherUser?.profile_image_url || null,
    status: statusMap[chat.status] || "Pending",
    amount: `$${chat.amount.toFixed(2)}`,
    deadline: formatDeadline(chat.deadline_at, chat.status),
    lastMessage,
    type: isSent ? "sent" : "received",
    createdAt: chat.updated_at || chat.created_at,
    awaitingReply: chat.status === "active" ? (isSent ? "them" : "me") : null,
  };
}

export default function ChatsPage() {
  const { data: session } = useSession();
  const [mainTab, setMainTab] = useState<"sent" | "received">("received");
  const [sentSubTab, setSentSubTab] = useState<
    "pending" | "active" | "completed"
  >("pending");
  const [receivedSubTab, setReceivedSubTab] = useState<
    "pending" | "active" | "completed"
  >("pending");

  // Fetch chats from API
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch chats");
    return res.json();
  };

  const { data, error, isLoading } = useSWR<{ chats: ChatFromAPI[] }>(
    session?.user?.dbId ? API_ROUTES.USER_CHATS : null,
    fetcher
  );

  // Fetch featured profiles for empty state suggestions
  const { data: featuredData } = useSWR<{ profiles: Array<{
    id: string;
    username: string;
    name: string;
    profile_image_url: string | null;
    category: string;
  }> }>(
    API_ROUTES.DISCOVER_FEATURED + "?limit=3",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Transform featured profiles for empty state
  const suggestedProfiles = useMemo(() => {
    if (!featuredData?.profiles) return [];
    return featuredData.profiles.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      handle: p.username,
      category: p.category,
      profileImageUrl: p.profile_image_url,
    }));
  }, [featuredData]);

  // Transform API chats to display format
  const allChats = useMemo(() => {
    const userId = session?.user?.dbId;
    if (!data?.chats || !userId) return [];
    return data.chats.map((chat) => transformChat(chat, userId));
  }, [data, session]);

  // Filter chats by type
  const sentChats = useMemo(
    () => allChats.filter((c) => c.type === "sent"),
    [allChats]
  );
  const receivedChats = useMemo(
    () => allChats.filter((c) => c.type === "received"),
    [allChats]
  );

  // Sent sub-categories
  const sentPending = useMemo(
    () => sentChats.filter((c) => c.status === "Pending"),
    [sentChats]
  );
  const sentActive = useMemo(
    () => sentChats.filter((c) => c.status === "Active"),
    [sentChats]
  );
  const sentCompleted = useMemo(
    () =>
      sentChats.filter(
        (c) => c.status === "Completed" || c.status === "Refunded"
      ),
    [sentChats]
  );

  // Received sub-categories
  const receivedPending = useMemo(
    () => receivedChats.filter((c) => c.status === "Pending"),
    [receivedChats]
  );
  const receivedActive = useMemo(
    () => receivedChats.filter((c) => c.status === "Active"),
    [receivedChats]
  );
  const receivedCompleted = useMemo(
    () =>
      receivedChats.filter(
        (c) => c.status === "Completed" || c.status === "Refunded"
      ),
    [receivedChats]
  );

  return (
    <AuthGuard>
      <div className="min-h-screen pb-[500px] sm:pb-96">
        <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl text-neutral-900 dark:text-neutral-100 mb-2">
                  Chats
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Manage your conversations and requests
                </p>
              </div>

              <Link href="/discover">
                <Button className="bg-koru-purple hover:bg-koru-purple/90">
                  <SendIcon className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {isLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-koru-golden/10 flex items-center justify-center">
                      <InboxIcon className="w-5 h-5 text-koru-golden" />
                    </div>
                    <div>
                      <p className="text-2xl text-neutral-900 dark:text-neutral-100">
                        {receivedChats.length}
                      </p>
                      <p className="text-xs text-neutral-500">Inbox</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-koru-purple/10 flex items-center justify-center">
                      <SendIcon className="w-5 h-5 text-koru-purple" />
                    </div>
                    <div>
                      <p className="text-2xl text-neutral-900 dark:text-neutral-100">
                        {sentChats.length}
                      </p>
                      <p className="text-xs text-neutral-500">Sent</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl text-neutral-900 dark:text-neutral-100">
                        {receivedActive.length + sentActive.length}
                      </p>
                      <p className="text-xs text-neutral-500">Active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-koru-lime/10 flex items-center justify-center">
                      <CheckIcon className="w-5 h-5 text-koru-lime" />
                    </div>
                    <div>
                      <p className="text-2xl text-neutral-900 dark:text-neutral-100">
                        {sentCompleted.length + receivedCompleted.length}
                      </p>
                      <p className="text-xs text-neutral-500">Completed</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Main Tabs */}
          <Tabs
            value={mainTab}
            onValueChange={(v) => setMainTab(v as "sent" | "received")}
            className="w-full"
          >
            <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl mb-6 w-full md:w-auto">
              <TabsTrigger
                value="received"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm flex-1 md:flex-initial"
              >
                <InboxIcon className="w-4 h-4 mr-2" />
                Inbox
                {receivedPending.length > 0 && (
                  <Badge className="ml-2 bg-orange-500 text-white text-xs h-5 px-1.5">
                    {receivedPending.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm flex-1 md:flex-initial"
              >
                <SendIcon className="w-4 h-4 mr-2" />
                Sent
                {sentPending.length > 0 && (
                  <Badge className="ml-2 bg-koru-purple/20 text-koru-purple text-xs h-5 px-1.5">
                    {sentPending.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Inbox Tab */}
            <TabsContent value="received">
              <Tabs
                value={receivedSubTab}
                onValueChange={(v) =>
                  setReceivedSubTab(v as typeof receivedSubTab)
                }
              >
                <TabsList className="bg-neutral-50 dark:bg-neutral-800/30 p-1 rounded-lg mb-4">
                  <TabsTrigger
                    value="pending"
                    className="rounded-md text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
                  >
                    Pending
                    {receivedPending.length > 0 && (
                      <Badge className="ml-1.5 bg-orange-500/20 text-orange-500 text-xs h-4 px-1">
                        {receivedPending.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="rounded-md text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
                  >
                    Active
                    {receivedActive.length > 0 && (
                      <Badge className="ml-1.5 bg-koru-lime/20 text-koru-lime text-xs h-4 px-1">
                        {receivedActive.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="rounded-md text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
                  >
                    Completed
                    <Badge className="ml-1.5 bg-neutral-200 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400 text-xs h-4 px-1">
                      {receivedCompleted.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {Array.from({ length: 3 }).map((_, i) => (
                          <ChatCardSkeleton key={i} />
                        ))}
                      </motion.div>
                    ) : receivedPending.length > 0 ? (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {receivedPending.map((chat, index) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ChatCard chat={chat} variant="received" />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <EmptyState
                        icon="inbox"
                        title="No pending requests"
                        description="New requests from people who want to chat will appear here. Share your profile to get more requests!"
                        variant="card"
                        ctaText="Share Profile"
                        ctaHref="/profile"
                      />
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {Array.from({ length: 2 }).map((_, i) => (
                          <ChatCardSkeleton key={i} />
                        ))}
                      </motion.div>
                    ) : receivedActive.length > 0 ? (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {receivedActive.map((chat, index) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ChatCard chat={chat} variant="received" />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <EmptyState
                        icon="chat"
                        title="No active conversations"
                        description="Once you accept pending requests, active conversations will show here."
                        variant="compact"
                      />
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {Array.from({ length: 2 }).map((_, i) => (
                          <ChatCardSkeleton key={i} />
                        ))}
                      </motion.div>
                    ) : receivedCompleted.length > 0 ? (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {receivedCompleted.map((chat, index) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ChatCard chat={chat} variant="received" />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <EmptyState
                        icon="inbox"
                        title="No completed chats yet"
                        description="Your completed and refunded conversations will appear here."
                        variant="compact"
                      />
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Sent Tab */}
            <TabsContent value="sent">
              <Tabs
                value={sentSubTab}
                onValueChange={(v) => setSentSubTab(v as typeof sentSubTab)}
              >
                <TabsList className="bg-neutral-50 dark:bg-neutral-800/30 p-1 rounded-lg mb-4">
                  <TabsTrigger
                    value="pending"
                    className="rounded-md text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
                  >
                    Pending
                    {sentPending.length > 0 && (
                      <Badge className="ml-1.5 bg-koru-purple/20 text-koru-purple text-xs h-4 px-1">
                        {sentPending.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="rounded-md text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
                  >
                    Active
                    {sentActive.length > 0 && (
                      <Badge className="ml-1.5 bg-koru-lime/20 text-koru-lime text-xs h-4 px-1">
                        {sentActive.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="rounded-md text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700"
                  >
                    Completed
                    <Badge className="ml-1.5 bg-neutral-200 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400 text-xs h-4 px-1">
                      {sentCompleted.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {Array.from({ length: 2 }).map((_, i) => (
                          <ChatCardSkeleton key={i} />
                        ))}
                      </motion.div>
                    ) : sentPending.length > 0 ? (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {sentPending.map((chat, index) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ChatCard chat={chat} variant="sent" />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <EmptyState
                        icon="search"
                        title="No pending requests"
                        description="Start a conversation by finding someone on the Discover page."
                        ctaText="Discover People"
                        ctaHref="/discover"
                        suggestedProfiles={suggestedProfiles}
                      />
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {Array.from({ length: 2 }).map((_, i) => (
                          <ChatCardSkeleton key={i} />
                        ))}
                      </motion.div>
                    ) : sentActive.length > 0 ? (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {sentActive.map((chat, index) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ChatCard chat={chat} variant="sent" />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <EmptyState
                        icon="chat"
                        title="No active conversations"
                        description="Once someone accepts your request, the conversation will appear here."
                        variant="compact"
                      />
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {Array.from({ length: 2 }).map((_, i) => (
                          <ChatCardSkeleton key={i} />
                        ))}
                      </motion.div>
                    ) : sentCompleted.length > 0 ? (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {sentCompleted.map((chat, index) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ChatCard chat={chat} variant="sent" />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <EmptyState
                        icon="wallet"
                        title="No completed chats yet"
                        description="Your completed conversations and refunds will appear here."
                        variant="compact"
                      />
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}
