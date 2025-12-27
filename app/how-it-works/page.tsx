"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Timeline } from "@/components/ui/timeline";
import { GlowingEffect } from "@/components/ui/glowing-effect";

type Persona = "seeker" | "host";

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

  // Timeline data for Seeker journey
  const seekerTimelineData = [
    {
      title: "Discover",
      content: (
        <div>
          <p className="text-koru-purple font-semibold text-sm mb-2">
            Find the right person
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Search and browse experts by topic, check their bio, rates, and
            credibility signals to find the perfect match for your needs.
          </p>
          <div className="flex flex-wrap gap-3">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm",
                isDark
                  ? "bg-neutral-800 text-neutral-300"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <SearchIcon className="w-4 h-4 text-koru-purple" />
              Browse by topic
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm",
                isDark
                  ? "bg-neutral-800 text-neutral-300"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <StarIcon className="w-4 h-4 text-koru-golden" />
              Check ratings
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm",
                isDark
                  ? "bg-neutral-800 text-neutral-300"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <UserIcon className="w-4 h-4 text-koru-lime" />
              View profiles
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Book & Pay",
      content: (
        <div>
          <p className="text-koru-golden font-semibold text-sm mb-2">
            Secure your session
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Pick an available slot, submit a clear request, and pay upfront.
            Your funds are held safely until the session completes.
          </p>
          <div
            className={cn(
              "p-4 rounded-2xl border",
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-koru-golden/20 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-koru-golden" />
              </div>
              <div>
                <p
                  className={cn(
                    "font-semibold text-sm",
                    isDark ? "text-white" : "text-neutral-900"
                  )}
                >
                  Select a time slot
                </p>
                <p
                  className={cn(
                    "text-xs",
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  )}
                >
                  Choose from available times
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-koru-lime/20 flex items-center justify-center">
                <LockIcon className="w-5 h-5 text-koru-lime" />
              </div>
              <div>
                <p
                  className={cn(
                    "font-semibold text-sm",
                    isDark ? "text-white" : "text-neutral-900"
                  )}
                >
                  Payment held in escrow
                </p>
                <p
                  className={cn(
                    "text-xs",
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  )}
                >
                  Safe until session completes
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Connect",
      content: (
        <div>
          <p className="text-koru-lime font-semibold text-sm mb-2">
            Get direct answers
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Join the call at the scheduled time. Get personalized advice,
            feedback, and clarity from your chosen expert.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div
              className={cn(
                "p-3 rounded-xl text-center",
                isDark ? "bg-neutral-800" : "bg-neutral-100"
              )}
            >
              <VideoIcon className="w-6 h-6 mx-auto mb-2 text-koru-purple" />
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                Video calls
              </p>
            </div>
            <div
              className={cn(
                "p-3 rounded-xl text-center",
                isDark ? "bg-neutral-800" : "bg-neutral-100"
              )}
            >
              <ChatBubbleIcon className="w-6 h-6 mx-auto mb-2 text-koru-golden" />
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                Messaging
              </p>
            </div>
            <div
              className={cn(
                "p-3 rounded-xl text-center",
                isDark ? "bg-neutral-800" : "bg-neutral-100"
              )}
            >
              <DocumentIcon className="w-6 h-6 mx-auto mb-2 text-koru-lime" />
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                File sharing
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Settle",
      content: (
        <div>
          <p className="text-koru-purple font-semibold text-sm mb-2">
            Guaranteed outcome
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Payment releases to host after completion. If they miss the session,
            you get an automatic refund. Zero risk.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-koru-lime flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-neutral-900" />
              </div>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                Session completed → Payment released
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-koru-golden flex items-center justify-center">
                <RefundIcon className="w-4 h-4 text-neutral-900" />
              </div>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                No-show → Automatic refund
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Timeline data for Host journey
  const hostTimelineData = [
    {
      title: "Create",
      content: (
        <div>
          <p className="text-koru-lime font-semibold text-sm mb-2">
            Set up your listing
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Define your topics, set your price and availability. Keep
            expectations clear for better sessions.
          </p>
          <div className="flex flex-wrap gap-3">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm",
                isDark
                  ? "bg-neutral-800 text-neutral-300"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <TagIcon className="w-4 h-4 text-koru-lime" />
              Set your rate
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm",
                isDark
                  ? "bg-neutral-800 text-neutral-300"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <CalendarIcon className="w-4 h-4 text-koru-golden" />
              Define availability
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm",
                isDark
                  ? "bg-neutral-800 text-neutral-300"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <SparkleIcon className="w-4 h-4 text-koru-purple" />
              Add expertise
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Accept",
      content: (
        <div>
          <p className="text-koru-golden font-semibold text-sm mb-2">
            Get booking requests
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Receive contextual booking requests, confirm slots, and prepare for
            asks with less back-and-forth.
          </p>
          <div
            className={cn(
              "p-4 rounded-2xl border",
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className={cn(
                  "font-semibold text-sm",
                  isDark ? "text-white" : "text-neutral-900"
                )}
              >
                New Request
              </p>
              <span className="px-2 py-1 text-xs rounded-full bg-koru-golden/20 text-koru-golden">
                Pending
              </span>
            </div>
            <p
              className={cn(
                "text-xs mb-3",
                isDark ? "text-neutral-400" : "text-neutral-500"
              )}
            >
              "I'd love to discuss scaling strategies for my Web3 startup..."
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 px-3 text-xs rounded-xl bg-koru-lime text-neutral-900 font-medium">
                Accept
              </button>
              <button
                className={cn(
                  "flex-1 py-2 px-3 text-xs rounded-xl font-medium",
                  isDark
                    ? "bg-neutral-800 text-neutral-300"
                    : "bg-neutral-200 text-neutral-600"
                )}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Deliver",
      content: (
        <div>
          <p className="text-koru-purple font-semibold text-sm mb-2">
            Provide value
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Show up and give real value. Build reputation through reviews and
            grow your presence on the platform.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-koru-purple/20 flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-koru-purple" />
              </div>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                Join on time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-koru-purple/20 flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-koru-purple" />
              </div>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                Share your expertise
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-koru-purple/20 flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-koru-purple" />
              </div>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                Earn great reviews
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Earn",
      content: (
        <div>
          <p className="text-koru-lime font-semibold text-sm mb-2">
            Get paid seamlessly
          </p>
          <p
            className={cn(
              "mb-6 text-sm md:text-base leading-relaxed",
              isDark ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            Payment releases automatically after successful completion. No
            chasing, clean predictable earnings.
          </p>
          <div
            className={cn(
              "p-4 rounded-2xl border",
              isDark
                ? "bg-neutral-900 border-koru-lime/30"
                : "bg-koru-lime/10 border-koru-lime/30"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    "text-xs",
                    isDark ? "text-neutral-400" : "text-neutral-500"
                  )}
                >
                  Session completed
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-neutral-900"
                  )}
                >
                  +$150.00
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-koru-lime/20 flex items-center justify-center">
                <DollarIcon className="w-6 h-6 text-koru-lime" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentTimelineData =
    activePersona === "seeker" ? seekerTimelineData : hostTimelineData;

  return (
    <>
      <div className="min-h-screen pb-[500px] sm:pb-96">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1
              className={cn(
                "text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight",
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
                "text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed",
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
            className="mb-8"
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
                        "relative flex items-center gap-3 px-6 sm:px-8 py-4 rounded-xl transition-all duration-300 cursor-pointer",
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

          {/* Timeline Section */}
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
                className="relative overflow-clip"
              >
                <Timeline data={currentTimelineData} />
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
                  "text-3xl md:text-4xl mb-4",
                  isDark ? "text-white" : "text-neutral-900"
                )}
              >
                Built-in Trust
              </h2>
              <p
                className={cn(
                  "text-lg max-w-xl mx-auto",
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
                    className="relative min-h-[10rem]"
                  >
                    <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-neutral-200 dark:border-neutral-800 p-2">
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={3}
                      />
                      <div
                        className={cn(
                          "relative flex h-full flex-col gap-4 rounded-xl border-[0.75px] p-6 shadow-sm",
                          isDark
                            ? "bg-neutral-900 border-neutral-800 shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]"
                            : "bg-white border-neutral-200"
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
                              "text-lg font-semibold mb-2",
                              isDark ? "text-white" : "text-neutral-900"
                            )}
                          >
                            {feature.title}
                          </h3>
                          <p
                            className={cn(
                              "text-sm leading-relaxed",
                              isDark ? "text-neutral-400" : "text-neutral-600"
                            )}
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>
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
            <div className="relative rounded-[1.5rem] border-[0.75px] border-neutral-200 dark:border-neutral-800 p-3">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
              />
              <div
                className={cn(
                  "relative rounded-2xl p-8 md:p-12 overflow-hidden shadow-sm",
                  isDark
                    ? "bg-neutral-900 border-[0.75px] border-neutral-800 shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]"
                    : "bg-white border-[0.75px] border-neutral-200"
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
                          "text-2xl md:text-3xl font-semibold",
                          isDark ? "text-white" : "text-neutral-900"
                        )}
                      >
                        Contract & Audit
                      </h2>
                    </div>

                    <p
                      className={cn(
                        "mb-6 leading-relaxed",
                        isDark ? "text-neutral-400" : "text-neutral-600"
                      )}
                    >
                      Our smart contracts will be publicly audited before
                      launch. Full transparency, verifiable security.
                    </p>

                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm",
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
                            "text-xs uppercase tracking-wider mb-1",
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
                            "text-xs uppercase tracking-wider mb-1",
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
                          "flex-1 py-3 px-4 rounded-xl text-sm font-medium cursor-not-allowed opacity-50",
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
                          "flex-1 py-3 px-4 rounded-xl text-sm font-medium cursor-not-allowed opacity-50",
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
                  "text-3xl md:text-4xl mb-4",
                  isDark ? "text-white" : "text-neutral-900"
                )}
              >
                Ready to get started?
              </h2>
              <p
                className={cn(
                  "text-lg mb-8 max-w-lg mx-auto",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                Discover experts waiting to help, or start earning by sharing
                your knowledge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-koru-purple text-white font-medium shadow-lg shadow-koru-purple/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Discover
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="/appeals"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium",
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

function StarIcon({ className }: { className?: string }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
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
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function RefundIcon({ className }: { className?: string }) {
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
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
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
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
