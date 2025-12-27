"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] dark:bg-[#0d0d10] px-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(195, 133, 238, 0.15) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Kaya owl - dizzy state */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Body */}
              <circle cx="50" cy="55" r="35" fill="currentColor" className="text-neutral-200 dark:text-neutral-800" />
              
              {/* Dizzy X eyes */}
              <g className="text-koru-purple">
                <line x1="32" y1="44" x2="44" y2="56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="44" y1="44" x2="32" y2="56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </g>
              <g className="text-koru-purple">
                <line x1="56" y1="44" x2="68" y2="56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="68" y1="44" x2="56" y2="56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </g>
              
              {/* Beak - slightly open */}
              <path d="M50 60 L46 68 L54 68 Z" fill="currentColor" className="text-koru-golden" />
              
              {/* Stars around head */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "50px 40px" }}
              >
                <circle cx="30" cy="30" r="3" fill="currentColor" className="text-koru-golden" />
                <circle cx="50" cy="25" r="3" fill="currentColor" className="text-koru-purple" />
                <circle cx="70" cy="30" r="3" fill="currentColor" className="text-koru-golden" />
              </motion.g>
            </svg>
          </div>
        </motion.div>

        {/* Error Text */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-tenor text-neutral-900 dark:text-neutral-100 mb-4"
        >
          Something broke
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-600 dark:text-neutral-400 mb-8"
        >
          Don't worry, it happens to the best of us. Let's try that again.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button onClick={reset} size="lg" className="rounded-full">
            <RefreshIcon className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => (window.location.href = "/")}
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </motion.div>

        {/* Error digest for debugging */}
        {error.digest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-xs text-neutral-400 dark:text-neutral-600 font-mono"
          >
            Error ID: {error.digest}
          </motion.p>
        )}
      </motion.div>
    </main>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}




