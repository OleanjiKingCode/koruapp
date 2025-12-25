"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill, FloatingNav } from "@/components/shared";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";
import { MOCK_PROFILES } from "@/lib/data";
import { ROUTES } from "@/lib/constants";

// Initial messages template
function getInitialMessages(name: string) {
  return [
    {
      id: "1",
      sender: "user" as const,
      content: `Hi ${
        name.split(" ")[0]
      }! Thanks for accepting my booking. I have a few questions I'd like to discuss with you.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    },
  ];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the profile by ID
  const profile = useMemo(() => {
    return MOCK_PROFILES.find((p) => p.id === params.id);
  }, [params.id]);

  // If profile not found, show 404
  if (!profile) {
    notFound();
  }

  // Get booking info from localStorage
  const bookingInfo = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`koru-booking-${params.id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return null;
  }, [params.id]);

  const [messages, setMessages] = useState(() =>
    getInitialMessages(profile.name)
  );

  // Calculate deadline (24 hours from booking)
  const deadline = useMemo(() => {
    if (bookingInfo?.createdAt) {
      const expires = new Date(
        new Date(bookingInfo.createdAt).getTime() + 24 * 60 * 60 * 1000
      );
      const now = new Date();
      const diff = expires.getTime() - now.getTime();
      if (diff <= 0) return "Expired";
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    return "24h";
  }, [bookingInfo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    const message = {
      id: Date.now().toString(),
      sender: "user" as const,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingNav />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Back + User Info */}
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.PROFILE_VIEW(profile.id)}
              className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <BackIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <AvatarGenerator seed={profile.handle} size={40} />
              </div>
              <div>
                <h1 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {profile.name}
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  @{profile.handle}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Status + Deadline */}
          <div className="flex items-center gap-3">
            <StatusPill status="active" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
              <ClockIcon className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {deadline}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Messages Area */}
        <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.sender === "user"
                        ? "bg-koru-purple text-white rounded-br-md"
                        : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-bl-md"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-2",
                        message.sender === "user"
                          ? "text-white/70"
                          : "text-neutral-400"
                      )}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Bar */}
          <div className="sticky bottom-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-200/50 dark:border-neutral-800/50 p-4">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-3 max-w-3xl mx-auto"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 focus:ring-2 focus:ring-koru-purple/50"
                disabled={isSending}
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-xl bg-koru-purple hover:bg-koru-purple/90"
                disabled={!newMessage.trim() || isSending}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  animate={isSending ? { rotate: 360 } : {}}
                  transition={
                    isSending ? { duration: 1, repeat: Infinity } : {}
                  }
                >
                  <SendIcon className="w-5 h-5" />
                </motion.div>
              </Button>
            </form>
          </div>
        </main>

        {/* Right Sidebar - Deal Terms (Desktop only) */}
        <aside className="hidden lg:block w-80 border-l border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/50 p-6">
          <div className="sticky top-24">
            <h2 className="text-lg text-neutral-900 dark:text-neutral-100 mb-6">
              Session Details
            </h2>

            {/* Amount Card */}
            <div className="bg-gradient-to-br from-koru-purple/10 to-koru-golden/10 rounded-2xl p-5 mb-4 border border-koru-purple/20">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Amount Paid
              </p>
              <p className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">
                {bookingInfo?.price === 0
                  ? "Free"
                  : `$${bookingInfo?.price || profile.price}`}
              </p>
            </div>

            {/* Deadline Card */}
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

            {/* Slot Info */}
            {bookingInfo?.slotName && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 mb-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Session Type
                </p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {bookingInfo.slotName}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {bookingInfo.date} · {bookingInfo.time}
                </p>
              </div>
            )}

            {/* Info Note */}
            <div className="bg-koru-lime/10 rounded-xl p-4 border border-koru-lime/30">
              <div className="flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-koru-lime flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  If {profile.name.split(" ")[0]} doesn&apos;t reply within 24
                  hours, your payment will be{" "}
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

      {/* Mobile Deal Summary */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Paid
              </p>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {bookingInfo?.price === 0
                  ? "Free"
                  : `$${bookingInfo?.price || profile.price}`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <ClockIcon className="w-4 h-4" />
              <span>Auto-refund: {deadline}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
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
