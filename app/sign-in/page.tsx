"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthState = "idle" | "connecting" | "connected" | "signing" | "error";

const benefits = [
  "Direct access to people who matter",
  "Guaranteed responses, always",
  "Your time, respected and valued",
];

export default function SignInPage() {
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleConnect = async () => {
    setAuthState("connecting");
    setErrorMessage("");

    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo, randomly succeed or show connected state
    setAuthState("connected");
  };

  const handleSign = async () => {
    setAuthState("signing");
    setErrorMessage("");

    // Simulate SIWE signing
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // For demo, randomly fail sometimes
    const success = Math.random() > 0.3;
    if (success) {
      // Redirect to main app
      window.location.href = "/discover";
    } else {
      setAuthState("error");
      setErrorMessage("Signature rejected. Please try again.");
    }
  };

  const handleRetry = () => {
    setAuthState("idle");
    setErrorMessage("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8f7f4] dark:bg-[#0d0d10]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Purple corner glow - top left */}
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(195, 133, 238, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Golden glow - bottom right */}
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(218, 176, 121, 0.25) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Subtle lime accent */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(157, 235, 97, 0.08) 0%, transparent 60%)",
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl rounded-3xl overflow-hidden">
          {/* Subtle purple gradient at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-koru-purple via-koru-golden to-koru-lime opacity-80" />

          <CardHeader className="text-center pt-10 pb-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-5xl   text-neutral-900 dark:text-neutral-100 tracking-wide">
                Kōru
              </h1>
            </motion.div>

            <CardTitle className="text-2xl   font-semibold text-neutral-900 dark:text-neutral-100">
              Welcome to Kōru
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400   text-base mt-2">
              A clean lane for serious conversations.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {/* Idle State - Connect Wallet */}
              {authState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Button
                    onClick={handleConnect}
                    size="lg"
                    className="w-full"
                  >
                    <WalletIcon className="w-5 h-5" />
                    Connect Wallet
                  </Button>

                  {/* Benefits */}
                  <div className="space-y-3 pt-4">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-koru-purple" />
                        {benefit}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Connecting State */}
              {authState === "connecting" && (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Button size="lg" className="w-full" isLoading>
                    Connecting...
                  </Button>
                  <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Please approve the connection in your wallet
                  </p>
                </motion.div>
              )}

              {/* Connected State - Sign Message */}
              {authState === "connected" && (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Success indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-koru-lime/20 flex items-center justify-center">
                      <CheckIcon className="w-8 h-8 text-koru-lime" />
                    </div>
                  </motion.div>

                  <p className="text-center text-neutral-700 dark:text-neutral-300  ">
                    Wallet connected! Sign to continue.
                  </p>

                  <Button
                    onClick={handleSign}
                    size="lg"
                    className="w-full"
                  >
                    <SignatureIcon className="w-5 h-5" />
                    Sign to Continue
                  </Button>
                </motion.div>
              )}

              {/* Signing State */}
              {authState === "signing" && (
                <motion.div
                  key="signing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Button size="lg" className="w-full" isLoading>
                    Awaiting signature...
                  </Button>
                  <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Please sign the message in your wallet
                  </p>
                </motion.div>
              )}

              {/* Error State */}
              {authState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Error indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XIcon className="w-8 h-8 text-red-500" />
                    </div>
                  </motion.div>

                  <p className="text-center text-red-500  ">
                    {errorMessage}
                  </p>

                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
                <ShieldIcon className="w-4 h-4" />
                <span>Signing is free. No transaction required.</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Web3 mode indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mt-6"
        >
          <div className="px-4 py-2 rounded-full bg-koru-purple/10 border border-koru-purple/20">
            <span className="text-sm   text-koru-purple">
              Web3 Mode
            </span>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

// Icons
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function SignatureIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}







