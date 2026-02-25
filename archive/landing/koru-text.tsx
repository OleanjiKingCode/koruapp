"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TypingAnimation } from "@/components/ui/typing-animation";

const fonts = [
  { name: "quicksand", className: " " },
  { name: "tenor", className: " " },
  { name: "lemon", className: "font-lemon" },
];

const koruSlides = [
  { title: "Kōru", subtitle: "Guaranteed replies. No noise." },
  { title: "Kōru", subtitle: "Reach the right person. Get an answer." },
  { title: "Kōru", subtitle: "No ghosting. Just outcomes." },
  { title: "Kōru", subtitle: "Your direct line to people who matter." },
];

const endingTexts = [
  "We're opening soon.",
  "Early access loading…",
  "Coming online.",
];

export function KoruText() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [phase, setPhase] = useState<"koru" | "ending">("koru");
  const [endingIndex, setEndingIndex] = useState(0);

  const totalKoruSlides = koruSlides.length;

  const handleWordComplete = useCallback(() => {
    setTimeout(() => {
      if (phase === "koru") {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex >= totalKoruSlides) {
          // Move to ending phase
          setPhase("ending");
          setEndingIndex(0);
        } else {
          setCurrentSlideIndex(nextSlideIndex);
          setCurrentFontIndex((prev) => (prev + 1) % fonts.length);
        }
      } else {
        // In ending phase
        const nextEndingIndex = endingIndex + 1;
        if (nextEndingIndex >= endingTexts.length) {
          // Loop back to start
          setPhase("koru");
          setCurrentSlideIndex(0);
          setCurrentFontIndex(0);
          setEndingIndex(0);
        } else {
          setEndingIndex(nextEndingIndex);
        }
      }
      setKey((prev) => prev + 1);
    }, 1200);
  }, [phase, currentSlideIndex, endingIndex, totalKoruSlides]);

  const currentFont = fonts[currentFontIndex];
  const currentSlide = koruSlides[currentSlideIndex];
  const currentEndingText = endingTexts[endingIndex];

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8">
      <AnimatePresence mode="wait">
        {phase === "koru" ? (
          <motion.div
            key={`koru-${key}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Main Kōru title */}
            <TypingAnimation
              className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl ${currentFont.className} text-neutral-900 dark:text-neutral-100 tracking-wide`}
              typeSpeed={120}
              deleteSpeed={80}
              pauseDelay={800}
              loop={false}
              showCursor={true}
              blinkCursor={true}
              cursorStyle="line"
              startOnView={false}
            >
              {currentSlide.title}
            </TypingAnimation>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onAnimationComplete={handleWordComplete}
              className="text-lg sm:text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 text-center max-w-xl  "
            >
              {currentSlide.subtitle}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key={`ending-${key}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <TypingAnimation
              className="text-3xl sm:text-4xl md:text-5xl   text-neutral-700 dark:text-neutral-300 text-center"
              typeSpeed={80}
              deleteSpeed={60}
              pauseDelay={1000}
              loop={false}
              showCursor={true}
              blinkCursor={true}
              cursorStyle="line"
              startOnView={false}
              onWordComplete={handleWordComplete}
            >
              {currentEndingText}
            </TypingAnimation>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
