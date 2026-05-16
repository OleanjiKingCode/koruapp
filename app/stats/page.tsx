"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const floatingOrbs = [
  { color: "#dab079", size: 380, x: "12%", y: "20%", delay: 0, duration: 13 },
  { color: "#c385ee", size: 420, x: "78%", y: "22%", delay: 1, duration: 15 },
  { color: "#9deb61", size: 340, x: "85%", y: "70%", delay: 2, duration: 14 },
  { color: "#dab079", size: 240, x: "20%", y: "78%", delay: 3, duration: 12 },
  { color: "#c385ee", size: 200, x: "50%", y: "50%", delay: 5, duration: 16 },
  { color: "#9deb61", size: 180, x: "8%", y: "55%", delay: 6, duration: 11 },
];

type Metric = {
  label: string;
  value: number;
  suffix?: string;
  caption: string;
  accent: string;
};

const metrics: Metric[] = [
  {
    label: "Summons created",
    value: 12480,
    caption: "people summoned across the network",
    accent: "#c385ee",
  },
  {
    label: "Chats made",
    value: 47322,
    caption: "real conversations sparked on Koru",
    accent: "#dab079",
  },
  {
    label: "Platform visits",
    value: 186540,
    caption: "visits in the last 30 days",
    accent: "#9deb61",
  },
  {
    label: "Active users",
    value: 8260,
    caption: "people coming back this week",
    accent: "#c385ee",
  },
];

function useCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function MetricCard({
  metric,
  index,
  isDark,
}: {
  metric: Metric;
  index: number;
  isDark: boolean;
}) {
  const count = useCountUp(metric.value, 1400 + index * 200);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.12, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur-md ${
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-black/5 bg-white/60"
      }`}
    >
      <div
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: metric.accent }}
      />
      <div className="relative z-10 flex flex-col gap-3">
        <span
          className={`font-quicksand text-xs uppercase tracking-[0.18em] ${
            isDark ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          {metric.label}
        </span>
        <span
          className={`font-tenor text-5xl sm:text-6xl leading-none ${
            isDark ? "text-neutral-50" : "text-neutral-900"
          }`}
        >
          {count.toLocaleString()}
          {metric.suffix ?? ""}
        </span>
        <span
          className={`font-quicksand text-sm ${
            isDark ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          {metric.caption}
        </span>
      </div>
    </motion.div>
  );
}

export default function StatsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-32 h-32" />
      </main>
    );
  }

  const isDark = theme === "dark";
  const updatedLabel = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main
      className={`min-h-screen relative overflow-hidden ${
        isDark ? "bg-[#0d0d10]" : "bg-[#f8f7f4]"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingOrbs.map((orb, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: orb.color,
              filter: `blur(${orb.size / 3}px)`,
              transform: "translate(-50%, -50%)",
              opacity: isDark ? 0.45 : 0.35,
            }}
            animate={{
              x: [0, 40, -30, 50, 0],
              y: [0, -50, 30, -40, 0],
              scale: [1, 1.25, 0.9, 1.15, 1],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="fixed top-8 right-8 z-40">
        <ThemeToggle />
      </div>

      <div className="fixed top-8 left-8 z-40">
        <Link
          href="/"
          className={`font-quicksand text-sm transition-colors ${
            isDark
              ? "text-neutral-400 hover:text-neutral-100"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          ← Back
        </Link>
      </div>

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col gap-12 px-6 pt-32 pb-24 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <span
            className={`font-quicksand text-xs uppercase tracking-[0.2em] ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            Koru · platform pulse
          </span>
          <h1
            className={`font-tenor text-4xl sm:text-6xl leading-tight ${
              isDark ? "text-neutral-50" : "text-neutral-900"
            }`}
          >
            How Koru is{" "}
            <span className="bg-gradient-to-r from-[#c385ee] via-[#dab079] to-[#9deb61] bg-clip-text text-transparent">
              fairing
            </span>{" "}
            so far.
          </h1>
          <p
            className={`font-quicksand max-w-2xl text-base sm:text-lg ${
              isDark ? "text-neutral-300" : "text-neutral-700"
            }`}
          >
            A quick look at what's happening on the platform — summons, chats,
            visits, and the people showing up week after week.
          </p>
          <span
            className={`font-quicksand text-xs ${
              isDark ? "text-neutral-500" : "text-neutral-500"
            }`}
          >
            Snapshot · updated {updatedLabel}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              metric={metric}
              index={index}
              isDark={isDark}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className={`flex flex-col gap-4 rounded-3xl border p-7 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between ${
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-black/5 bg-white/60"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span
              className={`font-tenor text-2xl ${
                isDark ? "text-neutral-50" : "text-neutral-900"
              }`}
            >
              Want to be part of the next number?
            </span>
            <span
              className={`font-quicksand text-sm ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Join the waitlist and get early access when we open the doors.
            </span>
          </div>
          <Link
            href="/"
            className="self-start rounded-full bg-gradient-to-r from-[#c385ee] to-[#dab079] px-6 py-3 font-quicksand text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:self-auto"
          >
            Join the waitlist →
          </Link>
        </motion.div>

        <p
          className={`font-quicksand text-center text-xs ${
            isDark ? "text-neutral-500" : "text-neutral-500"
          }`}
        >
          Numbers shown are a current snapshot of platform activity.
        </p>
      </section>
    </main>
  );
}
