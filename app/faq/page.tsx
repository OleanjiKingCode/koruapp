"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/icons";

type FAQCategory =
  | "All"
  | "Getting started"
  | "Summons"
  | "Payments"
  | "Refunds"
  | "Hosts"
  | "Safety"
  | "Account";

type FAQItem = {
  category: FAQCategory;
  question: string;
  answer: string;
  slug: string;
};

const FAQ_CATEGORIES: FAQCategory[] = [
  "All",
  "Getting started",
  "Summons",
  "Payments",
  "Refunds",
  "Hosts",
  "Safety",
  "Account",
];

const FAQS: FAQItem[] = [
  {
    category: "Getting started",
    question: "What is Kōru?",
    answer: "Kōru is a pay-for-attention platform that connects people who need answers (Seekers) with experts, creators, and thought leaders (Hosts). When you send a Summon, you pay upfront for a guaranteed response within a specified timeframe. If the Host doesn't respond in time, you get a full refund.",
    slug: "what-is-koru",
  },
  {
    category: "Getting started",
    question: "How does Kōru work?",
    answer: "Kōru works in three simple steps: 1) Browse or discover Hosts who are available to help, 2) Create a Summon with your question, set a deadline, and pay upfront, 3) Get a guaranteed response within the agreed timeframe or receive a full refund.",
    slug: "how-it-works",
  },
  {
    category: "Getting started",
    question: "What's the difference between a Host and a Seeker?",
    answer: "A Host is someone who offers their time and expertise on Kōru. They set their availability and prices, and earn money by responding to Summons. A Seeker is someone who needs answers or wants to connect with a Host. They pay upfront to send a Summon and get a guaranteed response. You can be both a Host and a Seeker on the platform.",
    slug: "host-vs-seeker",
  },
  {
    category: "Getting started",
    question: "Do I need to create an account?",
    answer: "Yes, you need to create an account to use Kōru. You can sign up by connecting your X (Twitter) account. This helps verify your identity and makes it easier to discover people you already follow.",
    slug: "create-account",
  },
  {
    category: "Summons",
    question: "What is a Summon?",
    answer: "A Summon is a paid request you send to a Host. It includes your question or request, a deadline for the response, and payment upfront. The Host is guaranteed to respond within the deadline, or you get a full refund.",
    slug: "what-is-summon",
  },
  {
    category: "Summons",
    question: "How do I create a good Summon?",
    answer: "A great Summon is clear, specific, and respectful. Include 2-4 sentences of context, ask one clear question, and explain what a successful response would look like. Avoid vague questions—be specific about what you need.",
    slug: "good-summon",
  },
  {
    category: "Summons",
    question: "Can I send a Summon to anyone?",
    answer: "You can only send Summons to people who are listed as available on Kōru. If someone isn't on the platform yet, you can create a public Summon to invite them. Once they join and accept, the Summon proceeds.",
    slug: "message-anyone",
  },
  {
    category: "Payments",
    question: "When am I charged for a Summon?",
    answer: "You're charged immediately when you send a Summon. Payment is required upfront so Hosts know the request is genuine and committed. The funds are held securely until the Summon is completed or refunded.",
    slug: "when-charged",
  },
  {
    category: "Payments",
    question: "What fees does Kōru charge?",
    answer: "Kōru charges a platform fee on each Summon to cover operational costs, payment processing, and platform development. Payment processors may also charge a small processing fee. You'll see a complete breakdown of all fees before you confirm payment.",
    slug: "platform-fee",
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "Kōru accepts major credit cards, debit cards, and digital payment methods. We also support cryptocurrency payments through various payment rails. The exact payment options available depend on your location.",
    slug: "payment-methods",
  },
  {
    category: "Refunds",
    question: "When am I eligible for a refund?",
    answer: "You're eligible for a full refund if: (1) The Host doesn't respond by the agreed deadline, (2) The Host declines your Summon, (3) The Host cancels the Summon, or (4) The Host fails to deliver what was promised. Refunds are processed automatically in most cases.",
    slug: "when-refund",
  },
  {
    category: "Refunds",
    question: "How long do refunds take to process?",
    answer: "Refunds are typically processed within 3-5 business days, though the exact timing depends on your payment method and bank. Credit card refunds usually appear within 5-7 business days.",
    slug: "refund-timing",
  },
  {
    category: "Refunds",
    question: "What if I'm not satisfied with the Host's response?",
    answer: "Kōru guarantees that Hosts respond within the deadline and deliver what was promised. However, we don't offer refunds based on subjective satisfaction with advice quality or opinions. If a Host clearly didn't fulfill their commitment, you can request a review by contacting support.",
    slug: "low-quality-reply",
  },
  {
    category: "Hosts",
    question: "How do I become a Host?",
    answer: "Anyone can become a Host on Kōru! Simply set your availability, choose your pricing for different types of Summons (messages vs. calls), and start accepting requests. You can customize your profile and set response time preferences.",
    slug: "become-host",
  },
  {
    category: "Hosts",
    question: "How should I set my prices?",
    answer: "Set prices that reflect the value of your time and expertise. Consider: your expertise level, typical response time, demand for your knowledge, and market rates. You can set different prices for message replies vs. scheduled calls. Start with a price you're comfortable with and adjust based on demand.",
    slug: "host-pricing",
  },
  {
    category: "Hosts",
    question: "Can I decline a Summon?",
    answer: "Yes, you can decline any Summon for any reason. When you decline, the Seeker is automatically refunded in full and notified. Common reasons to decline include: the question is outside your expertise, the request is inappropriate, or you're unavailable. There's no penalty for declining Summons.",
    slug: "hosts-refuse",
  },
  {
    category: "Safety",
    question: "How does Kōru prevent scams and impersonation?",
    answer: "Kōru uses multiple verification methods: X (Twitter) account verification, profile verification badges, payment verification, and automated fraud detection. Users who impersonate others or engage in fraudulent activity are immediately removed.",
    slug: "prevent-scams",
  },
  {
    category: "Safety",
    question: "How do I report abuse or inappropriate behavior?",
    answer: "You can report abuse directly from any Summon or profile using the 'Report' button. For urgent safety concerns or threats, contact support immediately and consider reporting to local authorities. All reports are reviewed by our safety team.",
    slug: "report-abuse",
  },
  {
    category: "Account",
    question: "I paid for a Summon but can't see it. What should I do?",
    answer: "First, check your Summons page and activity history. You should also receive an email confirmation with a transaction ID. If you still can't find it, contact support with your transaction ID or the email address you used.",
    slug: "cant-see-summon",
  },
  {
    category: "Account",
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account at any time from your account settings. When you delete your account, your profile, messages, and personal data are removed. However, some information may be retained for legal or compliance reasons (like payment records for tax purposes).",
    slug: "delete-account",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return FAQS.filter((faq) => {
      const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (hash) {
      const matched = FAQS.find((faq) => faq.slug === hash);
      if (matched) {
        setActiveCategory(matched.category);
        setExpandedSlug(matched.slug);
        setTimeout(() => {
          document.getElementById(matched.slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, []);

  const toggleFaq = (slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-foreground mb-4">FAQ</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Kōru
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for answers..."
              className="h-14 pl-12 text-base rounded-2xl border-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {FAQ_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                    isActive
                      ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                      : "bg-white/60 dark:bg-neutral-900/60 text-foreground/70 hover:bg-white/80 dark:hover:bg-neutral-900/80 border border-white/20 dark:border-neutral-800"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No results found</p>
              <p className="text-sm text-muted-foreground">Try a different search term or category</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredFaqs.map((faq) => {
                const isOpen = expandedSlug === faq.slug;
                return (
                  <motion.div
                    key={faq.slug}
                    id={faq.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleFaq(faq.slug)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-white/40 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-medium text-koru-purple px-2.5 py-1 rounded-full bg-koru-purple/10">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                      </div>
                      <div className="shrink-0">
                        {isOpen ? (
                          <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-0">
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-br from-koru-purple/10 via-koru-golden/5 to-koru-lime/10 rounded-3xl p-8 border border-white/20 dark:border-neutral-800">
            <h2 className="text-2xl font-bold text-foreground mb-3">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? We're here to help.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
