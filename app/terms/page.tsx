"use client";

import Link from "next/link";
import { motion } from "motion/react";

const LAST_UPDATED = "February 25, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Koru ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform. We may update these terms from time to time, and continued use of Koru after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years old to use Koru. By creating an account, you represent and warrant that you meet this age requirement and that all information you provide is accurate, current, and complete.`,
  },
  {
    title: "3. Account Registration",
    content: `To use Koru, you must create an account by connecting your X (Twitter) account. You are responsible for maintaining the security of your account and all activity that occurs under it. You agree not to share your account credentials or let others access your account. Notify us immediately of any unauthorized access.`,
  },
  {
    title: "4. How Koru Works",
    content: `Koru is a marketplace that connects Seekers with Hosts (experts, creators, and thought leaders) through paid conversations. The Platform facilitates discovery, Summons (public pledges to bring people to the platform), and direct paid messaging.`,
  },
  {
    title: "5. Summons",
    content: `A Summon is a public, non-binding pledge indicating how much you would pay to connect with someone not yet on the Platform. Creating or backing a Summon does not charge you. Payment only occurs when you engage directly with a Host through the Platform's escrow system. Summons are public and visible to all users.`,
  },
  {
    title: "6. Payments and Escrow",
    content: `All payments on Koru are made in USDC through our smart contract escrow system. When you pay to message a Host, funds are held in escrow until the engagement is completed. The Host has until 24 hours after the session date to accept. If the Host does not accept within this window, you may reclaim your full deposit. After acceptance, you have a 48-hour dispute window to review the response.`,
  },
  {
    title: "7. Fees",
    content: `Koru charges a platform fee of up to 10% on completed transactions. This fee is deducted from the payment when funds are released to the Host. All fees are clearly displayed before you confirm any payment. No fees are charged if a Host does not accept or if you successfully reclaim your deposit.`,
  },
  {
    title: "8. Refunds and Disputes",
    content: `You are eligible for a refund if: (a) the Host does not accept within the acceptance window — you may reclaim automatically via the smart contract; (b) you raise a valid dispute within 48 hours of Host acceptance; or (c) the Host fails to deliver what was promised. Disputes are reviewed by the Koru team and resolved based on the original request and the Host's response. Refunds processed through the smart contract are instant.`,
  },
  {
    title: "9. User Conduct",
    content: `You agree not to: (a) use the Platform for any unlawful purpose; (b) impersonate another person or entity; (c) harass, abuse, or threaten other users; (d) post spam, misleading, or inappropriate content; (e) attempt to manipulate the escrow system or exploit vulnerabilities; (f) scrape, crawl, or use automated tools to access the Platform without permission; (g) interfere with the Platform's operations or other users' experience.`,
  },
  {
    title: "10. Intellectual Property",
    content: `All content, branding, and technology on Koru are owned by Koru or its licensors. You retain ownership of content you create on the Platform but grant Koru a non-exclusive, worldwide license to display and distribute your content in connection with the Platform's services. You may not copy, modify, or distribute Koru's proprietary materials without written permission.`,
  },
  {
    title: "11. Host Responsibilities",
    content: `If you are a Host, you agree to: (a) provide accurate information about your expertise and availability; (b) respond to accepted requests in a timely and professional manner; (c) set fair pricing that reflects the value of your time; (d) comply with all applicable laws and regulations. Koru reserves the right to remove Hosts who consistently fail to deliver or violate these terms.`,
  },
  {
    title: "12. Disclaimer of Warranties",
    content: `Koru is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee the quality, accuracy, or reliability of any Host's responses. We do not endorse or verify the credentials of any user. Use the Platform at your own risk.`,
  },
  {
    title: "13. Limitation of Liability",
    content: `To the maximum extent permitted by law, Koru and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of profits, data, or goodwill. Our total liability shall not exceed the amount you have paid to Koru in the 12 months preceding the claim.`,
  },
  {
    title: "14. Privacy",
    content: `Your use of Koru is also governed by our Privacy Policy. By using the Platform, you consent to the collection and use of your information as described in the Privacy Policy.`,
  },
  {
    title: "15. Termination",
    content: `We may suspend or terminate your account at any time for violation of these terms or for any reason at our discretion. You may delete your account at any time from your account settings. Upon termination, any pending escrow transactions will be resolved according to the escrow terms. Provisions that by their nature should survive termination (including limitations of liability and dispute resolution) will remain in effect.`,
  },
  {
    title: "16. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these terms or your use of the Platform shall be resolved through binding arbitration, except where prohibited by law.`,
  },
  {
    title: "17. Contact",
    content: `If you have any questions about these Terms of Service, please contact us at pingkoru@gmail.com or through our Contact page.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-neutral-800 p-6 sm:p-8 mb-8 shadow-sm"
        >
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Koru. These Terms of Service govern your access to and
            use of the Koru platform, including our website, services, and smart
            contract escrow system. Please read these terms carefully before
            using the Platform.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.03 }}
              className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-neutral-800 p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-br from-koru-purple/10 via-koru-golden/5 to-koru-lime/10 rounded-3xl p-8 border border-white/20 dark:border-neutral-800">
            <p className="text-muted-foreground mb-4">
              Have questions about our terms?
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              <Link
                href="/contact"
                className="text-koru-purple hover:underline font-medium"
              >
                Contact Us
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link
                href="/privacy"
                className="text-koru-purple hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link
                href="/faq"
                className="text-koru-purple hover:underline font-medium"
              >
                FAQ
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
