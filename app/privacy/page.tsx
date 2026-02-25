"use client";

import Link from "next/link";
import { motion } from "motion/react";

const LAST_UPDATED = "February 25, 2026";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information in the following ways:

Account Information: When you sign up via X (Twitter) OAuth, we receive your Twitter ID, username, display name, profile image, bio, and follower/following counts. This is used to create and display your Koru profile.

Profile Data: Any additional information you choose to add to your profile, such as your location, tags, availability, pricing, and connected wallet addresses.

Usage Data: We collect information about how you use Koru, including pages visited, features used, Summons created or backed, messages sent, and interactions with other users.

Payment Data: Transaction records including amounts, dates, escrow status, and wallet addresses used for payments. We do not store private keys or wallet seed phrases.

Communications: Messages exchanged through the Platform between Seekers and Hosts, which are stored to facilitate the service and resolve disputes.

Device and Log Data: IP addresses, browser type, device information, and access timestamps for security and analytics purposes.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

- Provide, maintain, and improve the Koru platform
- Create and manage your account and profile
- Facilitate connections between Seekers and Hosts
- Process payments and manage the escrow system
- Send you service-related notifications (e.g., Summon updates, payment confirmations)
- Detect and prevent fraud, abuse, and security threats
- Analyze usage patterns to improve the user experience
- Comply with legal obligations
- Resolve disputes between users`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information. We may share your information in the following circumstances:

Public Profile: Your username, display name, profile image, bio, and Summons activity are publicly visible on the Platform.

Other Users: When you engage with a Host or Seeker, they can see your profile information and messages exchanged.

Service Providers: We use third-party services (Supabase for database, Vercel for hosting, RapidAPI for Twitter data) that process data on our behalf under strict data processing agreements.

Legal Requirements: We may disclose information if required by law, legal process, or government request, or to protect the rights, property, or safety of Koru, our users, or the public.

Business Transfers: In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.`,
  },
  {
    title: "4. Blockchain and Wallet Data",
    content: `Koru uses blockchain-based escrow for payments. Please be aware that:

- Wallet addresses you connect to Koru are stored in our database and may be visible to other users
- Blockchain transactions are public and permanently recorded on the Base network
- We cannot reverse or modify blockchain transactions once confirmed
- We do not have access to your wallet's private keys or seed phrases
- You are solely responsible for the security of your connected wallets`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide the service. After account deletion:

- Profile information and messages are removed from the Platform
- Transaction records may be retained for up to 7 years for legal and tax compliance
- Blockchain transaction records are permanent and cannot be deleted
- Anonymized usage data may be retained indefinitely for analytics
- Backup copies may persist for up to 30 days before being purged`,
  },
  {
    title: "6. Your Rights and Choices",
    content: `Depending on your location, you may have the following rights:

Access: Request a copy of the personal information we hold about you.
Correction: Request correction of inaccurate personal information.
Deletion: Request deletion of your account and personal data (subject to retention requirements).
Portability: Request your data in a machine-readable format.
Objection: Object to certain processing of your personal information.
Withdrawal of Consent: Withdraw consent where processing is based on consent.

To exercise these rights, contact us at pingkoru@gmail.com. We will respond within 30 days.`,
  },
  {
    title: "7. Cookies and Tracking",
    content: `Koru uses cookies and similar technologies for:

- Authentication and session management (essential)
- Remembering your preferences such as theme and unread counts (functional)
- Analytics to understand usage patterns via Vercel Analytics (performance)

We use localStorage to persist certain UI state (badges, unread counts, cookie consent preferences). You can manage cookie preferences through the cookie consent modal shown on your first visit.`,
  },
  {
    title: "8. Third-Party Services",
    content: `Koru integrates with third-party services that have their own privacy policies:

- X (Twitter): For authentication and profile data (twitter.com/en/privacy)
- Supabase: For database and real-time features (supabase.com/privacy)
- Vercel: For hosting and analytics (vercel.com/legal/privacy-policy)
- Privy: For wallet connection (privy.io/privacy)

We encourage you to review the privacy policies of these services.`,
  },
  {
    title: "9. Data Security",
    content: `We implement reasonable security measures to protect your information, including:

- HTTPS encryption for all data in transit
- Row-level security policies on our database
- Secure authentication via OAuth 2.0
- Smart contract security with reentrancy protection and pause functionality
- Regular security reviews

However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your data.`,
  },
  {
    title: "10. Children's Privacy",
    content: `Koru is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe a child under 18 has provided us with personal information, please contact us at pingkoru@gmail.com and we will delete the information.`,
  },
  {
    title: "11. International Data Transfers",
    content: `Koru operates globally and your data may be processed in countries other than your own. By using the Platform, you consent to the transfer of your information to countries that may have different data protection laws than your jurisdiction. We take steps to ensure your data is treated securely and in accordance with this Privacy Policy.`,
  },
  {
    title: "12. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Platform or sending you a notification. Continued use of Koru after changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically.`,
  },
  {
    title: "13. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:

Email: pingkoru@gmail.com
Contact Page: koruapp.xyz/contact`,
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
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
            At Koru, we take your privacy seriously. This Privacy Policy
            explains what information we collect, how we use it, and your rights
            regarding your personal data. By using Koru, you agree to the
            collection and use of information in accordance with this policy.
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
              Have questions about your data?
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
                href="/terms"
                className="text-koru-purple hover:underline font-medium"
              >
                Terms of Service
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
