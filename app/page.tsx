"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
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

          {/* Know More button */}
          <motion.button
            onClick={() => setIsAboutOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full border-2 border-neutral-400 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-quicksand text-lg hover:border-neutral-600 dark:hover:border-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-300"
          >
            Know more →
          </motion.button>
        </div>
      </main>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
