"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { KoruText } from "@/components/koru-text";
import { ThemeToggle } from "@/components/theme-toggle";
import { AboutModal } from "@/components/about-modal";

const floatingOrbs = [
  // Golden orbs - #dab079
  { color: "#dab079", size: 400, x: "15%", y: "25%", delay: 0, duration: 12 },
  { color: "#dab079", size: 250, x: "80%", y: "75%", delay: 3, duration: 15 },
  { color: "#dab079", size: 180, x: "90%", y: "10%", delay: 6, duration: 10 },
  // Purple orbs - #c385ee
  { color: "#c385ee", size: 450, x: "75%", y: "20%", delay: 1, duration: 14 },
  { color: "#c385ee", size: 300, x: "20%", y: "80%", delay: 4, duration: 16 },
  { color: "#c385ee", size: 200, x: "50%", y: "50%", delay: 7, duration: 11 },
  // Lime green orbs - #9deb61
  { color: "#9deb61", size: 380, x: "85%", y: "55%", delay: 2, duration: 13 },
  { color: "#9deb61", size: 220, x: "5%", y: "60%", delay: 5, duration: 17 },
  { color: "#9deb61", size: 160, x: "35%", y: "90%", delay: 8, duration: 9 },
];

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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

  return (
    <>
      <main
        className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
          isDark ? "bg-[#0d0d10]" : "bg-[#f8f7f4]"
        }`}
      >
        {/* Animated floating orbs */}
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
                opacity: isDark ? 0.5 : 0.4,
              }}
              animate={{
                x: [0, 50, -30, 60, 0],
                y: [0, -60, 40, -50, 0],
                scale: [1, 1.3, 0.85, 1.2, 1],
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

        {/* Theme toggle button - fixed position */}
        <div className="fixed top-8 right-8 z-40">
          <ThemeToggle />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-12">
          <KoruText />

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >

            <Link href="/discover">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-koru-purple text-white font-quicksand text-lg hover:bg-koru-purple/90 hover:shadow-lg hover:shadow-koru-purple/25 transition-all duration-300"
              >
                Get Started →
              </motion.button>
            </Link>
            <motion.button
              onClick={() => setIsAboutOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full border-2 border-neutral-400 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-quicksand text-lg hover:border-neutral-600 dark:hover:border-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-300"
            >
              Know more
            </motion.button>
          </motion.div>
          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex items-center gap-6"
          >
            <a
              href="https://x.com/koruapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="font-quicksand text-sm">@koruapp</span>
            </a>
            <a
              href="https://t.me/koruapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="font-quicksand text-sm">Telegram</span>
            </a>
          </motion.div>
        </div>
      </main>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
