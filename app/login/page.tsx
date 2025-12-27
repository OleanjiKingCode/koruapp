"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const error = searchParams.get("error");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If already logged in, redirect
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16" />
      </main>
    );
  }

  const isDark = theme === "dark";

  const handleTwitterLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("twitter", { callbackUrl });
    } catch (err) {
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-koru-purple/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-koru-golden/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-koru-lime/10 rounded-full blur-3xl"
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative w-full max-w-md rounded-3xl p-8 md:p-10",
          isDark
            ? "bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl"
            : "bg-white/80 border border-neutral-200 backdrop-blur-xl shadow-2xl"
        )}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-koru-purple to-koru-golden opacity-50 blur-xl"
            />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-koru-purple via-koru-golden to-koru-lime flex items-center justify-center">
              <span className="text-4xl font-bold text-white font-tenor">K</span>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1
            className={cn(
              "text-3xl font-bold mb-3",
              isDark ? "text-white" : "text-neutral-900"
            )}
          >
            Welcome to Kōru
          </h1>
          <p
            className={cn(
              "text-base",
              isDark ? "text-neutral-400" : "text-neutral-600"
            )}
          >
            Pay for access. Earn for time.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-6 p-4 rounded-xl text-sm text-center",
              isDark
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-red-50 text-red-600 border border-red-200"
            )}
          >
            {error === "OAuthSignin" && "Error starting sign in flow"}
            {error === "OAuthCallback" && "Error during authentication callback"}
            {error === "OAuthCreateAccount" && "Could not create account"}
            {error === "Callback" && "Authentication error"}
            {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "Callback"].includes(error) && "An error occurred"}
          </motion.div>
        )}

        {/* Login Button */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleTwitterLogin}
            disabled={isLoading || status === "loading"}
            className={cn(
              "w-full py-6 rounded-2xl text-base font-semibold transition-all",
              "bg-neutral-900 hover:bg-neutral-800 text-white",
              "dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900",
              "flex items-center justify-center gap-3",
              "shadow-lg hover:shadow-xl",
              (isLoading || status === "loading") && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading || status === "loading" ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-3"
        >
          {[
            { icon: "🔒", text: "Secure authentication via X" },
            { icon: "⚡", text: "Book sessions with experts" },
            { icon: "💰", text: "Earn by sharing your time" },
          ].map((feature, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 text-sm",
                isDark ? "text-neutral-400" : "text-neutral-600"
              )}
            >
              <span>{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "text-xs text-center mt-8",
            isDark ? "text-neutral-500" : "text-neutral-500"
          )}
        >
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-koru-purple transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-koru-purple transition-colors">
            Privacy Policy
          </a>
        </motion.p>
      </motion.div>
    </div>
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



