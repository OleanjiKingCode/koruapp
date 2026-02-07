"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useTheme } from "next-themes";
import Image from "next/image";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
  title?: string;
  description?: string;
}

export function LoginModal({
  open,
  onOpenChange,
  callbackUrl = "/profile",
  title = "Sign in to continue",
  description = "Connect your X account to access all features",
}: LoginModalProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const isDark = theme === "dark";

  const handleTwitterLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("twitter", { callbackUrl });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const isDesktop = useMediaQuery("(min-width: 640px)");

  const modalBody = (
    <div className="relative">
      {/* Content */}
      <div className="relative p-6 sm:p-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          {/* <div className="w-20 h-20 rounded-full bg-gradient-to-br from-koru-purple to-koru-golden flex items-center justify-center">
                <span className="text-3xl font-bold text-white font-tenor">K</span>
              </div> */}

          <Image
            src="/logo.png"
            alt=""
            width={100}
            height={100}
            className="rounded-full"
            aria-hidden="true"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2
            className={cn(
              "text-2xl font-bold mb-2",
              isDark ? "text-white" : "text-neutral-900",
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "text-sm",
              isDark ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            {description}
          </p>
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleTwitterLogin}
            disabled={isLoading}
            className={cn(
              "w-full py-6 rounded-xl text-base font-semibold transition-all",
              "bg-neutral-900 hover:bg-neutral-800 text-white",
              "dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900",
              "flex items-center justify-center gap-3",
              isLoading && "opacity-70 cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                Connecting...
              </>
            ) : (
              <>
                <XIcon className="w-5 h-5" />
                Continue with X
              </>
            )}
          </Button>
        </motion.div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "text-xs text-center mt-6",
            isDark ? "text-neutral-500" : "text-neutral-500",
          )}
        >
          By continuing, you agree to our terms and conditions.
        </motion.p>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "sm:max-w-md p-0 gap-0 overflow-hidden border-0",
            isDark ? "bg-neutral-900" : "bg-white",
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {modalBody}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
      <DrawerContent
        className={cn(
          "overflow-hidden border-0",
          isDark ? "bg-neutral-900" : "bg-white",
        )}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        <div data-vaul-no-drag>{modalBody}</div>
      </DrawerContent>
    </Drawer>
  );
}

// X (Twitter) Icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
