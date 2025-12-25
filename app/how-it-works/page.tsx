"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { FloatingNav, Footer } from "@/components/shared";

type Persona = "seeker" | "host";

// Journey steps data
const seekerJourney = [
  {
    step: 1,
    title: "Discover",
    subtitle: "Find the right person",
    description:
      "Search and browse experts by topic, check their bio, rates, and credibility signals to find the perfect match for your needs.",
    color: "purple" as const,
  },
  {
    step: 2,
    title: "Book & Pay",
    subtitle: "Secure your session",
    description:
      "Pick an available slot, submit a clear request, and pay upfront. Your funds are held safely until the session completes.",
    color: "golden" as const,
  },
  {
    step: 3,
    title: "Connect",
    subtitle: "Get direct answers",
    description:
      "Join the call at the scheduled time. Get personalized advice, feedback, and clarity from your chosen expert.",
    color: "lime" as const,
  },
  {
    step: 4,
    title: "Settle",
    subtitle: "Guaranteed outcome",
    description:
      "Payment releases to host after completion. If they miss the session, you get an automatic refund. Zero risk.",
    color: "purple" as const,
  },
];

const hostJourney = [
  {
    step: 1,
    title: "Create",
    subtitle: "Set up your listing",
    description:
      "Define your topics, set your price and availability. Keep expectations clear for better sessions.",
    color: "lime" as const,
  },
  {
    step: 2,
    title: "Accept",
    subtitle: "Get booking requests",
    description:
      "Receive contextual booking requests, confirm slots, and prepare for asks with less back-and-forth.",
    color: "golden" as const,
  },
  {
    step: 3,
    title: "Deliver",
    subtitle: "Provide value",
    description:
      "Show up and give real value. Build reputation through reviews and grow your presence on the platform.",
    color: "purple" as const,
  },
  {
    step: 4,
    title: "Earn",
    subtitle: "Get paid seamlessly",
    description:
      "Payment releases automatically after successful completion. No chasing, clean predictable earnings.",
    color: "lime" as const,
  },
];

// Trust features
const trustFeatures = [
  {
    icon: ShieldIcon,
    title: "No-show Protection",
    description:
      "Automatic refunds if a host doesn't show up. No disputes, no waiting.",
  },
  {
    icon: ClockIcon,
    title: "Clear Time Windows",
    description:
      "Defined start and end times. Both parties know exactly what to expect.",
  },
  {
    icon: LockIcon,
    title: "Escrow Holding",
    description:
      "Funds held securely until session completes. Fair for everyone.",
  },
  {
    icon: FilterIcon,
    title: "Quality Requests",
    description: "Clear requests filter spam and help hosts prepare properly.",
  },
];

const colorClasses = {
  purple: {
    bg: "bg-koru-purple",
    bgLight: "bg-koru-purple/20",
    text: "text-koru-purple",
    border: "border-koru-purple",
    shadow: "shadow-koru-purple/40",
    glow: "shadow-[0_0_40px_rgba(195,133,238,0.4)]",
  },
  golden: {
    bg: "bg-koru-golden",
    bgLight: "bg-koru-golden/20",
    text: "text-koru-golden",
    border: "border-koru-golden",
    shadow: "shadow-koru-golden/40",
    glow: "shadow-[0_0_40px_rgba(218,176,121,0.4)]",
  },
  lime: {
    bg: "bg-koru-lime",
    bgLight: "bg-koru-lime/20",
    text: "text-koru-lime",
    border: "border-koru-lime",
    shadow: "shadow-koru-lime/40",
    glow: "shadow-[0_0_40px_rgba(157,235,97,0.4)]",
  },
};

