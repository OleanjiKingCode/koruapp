"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FloatingNav } from "@/components/shared";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";

// Icons
function BellIcon({ className }: { className?: string }) {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
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

function MessageIcon({ className }: { className?: string }) {
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

// Types
interface Notification {
  id: string;
  type: "message" | "payment" | "request" | "completed";
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
  link?: string;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "request",
    title: "New chat request",
    description: "Sarah Chen wants to chat with you for $75",
    time: "2 min ago",
    read: false,
    avatar: "sarah_chen",
    link: "/chats",
  },
  {
    id: "2",
    type: "message",
    title: "New message from @elonmusk",
    description: "Thanks for the insights on AI development...",
    time: "15 min ago",
    read: false,
    avatar: "elonmusk",
    link: "/chat/1",
  },
  {
    id: "3",
    type: "payment",
    title: "Payment received",
    description: "You earned $150 from your chat with Marc Andreessen",
    time: "1 hour ago",
    read: false,
    avatar: "pmarca",
    link: "/chats",
  },
  {
    id: "4",
    type: "completed",
    title: "Chat completed",
    description: "Your conversation with @balaji has been marked as complete",
    time: "3 hours ago",
    read: true,
    avatar: "balaji",
    link: "/chats",
  },
  {
    id: "5",
    type: "request",
    title: "New chat request",
    description: "Alex Turner wants to chat with you for $50",
    time: "5 hours ago",
    read: true,
    avatar: "alex_turner",
    link: "/chats",
  },
  {
    id: "6",
    type: "payment",
    title: "Payment received",
    description: "You earned $200 from your chat with Naval Ravikant",
    time: "1 day ago",
    read: true,
    avatar: "naval",
    link: "/chats",
  },
];

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "message":
      return (
        <div className="w-8 h-8 rounded-full bg-koru-purple/10 flex items-center justify-center">
          <MessageIcon className="w-4 h-4 text-koru-purple" />
        </div>
      );
    case "payment":
      return (
        <div className="w-8 h-8 rounded-full bg-koru-golden/10 flex items-center justify-center">
          <DollarIcon className="w-4 h-4 text-koru-golden" />
        </div>
      );
    case "request":
      return (
        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
          <UserPlusIcon className="w-4 h-4 text-orange-500" />
        </div>
      );
    case "completed":
      return (
        <div className="w-8 h-8 rounded-full bg-koru-lime/10 flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-koru-lime" />
        </div>
      );
  }
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <Link href={notification.link || "#"}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-xl border transition-all cursor-pointer group",
          notification.read
            ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            : "bg-koru-purple/5 dark:bg-koru-purple/10 border-koru-purple/20 dark:border-koru-purple/30"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {notification.avatar ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <AvatarGenerator seed={notification.avatar} size={40} />
              </div>
            ) : (
              <NotificationIcon type={notification.type} />
            )}
            {!notification.read && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-koru-purple border-2 border-white dark:border-neutral-900" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "text-sm font-medium",
                  notification.read
                    ? "text-neutral-700 dark:text-neutral-300"
                    : "text-neutral-900 dark:text-neutral-100"
                )}
              >
                {notification.title}
              </h3>
              <span className="text-xs text-neutral-400 shrink-0">
                {notification.time}
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
              {notification.description}
            </p>
          </div>

          {/* Type Icon */}
          <div className="shrink-0 hidden sm:block">
            <NotificationIcon type={notification.type} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <FloatingNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-koru-purple/10 flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-koru-purple" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <CheckIcon className="w-3 h-3 mr-1.5" />
                Mark all read
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === "all"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              filter === "unread"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  filter === "unread"
                    ? "bg-white/20"
                    : "bg-koru-purple/10 text-koru-purple"
                )}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </motion.div>

        {/* Notifications List */}
        <AnimatePresence mode="wait">
          {filteredNotifications.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationCard
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <BellIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                {filter === "unread" ? "All caught up!" : "No notifications yet"}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {filter === "unread"
                  ? "You've read all your notifications."
                  : "When you get notifications, they'll show up here."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}


