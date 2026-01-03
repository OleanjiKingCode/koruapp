"use client";

import { useState, Suspense } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function ContactForm() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const source = searchParams.get("source");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: type === "refund-dispute" ? "Refund Dispute" : "",
    message: type === "refund-dispute" 
      ? "I would like to dispute a refund. Please provide:\n- Summon ID or transaction ID\n- Date of the Summon\n- Reason for dispute\n\nDetails:\n"
      : "",
    category: type || "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "refund-dispute", label: "Refund Dispute" },
    { value: "technical", label: "Technical Issue" },
    { value: "account", label: "Account Issue" },
    { value: "safety", label: "Safety Concern" },
    { value: "feature-request", label: "Feature Request" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen pb-[500px] sm:pb-96">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-koru-purple/20 mx-auto">
              <svg
                className="w-8 h-8 text-koru-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Message sent!
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              We'll get back to you as soon as possible, usually within 24 hours.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
              <Button asChild>
                <Link href="/faq">View FAQ</Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-foreground">Contact Support</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a question or need help? We're here for you. Most inquiries get a response within 24 hours.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your name"
                    className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={cn(
                    "w-full h-11 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 text-base",
                    "focus:border-koru-purple focus:ring-2 focus:ring-koru-purple/20",
                    "transition-all"
                  )}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <Input
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Brief subject line"
                  className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={8}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tell us how we can help..."
                  className={cn(
                    "w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-base",
                    "focus:border-koru-purple focus:ring-2 focus:ring-koru-purple/20",
                    "transition-all resize-none"
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Need quick answers? Check out our{" "}
                  <Link href="/faq" className="text-koru-purple hover:underline">
                    FAQ page
                  </Link>
                  .
                </p>
                <Button type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-6 border border-white/20 dark:border-neutral-800">
            <h3 className="text-lg font-semibold text-foreground mb-4">Other ways to get help</h3>
            <Link
              href="/faq"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <div className="rounded-full bg-koru-purple/10 p-2">
                <svg className="w-5 h-5 text-koru-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">FAQ</p>
                <p className="text-sm text-muted-foreground">Find quick answers</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    }>
      <ContactForm />
    </Suspense>
  );
}