export default function HowItWorksPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>("seeker");

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
  const currentJourney =
    activePersona === "seeker" ? seekerJourney : hostJourney;

  return (
    <>
      <div className="min-h-screen pb-96">
        <FloatingNav />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1
              className={cn(
                "text-5xl md:text-6xl lg:text-7xl  mb-6 leading-tight",
                isDark ? "text-white" : "text-neutral-900"
              )}
            >
              How{" "}
              <span className="relative inline-block">
                <span className="text-koru-purple">Kōru</span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-koru-purple/40 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
              </span>{" "}
              Works
            </h1>

            <p
              className={cn(
                "text-xl md:text-2xl  max-w-2xl mx-auto leading-relaxed",
                isDark ? "text-neutral-400" : "text-neutral-600"
              )}
            >
              A direct line to the right people — with a guaranteed outcome.
              <br />
              <span className="text-koru-golden">Book time, get clarity.</span>
            </p>
          </motion.section>

          {/* Persona Toggle */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <div className="flex justify-center">
              <div
                className={cn(
                  "inline-flex p-1.5 rounded-2xl",
                  isDark
                    ? "bg-neutral-900 border border-neutral-800"
                    : "bg-neutral-100"
                )}
              >
                {[
                  {
                    id: "seeker" as Persona,
                    label: "Seeking Expertise",
                    sublabel: "Book & Learn",
                    icon: SearchIcon,
                  },
                  {
                    id: "host" as Persona,
                    label: "Sharing Knowledge",
                    sublabel: "Host & Earn",
                    icon: SparkleIcon,
                  },
                ].map((persona) => {
                  const Icon = persona.icon;
                  const isActive = activePersona === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setActivePersona(persona.id)}
                      className={cn(
                        "relative flex items-center gap-3 px-6 sm:px-8 py-4 rounded-xl  transition-all duration-300",
                        isActive
                          ? "text-white"
                          : isDark
                          ? "text-neutral-500 hover:text-neutral-300"
                          : "text-neutral-500 hover:text-neutral-700"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-koru-purple rounded-xl"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.5,
                          }}
                        />
                      )}
                      <Icon className="w-5 h-5 relative z-10" />
                      <div className="relative z-10 text-left">
                        <span className="block font-semibold text-sm sm:text-base">
                          {persona.label}
                        </span>
                        <span
                          className={cn(
                            "hidden sm:block text-xs",
                            isActive
                              ? "text-white/70"
                              : isDark
                              ? "text-neutral-600"
                              : "text-neutral-400"
                          )}
                        >
                          {persona.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Journey Steps - Zigzag Layout */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-24"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePersona}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {/* Vertical connecting line - Desktop */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-1">
                  <motion.div
                    className="w-full h-full rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div
                      className={cn(
                        "w-full h-full",
                        isDark ? "bg-neutral-800" : "bg-neutral-200"
                      )}
                    />
                    <motion.div
                      className="absolute top-0 left-0 w-full bg-gradient-to-b from-koru-purple via-koru-golden to-koru-lime"
                      initial={{ height: "0%" }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                    />
                  </motion.div>
                </div>

                {/* Step Cards */}
                <div className="relative space-y-6 lg:space-y-12">
                  {currentJourney.map((item, index) => {
                    const isLeft = index % 2 === 0;
                    const colors = colorClasses[item.color];

                    return (
                      <motion.div
                        key={`${activePersona}-${item.step}`}
                        initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.2 + 0.3,
                          duration: 0.6,
                          type: "spring",
                          stiffness: 80,
                          damping: 15,
                        }}
                        className={cn(
                          "relative lg:w-[calc(50%-40px)]",
                          isLeft ? "lg:mr-auto" : "lg:ml-auto"
                        )}
                      >
                        {/* Connector dot on the line - Desktop */}
                        <motion.div
                          className={cn(
                            "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-20",
                            isLeft ? "-right-[52px]" : "-left-[52px]"
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: index * 0.2 + 0.5,
                            type: "spring",
                            stiffness: 200,
                          }}
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center",
                              colors.bg,
                              colors.glow
                            )}
                          >
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        </motion.div>

                        {/* Horizontal connector line - Desktop */}
                        <motion.div
                          className={cn(
                            "hidden lg:block absolute top-1/2 -translate-y-1/2 h-0.5",
                            isLeft
                              ? "-right-[40px] w-[40px]"
                              : "-left-[40px] w-[40px]",
                            colors.bg
                          )}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            delay: index * 0.2 + 0.6,
                            duration: 0.3,
                          }}
                          style={{ transformOrigin: isLeft ? "right" : "left" }}
                        />

                        {/* Card */}
                        <motion.div
                          className={cn(
                            "group relative p-6 sm:p-8 rounded-3xl transition-all duration-300",
                            isDark
                              ? "bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700"
                              : "bg-white border border-neutral-200 hover:border-neutral-300 shadow-lg hover:shadow-xl"
                          )}
                          whileHover={{ scale: 1.02, y: -4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {/* Glow effect on hover */}
                          <div
                            className={cn(
                              "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl",
                              colors.bgLight
                            )}
                          />

                          {/* Top accent bar */}
                          <motion.div
                            className={cn(
                              "absolute top-0 left-8 right-8 h-1 rounded-b-full",
                              colors.bg
                            )}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                              delay: index * 0.2 + 0.7,
                              duration: 0.4,
                            }}
                          />

                          <div className="flex items-start gap-5">
                            {/* Step number */}
                            <motion.div
                              className={cn(
                                "relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl  font-bold flex-shrink-0",
                                colors.bg,
                                item.color === "lime"
                                  ? "text-neutral-900"
                                  : "text-white"
                              )}
                              initial={{ rotate: -10, scale: 0.8 }}
                              animate={{ rotate: 0, scale: 1 }}
                              transition={{
                                delay: index * 0.2 + 0.4,
                                type: "spring",
                                stiffness: 200,
                              }}
                              whileHover={{
                                rotate: [0, -5, 5, 0],
                                transition: { duration: 0.5 },
                              }}
                            >
                              {item.step}

                              {/* Pulse ring animation */}
                              <motion.div
                                className={cn(
                                  "absolute inset-0 rounded-2xl",
                                  colors.bg
                                )}
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [0.5, 0, 0.5],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: index * 0.2,
                                }}
                              />
                            </motion.div>

                            <div className="flex-1 min-w-0">
                              <h3
                                className={cn(
                                  "text-xl sm:text-2xl  mb-1",
                                  isDark ? "text-white" : "text-neutral-900"
                                )}
                              >
                                {item.title}
                              </h3>

                              <p
                                className={cn(
                                  "text-sm  font-semibold mb-3",
                                  colors.text
                                )}
                              >
                                {item.subtitle}
                              </p>

                              <p
                                className={cn(
                                  " leading-relaxed text-sm sm:text-base",
                                  isDark
                                    ? "text-neutral-400"
                                    : "text-neutral-600"
                                )}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>

          {/* Trust & Safety Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <h2
                className={cn(
                  "text-3xl md:text-4xl  mb-4",
                  isDark ? "text-white" : "text-neutral-900"
                )}
              >
                Built-in Trust
              </h2>
              <p
                className={cn(
                  " text-lg max-w-xl mx-auto",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                Every transaction is protected. Fair outcomes, always.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trustFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={cn(
                      "flex items-start gap-5 p-6 rounded-2xl transition-all duration-300",
                      isDark
                        ? "bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-900"
                        : "bg-white/50 border border-neutral-200 hover:bg-white hover:shadow-lg"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        "bg-koru-lime/10"
                      )}
                    >
                      <Icon className="w-6 h-6 text-koru-lime" />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "text-lg  mb-2",
                          isDark ? "text-white" : "text-neutral-900"
                        )}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={cn(
                          "",
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Contract Info Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div
              className={cn(
                "rounded-3xl p-8 md:p-12 relative overflow-hidden",
                isDark
                  ? "bg-neutral-900 border border-neutral-800"
                  : "bg-white border border-neutral-200"
              )}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <div
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "bg-gradient-to-br from-koru-purple to-koru-lime blur-3xl"
                  )}
                />
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <ContractIcon
                      className={cn(
                        "w-8 h-8",
                        isDark ? "text-neutral-300" : "text-neutral-700"
                      )}
                    />
                    <h2
                      className={cn(
                        "text-2xl md:text-3xl ",
                        isDark ? "text-white" : "text-neutral-900"
                      )}
                    >
                      Contract & Audit
                    </h2>
                  </div>

                  <p
                    className={cn(
                      " mb-6 leading-relaxed",
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    Our smart contracts will be publicly audited before launch.
                    Full transparency, verifiable security.
                  </p>

                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ",
                      isDark
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    Audit pending — coming soon
                  </div>
                </div>

                <div
                  className={cn(
                    "p-6 rounded-2xl",
                    isDark ? "bg-neutral-800/50" : "bg-neutral-50"
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <p
                        className={cn(
                          "text-xs  uppercase tracking-wider mb-1",
                          "text-neutral-500"
                        )}
                      >
                        Contract Address
                      </p>
                      <p
                        className={cn(
                          "font-mono text-sm",
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        )}
                      >
                        To be announced
                      </p>
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-xs  uppercase tracking-wider mb-1",
                          "text-neutral-500"
                        )}
                      >
                        Audit Report
                      </p>
                      <p
                        className={cn(
                          "font-mono text-sm",
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        )}
                      >
                        To be announced
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      disabled
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm  font-medium cursor-not-allowed opacity-50",
                        isDark
                          ? "bg-neutral-700 text-neutral-400"
                          : "bg-neutral-200 text-neutral-500"
                      )}
                    >
                      View Audit
                    </button>
                    <button
                      disabled
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm  font-medium cursor-not-allowed opacity-50",
                        isDark
                          ? "bg-neutral-700 text-neutral-400"
                          : "bg-neutral-200 text-neutral-500"
                      )}
                    >
                      View Contract
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div
              className={cn(
                "rounded-3xl p-12 md:p-16 relative overflow-hidden",
                "bg-gradient-to-br from-koru-purple/20 via-transparent to-koru-lime/10",
                isDark
                  ? "border border-neutral-800"
                  : "border border-neutral-200"
              )}
            >
              <h2
                className={cn(
                  "text-3xl md:text-4xl  mb-4",
                  isDark ? "text-white" : "text-neutral-900"
                )}
              >
                Ready to get started?
              </h2>
              <p
                className={cn(
                  " text-lg mb-8 max-w-lg mx-auto",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                Discover experts waiting to help, or start earning by sharing
                your knowledge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-koru-purple text-white  font-medium shadow-lg shadow-koru-purple/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Discover
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="/appeals"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl  font-medium",
                    isDark
                      ? "bg-neutral-800 text-white border border-neutral-700"
                      : "bg-white text-neutral-900 border border-neutral-200"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Appeals
                </motion.a>
              </div>
            </div>
          </motion.section>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Icons
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
