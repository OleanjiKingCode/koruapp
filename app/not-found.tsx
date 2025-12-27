"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4] dark:bg-[#0d0d10] px-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(195, 133, 238, 0.2) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(218, 176, 121, 0.2) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Kaya owl with compass */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative w-32 h-32">
            {/* Owl body */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Body */}
              <circle
                cx="50"
                cy="55"
                r="35"
                fill="currentColor"
                className="text-koru-purple/20"
              />

              {/* Eyes */}
              <circle
                cx="38"
                cy="50"
                r="12"
                fill="currentColor"
                className="text-koru-purple/30"
              />
              <circle
                cx="62"
                cy="50"
                r="12"
                fill="currentColor"
                className="text-koru-purple/30"
              />
              <circle
                cx="38"
                cy="50"
                r="6"
                fill="currentColor"
                className="text-koru-purple"
              />
              <circle
                cx="62"
                cy="50"
                r="6"
                fill="currentColor"
                className="text-koru-purple"
              />

              {/* Eye reflections */}
              <circle cx="40" cy="48" r="2" fill="white" />
              <circle cx="64" cy="48" r="2" fill="white" />

              {/* Beak */}
              <path
                d="M50 55 L47 62 L53 62 Z"
                fill="currentColor"
                className="text-koru-golden"
              />

              {/* Compass in wing */}
              <g transform="translate(15, 60)">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-koru-golden"
                />
                <line
                  x1="12"
                  y1="4"
                  x2="12"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-koru-golden"
                />
                <line
                  x1="12"
                  y1="16"
                  x2="12"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-koru-golden"
                />
                <line
                  x1="4"
                  y1="12"
                  x2="8"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-koru-golden"
                />
                <line
                  x1="16"
                  y1="12"
                  x2="20"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-koru-golden"
                />
                <motion.path
                  d="M12 12 L14 8 L12 14 L10 8 Z"
                  fill="currentColor"
                  className="text-red-500"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "12px 12px" }}
                />
              </g>
            </svg>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-8xl   font-bold text-neutral-200 dark:text-neutral-800 mb-4"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl   text-neutral-900 dark:text-neutral-100 mb-4"
        >
          Kaya got lost
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-neutral-600 dark:text-neutral-400   mb-8"
        >
          This page doesn't exist, but don't worry — Kaya's recalibrating the
          compass.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/">
            <Button size="lg" className="rounded-full">
              <HomeIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}


