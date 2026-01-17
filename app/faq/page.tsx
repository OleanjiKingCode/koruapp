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
  | "Smart Contract"
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
  "Smart Contract",
  "Refunds",
  "Hosts",
  "Safety",
  "Account",
];

const FAQS: FAQItem[] = [
  {
    category: "Getting started",
    question: "What is Kōru?",
    answer:
      "Kōru is a platform that helps you get the attention of experts, creators, and thought leaders you want to connect with. Use Summons to publicly show how much you'd pay to bring someone to the platform, or directly message Hosts who are already here.",
    slug: "what-is-koru",
  },
  {
    category: "Getting started",
    question: "How does Kōru work?",
    answer:
      "Kōru works in two ways: 1) If someone is already on Kōru, search for them in Discover and message them directly. 2) If they're NOT on Kōru yet, create a Summon to publicly pledge how much you'd pay to bring them here. Others can back your Summon to increase the total pledge and get their attention.",
    slug: "how-it-works",
  },
  {
    category: "Getting started",
    question: "What's the difference between a Host and a Seeker?",
    answer:
      "A Host is someone who has joined Kōru and is available to receive paid messages. A Seeker is someone looking to connect with others. You can be both! If the person you want isn't on Kōru, you become a Summoner instead—creating a public pledge to attract them to the platform.",
    slug: "host-vs-seeker",
  },
  {
    category: "Getting started",
    question: "Do I need to create an account?",
    answer:
      "Yes, you need to create an account to use Kōru. You can sign up by connecting your X (Twitter) account. This helps verify your identity and makes it easier to discover people you already follow.",
    slug: "create-account",
  },
  {
    category: "Getting started",
    question: "How do I find someone on Kōru?",
    answer:
      "Use the Discover page to search for anyone by their name or X (Twitter) handle. If they're already on Kōru, you can message them directly. If they're not on Kōru yet, you'll see an option to create a Summon to bring them to the platform.",
    slug: "find-someone",
  },
  {
    category: "Summons",
    question: "What is a Summon?",
    answer:
      "A Summon is a PUBLIC pledge to bring someone to Kōru who isn't on the platform yet. It's NOT a paid request—you're simply stating how much you WOULD pay if they join. Think of it as a community-driven way to get the attention of people you want to connect with.",
    slug: "what-is-summon",
  },
  {
    category: "Summons",
    question: "Do I pay when I create a Summon?",
    answer:
      "No! Creating a Summon does NOT charge you anything upfront. You're only pledging how much you WOULD pay if the person joins Kōru. Payment only happens later if/when the person joins and you choose to engage with them directly.",
    slug: "summon-payment",
  },
  {
    category: "Summons",
    question: "How do Summons help bring people to Kōru?",
    answer:
      "Summons create social proof. When many people pledge money to bring someone to the platform, it shows that person they have an engaged audience willing to pay for their attention. The total pledged amount is visible publicly, creating incentive for them to join.",
    slug: "summon-purpose",
  },
  {
    category: "Summons",
    question: "Can I back someone else's Summon?",
    answer:
      "Yes! If someone has already created a Summon for a person you want on Kōru, you can 'back' it by adding your own pledge. This increases the total amount and makes it more likely the person will notice and join.",
    slug: "back-summon",
  },
  {
    category: "Summons",
    question: "When should I create a Summon vs. message directly?",
    answer:
      "Search for the person on the Discover page first. If they're already on Kōru, message them directly—no Summon needed! Only create a Summon if they're NOT on the platform yet and you want to help bring them here.",
    slug: "summon-vs-message",
  },
  {
    category: "Payments",
    question: "When am I actually charged?",
    answer:
      "You're only charged when you initiate a direct engagement with a Host who is on Kōru. This happens through our secure escrow smart contract. Summon pledges are NOT charged—they're just public commitments.",
    slug: "when-charged",
  },
  {
    category: "Payments",
    question: "What fees does Kōru charge?",
    answer:
      "Kōru charges a small platform fee (up to 10%) on completed transactions to cover operational costs and platform development. You'll see a complete breakdown of all fees before you confirm any payment. The fee is only charged when funds are successfully released to a Host.",
    slug: "platform-fee",
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer:
      "Kōru uses USDC (a stablecoin pegged to USD) for all transactions. This ensures fast, secure, and transparent payments through our smart contract. You'll need a crypto wallet with USDC to make payments on the platform.",
    slug: "payment-methods",
  },
  {
    category: "Smart Contract",
    question: "How does the Kōru escrow smart contract work?",
    answer:
      "When you pay to message a Host, your USDC is deposited into our secure escrow smart contract—not directly to the Host. The funds are held safely until the engagement is complete. This protects both parties: Seekers know their money is safe, and Hosts know the payment is real.",
    slug: "escrow-basics",
  },
  {
    category: "Smart Contract",
    question: "What is the 24-hour accept window?",
    answer:
      "When you create an escrow (initiate a paid message), the Host has 24 hours to accept. If they don't accept within this window, you can reclaim your full deposit automatically through the smart contract. No fees are charged if the Host doesn't accept.",
    slug: "accept-window",
  },
  {
    category: "Smart Contract",
    question: "What is the 48-hour dispute window?",
    answer:
      "After a Host accepts your request, you have 48 hours to review their response and either release the funds or raise a dispute. If you're satisfied, release the funds. If there's an issue, you can dispute within this window for resolution.",
    slug: "dispute-window",
  },
  {
    category: "Smart Contract",
    question: "What happens after the dispute window ends?",
    answer:
      "If you don't dispute within 48 hours of the Host accepting, the funds are automatically available for the Host to withdraw (minus platform fees). This ensures Hosts get paid promptly for their work while giving Seekers time to review.",
    slug: "auto-release",
  },
  {
    category: "Smart Contract",
    question: "How are disputes resolved?",
    answer:
      "If you raise a dispute within the 48-hour window, the funds are locked until the Kōru team reviews the case. We look at the original request, the Host's response, and determine a fair resolution. Funds can be returned to the Seeker, released to the Host, or split.",
    slug: "dispute-resolution",
  },
  {
    category: "Smart Contract",
    question: "Is the smart contract secure?",
    answer:
      "Yes! Our escrow contract is built with industry-standard security practices: it's non-upgradeable (immutable), uses OpenZeppelin's audited libraries, includes reentrancy protection, and has emergency pause functionality. The contract code is open source and verifiable on-chain.",
    slug: "contract-security",
  },
  {
    category: "Refunds",
    question: "When am I eligible for a refund?",
    answer:
      "You're eligible for a full refund if: (1) The Host doesn't accept within 24 hours—you can reclaim automatically, (2) You raise a valid dispute within 48 hours of acceptance, (3) The Host fails to deliver what was promised. Refunds through the smart contract are instant.",
    slug: "when-refund",
  },
  {
    category: "Refunds",
    question: "How long do refunds take to process?",
    answer:
      "Smart contract refunds are instant! When you reclaim funds (Host didn't accept) or win a dispute, the USDC is immediately available in your wallet. No waiting for banks or payment processors.",
    slug: "refund-timing",
  },
  {
    category: "Refunds",
    question: "What if I'm not satisfied with the Host's response?",
    answer:
      "If a Host doesn't deliver what was promised, raise a dispute within the 48-hour window. Our team will review the case. However, we don't offer refunds based on subjective satisfaction—disputes are for clear failures to deliver, not opinion differences.",
    slug: "low-quality-reply",
  },
  {
    category: "Hosts",
    question: "How do I become a Host?",
    answer:
      "Anyone can become a Host on Kōru! Simply set your availability, choose your pricing for different types of Summons (messages vs. calls), and start accepting requests. You can customize your profile and set response time preferences.",
    slug: "become-host",
  },
  {
    category: "Hosts",
    question: "How should I set my prices?",
    answer:
      "Set prices that reflect the value of your time and expertise. Consider: your expertise level, typical response time, demand for your knowledge, and market rates. You can set different prices for message replies vs. scheduled calls. Start with a price you're comfortable with and adjust based on demand.",
    slug: "host-pricing",
  },
  {
    category: "Hosts",
    question: "Can I decline a Summon?",
    answer:
      "Yes, you can decline any Summon for any reason. When you decline, the Seeker is automatically refunded in full and notified. Common reasons to decline include: the question is outside your expertise, the request is inappropriate, or you're unavailable. There's no penalty for declining Summons.",
    slug: "hosts-refuse",
  },
  {
    category: "Safety",
    question: "How does Kōru prevent scams and impersonation?",
    answer:
      "Kōru uses multiple verification methods: X (Twitter) account verification, profile verification badges, payment verification, and automated fraud detection. Users who impersonate others or engage in fraudulent activity are immediately removed.",
    slug: "prevent-scams",
  },
  {
    category: "Safety",
    question: "How do I report abuse or inappropriate behavior?",
    answer:
      "You can report abuse directly from any Summon or profile using the 'Report' button. For urgent safety concerns or threats, contact support immediately and consider reporting to local authorities. All reports are reviewed by our safety team.",
    slug: "report-abuse",
  },
  {
    category: "Account",
    question: "I paid for a Summon but can't see it. What should I do?",
    answer:
      "First, check your Summons page and activity history. You should also receive an email confirmation with a transaction ID. If you still can't find it, contact support with your transaction ID or the email address you used.",
    slug: "cant-see-summon",
  },
  {
    category: "Account",
    question: "Can I delete my account?",
    answer:
      "Yes, you can delete your account at any time from your account settings. When you delete your account, your profile, messages, and personal data are removed. However, some information may be retained for legal or compliance reasons (like payment records for tax purposes).",
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
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    const hash =
      typeof window !== "undefined"
        ? window.location.hash.replace("#", "")
        : "";
    if (hash) {
      const matched = FAQS.find((faq) => faq.slug === hash);
      if (matched) {
        setActiveCategory(matched.category);
        setExpandedSlug(matched.slug);
        setTimeout(() => {
          document
            .getElementById(matched.slug)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
              <p className="text-lg text-muted-foreground mb-4">
                No results found
              </p>
              <p className="text-sm text-muted-foreground">
                Try a different search term or category
              </p>
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
                        <h3 className="text-lg font-semibold text-foreground">
                          {faq.question}
                        </h3>
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
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
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
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Still need help?
            </h2>
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
