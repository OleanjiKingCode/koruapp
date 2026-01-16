"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { AuthGuard } from "@/components/auth";
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

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// Types
interface Notification {
  id: string;
  type: "message" | "payment" | "request" | "completed" | "summon_backed" | "summon_created";
  title: string;
  description: string | null;
  timeAgo: string;
  read: boolean;
  relatedUserUsername: string | null;
  relatedUserImage: string | null;
  link: string | null;
}

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
    case "summon_backed":
    case "summon_created":
      return (
        <div className="w-8 h-8 rounded-full bg-koru-purple/10 flex items-center justify-center">
          <SparklesIcon className="w-4 h-4 text-koru-purple" />
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
  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
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
          {notification.relatedUserUsername ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {notification.relatedUserImage ? (
                <img
                  src={notification.relatedUserImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarGenerator seed={notification.relatedUserUsername} size={40} />
              )}
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
              {notification.timeAgo}
            </span>
          </div>
          {notification.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
              {notification.description}
            </p>
          )}
        </div>

        {/* Type Icon */}
        <div className="shrink-0 hidden sm:block">
          <NotificationIcon type={notification.type} />
        </div>
      </div>
    </motion.div>
  );

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleMarkRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Revert on error
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (err) {
      console.error("Error marking all as read:", err);
      // Revert on error
      fetchNotifications();
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-[500px] sm:pb-96">
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <LoaderIcon className="w-8 h-8 text-koru-purple" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <BellIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                {error}
              </h3>
              <Button variant="outline" onClick={fetchNotifications}>
                Try again
              </Button>
            </div>
          )}

          {/* Notifications List */}
          {!isLoading && !error && (
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
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
