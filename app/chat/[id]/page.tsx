"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill, FloatingNav } from "@/components/shared";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";

// Dummy chat data
const chatData = {
  id: "1",
  otherParty: {
    name: "Vitalik Buterin",
    handle: "VitalikButerin",
    initials: "VB",
  },
  escrow: {
    amount: "$50.00",
    status: "active" as const,
    deadline: "2h 30m",
  },
  messages: [
    {
      id: "1",
      sender: "user",
      content:
        "Hi Vitalik! I've been working on a Layer 2 scaling solution and would love your thoughts on the approach. We're using a novel ZK proof system.",
      timestamp: "2:30 PM",
    },
    {
      id: "2",
      sender: "other",
      content:
        "Thanks for reaching out! I'd be happy to take a look. Can you share more details about the proof system you're using?",
      timestamp: "2:45 PM",
    },
    {
      id: "3",
      sender: "user",
      content:
        "Sure! We're using a custom SNARK circuit that achieves better proving times while maintaining security assumptions. Here's a brief overview...",
      timestamp: "2:47 PM",
    },
    {
      id: "4",
      sender: "other",
      content:
        "Interesting approach. The tradeoff between proving time and circuit complexity is always tricky. Have you considered the impact on decentralization if proof generation requires specialized hardware?",
      timestamp: "3:00 PM",
    },
  ],
};

export default function ChatPage() {
  const params = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(chatData.messages);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    // Add message optimistically
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
    
    // Simulate send delay
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
            <a
              href="/profile"
              className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <BackIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </a>
            <div className="flex items-center gap-3">
              <AvatarGenerator seed={chatData.otherParty.handle} size={40} />
              <div>
                <h1 className="font-quicksand font-semibold text-neutral-900 dark:text-neutral-100">
                  {chatData.otherParty.name}
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  @{chatData.otherParty.handle}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Status + Deadline */}
          <div className="flex items-center gap-3">
            <StatusPill status={chatData.escrow.status} />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
              <ClockIcon className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-quicksand text-neutral-600 dark:text-neutral-400">
                {chatData.escrow.deadline}
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
                    <p className="text-sm font-quicksand leading-relaxed">
                      {message.content}
                    </p>
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
                  transition={isSending ? { duration: 1, repeat: Infinity } : {}}
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
            <h2 className="font-tenor text-lg text-neutral-900 dark:text-neutral-100 mb-6">
              Deal Terms
            </h2>

            {/* Amount Card */}
            <div className="bg-gradient-to-br from-koru-purple/10 to-koru-golden/10 rounded-2xl p-5 mb-4 border border-koru-purple/20">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-quicksand mb-1">
                Amount Deposited
              </p>
              <p className="text-2xl font-tenor font-medium text-neutral-900 dark:text-neutral-100">
                {chatData.escrow.amount}
              </p>
            </div>

            {/* Deadline Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 mb-6 border border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-quicksand mb-1">
                Deadline
              </p>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-koru-golden" />
                <p className="text-lg font-quicksand font-semibold text-neutral-900 dark:text-neutral-100">
                  {chatData.escrow.deadline}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" variant="default">
                <CheckIcon className="w-4 h-4 mr-2" />
                Release Payment
              </Button>
              <Button className="w-full" variant="outline">
                <RefundIcon className="w-4 h-4 mr-2" />
                Request Refund
              </Button>
            </div>

            {/* Info Note */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-6 leading-relaxed">
              The recipient must reply before the deadline to claim the payment.
              If no reply is received, you can request a full refund.
            </p>
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
                Escrow
              </p>
              <p className="font-quicksand font-semibold text-neutral-900 dark:text-neutral-100">
                {chatData.escrow.amount}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full">
                Release
              </Button>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefundIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

