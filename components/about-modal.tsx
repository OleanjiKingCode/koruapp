"use client";

import { motion, AnimatePresence } from "motion/react";
import { TextHighlight } from "@/components/ui/text-highlight";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-900 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="h-full overflow-y-auto p-6 md:p-10 lg:p-16">
              <div className="max-w-3xl mx-auto space-y-12 pb-10">
                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl   text-neutral-900 dark:text-neutral-100"
                >
                  The point of{" "}
                  <TextHighlight type="highlight" color="#c385ee" delay={0.3}>
                    Kōru
                  </TextHighlight>
                </motion.h1>

                {/* Section 1 - The Problem */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed  ">
                    Right now, the internet is broken in one painful way:
                  </p>
                  <p className="text-xl md:text-2xl text-neutral-900 dark:text-neutral-100  ">
                    <TextHighlight type="underline" color="#ef4444" delay={0.1}>
                      Access is random.
                    </TextHighlight>
                  </p>
                  <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed  ">
                    The best opportunities often go to whoever already has{" "}
                    <TextHighlight type="highlight" color="#dab079" delay={0.2}>
                      connections, clout, or a warm intro
                    </TextHighlight>.
                  </p>
                </motion.section>

                {/* Section 2 - The Solution */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <p className="text-xl md:text-2xl text-neutral-900 dark:text-neutral-100  ">
                    Kōru makes access{" "}
                    <TextHighlight type="highlight" color="#9deb61" delay={0.1}>
                      fair and predictable
                    </TextHighlight>:
                  </p>
                  <ul className="space-y-3 text-lg md:text-xl text-neutral-700 dark:text-neutral-300  ">
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-400 mt-1">→</span>
                      <span>
                        If you're serious,{" "}
                        <TextHighlight type="underline" color="#c385ee" delay={0.2}>
                          you can prove it
                        </TextHighlight>.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-400 mt-1">→</span>
                      <span>
                        If they're busy, their{" "}
                        <TextHighlight type="highlight" color="#dab079" delay={0.3}>
                          attention is respected and compensated
                        </TextHighlight>.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-400 mt-1">→</span>
                      <span>
                        The outcome is clear:{" "}
                        <TextHighlight type="box" color="#9deb61" delay={0.4}>
                          reply or refund
                        </TextHighlight>.
                      </span>
                    </li>
                  </ul>
                </motion.section>

                {/* Section 3 - What it saves you from */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300  ">
                    It saves people from:
                  </p>
                  <ul className="space-y-3 text-lg md:text-xl text-neutral-600 dark:text-neutral-400   pl-6">
                    <li className="list-disc">
                      <TextHighlight type="strike" color="#ef4444" delay={0.1}>
                        wasting weeks chasing one response
                      </TextHighlight>
                    </li>
                    <li className="list-disc">
                      <TextHighlight type="strike" color="#ef4444" delay={0.2}>
                        spamming follow-ups that feel desperate
                      </TextHighlight>
                    </li>
                    <li className="list-disc">
                      <TextHighlight type="strike" color="#ef4444" delay={0.3}>
                        losing deals, collaborations, hires, and life-changing intros to silence
                      </TextHighlight>
                    </li>
                  </ul>
                </motion.section>

                {/* Divider */}
                <div className="w-24 h-px bg-neutral-300 dark:bg-neutral-700 mx-auto" />

                {/* What Kōru is */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl md:text-3xl   text-neutral-900 dark:text-neutral-100">
                    What Kōru is
                  </h2>
                  <p className="text-xl md:text-2xl text-neutral-800 dark:text-neutral-200   leading-relaxed">
                    Kōru is a{" "}
                    <TextHighlight type="highlight" color="#c385ee" delay={0.1}>
                      direct line to the right people
                    </TextHighlight>{" "}
                    — with a{" "}
                    <TextHighlight type="box" color="#9deb61" delay={0.2}>
                      guaranteed reply
                    </TextHighlight>.
                  </p>
                  <div className="space-y-3 text-lg md:text-xl text-neutral-600 dark:text-neutral-400  ">
                    <p>You send a message with a{" "}
                      <TextHighlight type="underline" color="#dab079" delay={0.3}>
                        clear ask
                      </TextHighlight>.
                    </p>
                    <p>The recipient replies{" "}
                      <TextHighlight type="underline" color="#c385ee" delay={0.4}>
                        within a set time
                      </TextHighlight>.
                    </p>
                    <p>
                      If they don't,{" "}
                      <TextHighlight type="highlight" color="#9deb61" delay={0.5}>
                        you get your money back
                      </TextHighlight>.
                    </p>
                  </div>
                </motion.section>

                {/* What we're building */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl md:text-3xl   text-neutral-900 dark:text-neutral-100">
                    What we're building
                  </h2>
                  <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300  ">
                    A place where you can reach:
                  </p>
                  <ul className="space-y-2 text-lg md:text-xl text-neutral-600 dark:text-neutral-400   pl-6">
                    <li className="list-disc">
                      <TextHighlight type="highlight" color="rgba(218, 176, 121, 0.4)" delay={0.1}>
                        creators
                      </TextHighlight>{" "}you want feedback from
                    </li>
                    <li className="list-disc">
                      <TextHighlight type="highlight" color="rgba(195, 133, 238, 0.4)" delay={0.2}>
                        founders
                      </TextHighlight>{" "}you want advice from
                    </li>
                    <li className="list-disc">
                      <TextHighlight type="highlight" color="rgba(157, 235, 97, 0.4)" delay={0.3}>
                        investors
                      </TextHighlight>{" "}you want to pitch
                    </li>
                    <li className="list-disc">
                      <TextHighlight type="highlight" color="rgba(218, 176, 121, 0.4)" delay={0.4}>
                        operators
                      </TextHighlight>{" "}you want answers from
                    </li>
                  </ul>
                  <p className="text-xl md:text-2xl text-neutral-900 dark:text-neutral-100   pt-2">
                    …and{" "}
                    <TextHighlight type="highlight" color="#9deb61" delay={0.5}>
                      actually get a response
                    </TextHighlight>.
                  </p>
                </motion.section>

                {/* The bigger significance */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl md:text-3xl   text-neutral-900 dark:text-neutral-100">
                    The bigger significance
                  </h2>
                  <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300   leading-relaxed">
                    Kōru turns "DMs" from a{" "}
                    <TextHighlight type="strike" color="#ef4444" delay={0.1}>
                      lottery
                    </TextHighlight>{" "}
                    into a{" "}
                    <TextHighlight type="box" color="#9deb61" delay={0.2}>
                      system
                    </TextHighlight>.
                  </p>
                  <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400   leading-relaxed">
                    A system where{" "}
                    <TextHighlight type="underline" color="#dab079" delay={0.3}>
                      attention has value
                    </TextHighlight>,{" "}
                    <TextHighlight type="underline" color="#c385ee" delay={0.4}>
                      time is respected
                    </TextHighlight>, and{" "}
                    <TextHighlight type="highlight" color="rgba(157, 235, 97, 0.5)" delay={0.5}>
                      good opportunities don't die in silence
                    </TextHighlight>.
                  </p>
                </motion.section>

                {/* Final tagline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="pt-8 text-center"
                >
                  <p className="text-2xl md:text-3xl lg:text-4xl   text-neutral-900 dark:text-neutral-100">
                    <TextHighlight type="highlight" color="#c385ee" delay={0.2}>
                      No ghosting. Just outcomes.
                    </TextHighlight>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
