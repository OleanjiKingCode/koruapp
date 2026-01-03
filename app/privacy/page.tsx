"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (hash) {
      setActiveSection(hash);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

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
            <h1 className="text-5xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              At Kōru, we take your privacy seriously. This policy explains how we collect, use, protect, and share your information when you use our platform.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <section id="overview" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Overview</h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                Kōru ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and services (collectively, the "Service").
              </p>
              <p className="text-foreground/90 leading-relaxed">
                By using Kōru, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            <section id="data-collection" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Information You Provide</h3>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We collect information that you voluntarily provide when you create an account, use the Service, make payments, contact us, or set preferences. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                <li>Account information (name, email, X/Twitter profile data, profile photo, bio)</li>
                <li>Summon content, messages, questions, and responses</li>
                <li>Payment method information (processed securely by third-party processors)</li>
                <li>Support requests and communications</li>
                <li>Notification and privacy preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Automatically Collected Information</h3>
              <p className="text-foreground/90 leading-relaxed mb-4">
                When you use Kōru, we automatically collect certain information about your device and usage:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Device information (browser type, operating system, device type)</li>
                <li>Usage data (pages visited, features used, time spent, interactions)</li>
                <li>Location data (general location based on IP address, country/region level)</li>
                <li>Log data (IP address, access times, error logs, performance data)</li>
                <li>Cookies and tracking technologies (see Cookie Policy section)</li>
              </ul>
            </section>

            <section id="data-use" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Provide and operate the Service (process Summons, facilitate communication, process payments)</li>
                <li>Manage your account (create and maintain accounts, authenticate users, manage preferences)</li>
                <li>Process payments (handle transactions, process refunds, manage payouts)</li>
                <li>Communicate with you (send service-related notifications, respond to support requests)</li>
                <li>Improve the Service (analyze usage patterns, identify bugs, optimize performance, develop features)</li>
                <li>Ensure safety and security (detect and prevent fraud, abuse, spam, harmful activity)</li>
                <li>Comply with legal obligations (meet legal requirements, respond to legal requests, protect rights)</li>
                <li>Marketing (with consent: send promotional communications, newsletters, feature updates)</li>
              </ul>
            </section>

            <section id="data-sharing" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. How We Share Your Information</h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">With Other Users</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                <li>Your profile information (name, bio, photo) is visible to other users</li>
                <li>Summon content and messages are shared with the Host or Seeker involved</li>
                <li>Public Summons may be visible on your profile and shared publicly</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">With Service Providers</h3>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We work with trusted third-party service providers who help us operate the Service (payment processors, hosting providers, analytics providers, email services, security services). These providers are contractually obligated to protect your information and use it only for the purposes we specify.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Legal Requirements</h3>
              <p className="text-foreground/90 leading-relaxed">
                We may disclose your information if required by law or to comply with legal processes, protect our rights and safety, investigate potential violations, or prevent fraud or illegal activity.
              </p>
            </section>

            <section id="data-security" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-4">
                <li>Encryption: Data in transit is encrypted using TLS/SSL, and sensitive data at rest is encrypted</li>
                <li>Access controls: Limited access to personal information on a need-to-know basis</li>
                <li>Secure payment processing: Payment information is processed by PCI-compliant payment processors</li>
                <li>Regular security audits: We conduct regular security assessments and updates</li>
                <li>Incident response: We have procedures in place to respond to security incidents</li>
              </ul>
              <p className="text-foreground/90 leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. Please use strong passwords and keep your account credentials secure.
              </p>
            </section>

            <section id="cookies" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Types of Cookies</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                <li><strong>Necessary cookies:</strong> Required for the Service to function (authentication, security, session management). These cannot be disabled.</li>
                <li><strong>Analytics cookies:</strong> Help us understand how you use the Service (with your consent). These are optional.</li>
                <li><strong>Marketing cookies:</strong> Used to deliver personalized ads and track campaign performance (with your consent). These are optional.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Managing Cookies</h3>
              <p className="text-foreground/90 leading-relaxed">
                You can manage your cookie preferences at any time through your account settings or by using our cookie consent banner. You can also control cookies through your browser settings, though disabling necessary cookies may affect Service functionality.
              </p>
            </section>

            <section id="your-rights" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Privacy Rights</h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                <li>Access: Request a copy of the personal information we hold about you</li>
                <li>Correction: Request correction of inaccurate or incomplete information</li>
                <li>Deletion: Request deletion of your personal information (subject to legal retention requirements)</li>
                <li>Portability: Request transfer of your data to another service</li>
                <li>Objection: Object to processing of your information for certain purposes</li>
                <li>Restriction: Request restriction of processing in certain circumstances</li>
                <li>Withdraw consent: Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-foreground/90 leading-relaxed">
                To exercise these rights, please contact us at <Link href="/contact" className="text-koru-purple hover:underline">support</Link>. We will respond to your request within 30 days, subject to applicable law.
              </p>
            </section>

            <section id="data-retention" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Retention</h2>
              <p className="text-foreground/90 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and protect our legitimate business interests.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or accounting purposes (such as payment records for tax compliance). Some information may remain in backup systems for a limited time.
              </p>
            </section>

            <section id="children" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
              <p className="text-foreground/90 leading-relaxed">
                Kōru is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child under 18, please contact us immediately, and we will take steps to delete that information.
              </p>
            </section>

            <section id="international" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Data Transfers</h2>
              <p className="text-foreground/90 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy, including standard contractual clauses and other legal mechanisms.
              </p>
            </section>

            <section id="changes" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-foreground/90 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date. We may also notify you via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section id="contact" className="bg-white/60 dark:bg-neutral-900/60 rounded-2xl p-8 border border-white/20 dark:border-neutral-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
              <p className="text-foreground/90 leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at <Link href="/contact" className="text-koru-purple hover:underline">support</Link>. We're committed to addressing your privacy concerns promptly and transparently.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-white/20 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Questions about privacy?
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("koru-open-cookie-preferences"));
                    }
                  }}
                >
                  Cookie Preferences
                </Button>
                <Button asChild variant="outline">
                  <Link href="/faq">View FAQ</Link>
                </Button>
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
