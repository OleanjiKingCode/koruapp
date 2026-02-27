"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "@/lib/toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useTheme } from "next-themes";
import { WAITLIST_SOURCES } from "@/lib/constants/waitlist";
import Image from "next/image";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    twitter_handle: "",
    email: "",
    dream_conversation: "",
    heard_from: "",
    notes: "",
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setForm({
        name: "",
        twitter_handle: "",
        email: "",
        dream_conversation: "",
        heard_from: "",
        notes: "",
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.twitter_handle.trim() ||
      !form.email.trim() ||
      !form.heard_from
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          twitter_handle: form.twitter_handle.trim(),
          email: form.email.trim(),
          dream_conversation: form.dream_conversation.trim() || null,
          heard_from: form.heard_from,
          notes: form.notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
        return;
      }

      toast.success("You're on the waitlist! We'll be in touch.");
      handleOpenChange(false);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const modalBody = (
    <div className="relative">
      <div className="relative p-3 sm:p-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex justify-center mb-3 sm:mb-5"
        >
          <Image
            src="/logo.png"
            alt=""
            width={100}
            height={100}
            className="rounded-full w-14 h-14 sm:w-20 sm:h-20"
            aria-hidden="true"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4 sm:mb-6"
        >
          <h2
            className={cn(
              "text-lg sm:text-xl font-bold mb-1",
              isDark ? "text-white" : "text-neutral-900",
            )}
          >
            Join the Waitlist
          </h2>
          <p
            className={cn(
              "text-xs sm:text-sm",
              isDark ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            Be the first to know when Kōru launches
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Name */}
          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1 block",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              Name <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="Your name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={cn(
                "h-9 sm:h-10 rounded-lg text-sm",
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  : "bg-white border-neutral-200",
              )}
            />
          </div>

          {/* X Handle */}
          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1 block",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              X / Twitter Handle <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 text-sm",
                  isDark ? "text-neutral-500" : "text-neutral-400",
                )}
              >
                @
              </span>
              <Input
                placeholder="handle"
                value={form.twitter_handle}
                onChange={(e) =>
                  updateField(
                    "twitter_handle",
                    e.target.value.replace(/^@/, ""),
                  )
                }
                className={cn(
                  "h-9 sm:h-10 rounded-lg text-sm pl-7",
                  isDark
                    ? "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    : "bg-white border-neutral-200",
                )}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1 block",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              Email <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={cn(
                "h-9 sm:h-10 rounded-lg text-sm",
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  : "bg-white border-neutral-200",
              )}
            />
          </div>

          {/* Dream conversation */}
          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1 block",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              Who would you like to talk to?{" "}
              <span
                className={cn(
                  "font-normal italic",
                  isDark ? "text-neutral-500" : "text-neutral-400",
                )}
              >
                Be as delusional as possible
              </span>
            </label>
            <Input
              placeholder="e.g. Elon Musk, Beyoncé, Naval Ravikant..."
              value={form.dream_conversation}
              onChange={(e) => updateField("dream_conversation", e.target.value)}
              className={cn(
                "h-9 sm:h-10 rounded-lg text-sm",
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  : "bg-white border-neutral-200",
              )}
            />
          </div>

          {/* How did you hear about us */}
          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1 block",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              How did you hear about Kōru?{" "}
              <span className="text-red-400">*</span>
            </label>
            {isDesktop ? (
              <Select
                value={form.heard_from}
                onValueChange={(val) => updateField("heard_from", val)}
              >
                <SelectTrigger
                  className={cn(
                    "h-9 sm:h-10 rounded-lg text-sm",
                    isDark
                      ? "bg-neutral-800 border-neutral-700 text-white"
                      : "bg-white border-neutral-200",
                    !form.heard_from &&
                      (isDark ? "text-neutral-500" : "text-neutral-400"),
                  )}
                >
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent
                  className={cn(
                    isDark
                      ? "bg-neutral-800 border-neutral-700"
                      : "bg-white border-neutral-200",
                  )}
                >
                  {WAITLIST_SOURCES.map((source) => (
                    <SelectItem
                      key={source}
                      value={source}
                      className={cn(
                        "text-sm",
                        isDark
                          ? "text-white focus:bg-neutral-700 focus:text-white"
                          : "",
                      )}
                    >
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <select
                value={form.heard_from}
                onChange={(e) => updateField("heard_from", e.target.value)}
                className={cn(
                  "w-full h-9 rounded-lg text-sm px-3 border appearance-none",
                  isDark
                    ? "bg-neutral-800 border-neutral-700 text-white"
                    : "bg-white border-neutral-200 text-neutral-900",
                  !form.heard_from &&
                    (isDark ? "text-neutral-500" : "text-neutral-400"),
                )}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {WAITLIST_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Optional notes */}
          <div>
            <label
              className={cn(
                "text-xs font-medium mb-1 block",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              Anything else?{" "}
              <span
                className={isDark ? "text-neutral-600" : "text-neutral-400"}
              >
                (optional)
              </span>
            </label>
            <Input
              placeholder="What are you most excited about?"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className={cn(
                "h-9 sm:h-10 rounded-lg text-sm",
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  : "bg-white border-neutral-200",
              )}
            />
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "w-full py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold transition-all",
              "bg-gradient-to-r from-[#c385ee] to-[#dab079] text-white",
              "hover:opacity-90",
              "flex items-center justify-center gap-2",
              isSubmitting && "opacity-70 cursor-not-allowed",
            )}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="60"
                      strokeDashoffset="45"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
                Joining...
              </>
            ) : (
              "Join Waitlist"
            )}
          </button>

          {/* Privacy note */}
          <p
            className={cn(
              "text-[10px] sm:text-xs text-center mt-3",
              isDark ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            We&apos;ll only use your info to notify you about Kōru. No spam.
          </p>
        </motion.div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "sm:max-w-md p-0 gap-0 overflow-hidden border-0 rounded-2xl",
            isDark ? "bg-neutral-900" : "bg-white",
          )}
        >
          <DialogTitle className="sr-only">Join the Waitlist</DialogTitle>
          {modalBody}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        className={cn(
          "overflow-hidden border-0 rounded-t-[24px]",
          isDark ? "bg-neutral-900" : "bg-white",
        )}
      >
        <DrawerTitle className="sr-only">Join the Waitlist</DrawerTitle>
        <div className="px-2 pb-6 max-h-[85dvh] overflow-y-auto" data-vaul-no-drag>
          {modalBody}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
