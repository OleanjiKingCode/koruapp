"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 dark:border-white/10 dark:bg-white/5">
              <span className="h-2 w-2 rounded-full bg-koru-purple shadow-glow-purple" />
              Legal
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-muted-foreground">
              Please read these Terms of Service carefully before using Kōru. By using our platform, you agree to be bound by these terms.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/60 p-8 shadow-glow-purple backdrop-blur-xl dark:bg-white/5">
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you and Kōru ("we," "us," or "our") governing your access to and use of the Kōru platform, website, and services (collectively, the "Service").
                </p>
                <p className="text-foreground/90 leading-relaxed">
                  By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Service. These Terms apply to all users, including Seekers, Hosts, and visitors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  Kōru is a pay-for-attention platform that connects people seeking answers or expertise (Seekers) with individuals offering their time and knowledge (Hosts). The Service facilitates:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-4">
                  <li><strong>Summons:</strong> Paid requests where Seekers pay upfront for guaranteed responses from Hosts within specified timeframes</li>
                  <li><strong>Communication:</strong> Message-based or call-based interactions between Seekers and Hosts</li>
                  <li><strong>Payment Processing:</strong> Secure handling of payments, refunds, and payouts</li>
                  <li><strong>Profile Management:</strong> User profiles, availability settings, and discovery features</li>
                  <li><strong>Verification:</strong> Identity verification and trust signals to ensure platform safety</li>
                </ul>
                <p className="text-foreground/90 leading-relaxed">
                  Kōru acts as an intermediary platform. We facilitate connections and transactions but are not a party to the agreements between Seekers and Hosts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Eligibility and Account Requirements</h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  To use the Service, you must:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-4">
                  <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                  <li>Have the legal capacity to enter into binding agreements</li>
                  <li>Provide accurate, current, and complete information when creating an account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access to your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
                <p className="text-foreground/90 leading-relaxed">
                  You may not create multiple accounts, transfer your account to another person, or use another person's account. We reserve the right to suspend or terminate accounts that violate these requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Roles and Responsibilities</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">4.1 Seekers</h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  As a Seeker, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>Pay upfront when sending a Summon</li>
                  <li>Provide clear, specific, and respectful questions or requests</li>
                  <li>Respect Hosts' time, expertise, and boundaries</li>
                  <li>Not abuse the refund system or make fraudulent claims</li>
                  <li>Use the Service in good faith and for legitimate purposes</li>
                  <li>Not request illegal, harmful, or inappropriate content</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">4.2 Hosts</h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  As a Host, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>Set clear, reasonable prices for your services</li>
                  <li>Respond to accepted Summons within the agreed timeframe</li>
                  <li>Provide accurate information about your expertise and availability</li>
                  <li>Deliver responses that meet the commitments made in your Summon acceptance</li>
                  <li>Not impersonate others or misrepresent your identity or qualifications</li>
                  <li>Issue refunds promptly if you cannot meet a deadline</li>
                  <li>Comply with all applicable laws and professional standards</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payments, Fees, and Refunds</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.1 Payment Terms</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>Payment is required upfront when you send a Summon</li>
                  <li>All prices are displayed in the currency specified and include applicable taxes</li>
                  <li>Kōru charges a platform fee, and payment processors may charge processing fees</li>
                  <li>You will see a complete fee breakdown before confirming payment</li>
                  <li>Payments are processed securely through third-party payment processors</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.2 Refund Policy</h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  You are eligible for a full refund if:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>The Host declines your Summon (automatic refund)</li>
                  <li>The Host fails to respond by the agreed deadline</li>
                  <li>The Host cancels the Summon</li>
                  <li>The Host fails to deliver what was promised (e.g., scheduled call doesn't occur)</li>
                  <li>You cancel a Summon before it's accepted by the Host</li>
                </ul>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  Refunds are not available for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>Subjective dissatisfaction with advice quality or opinions</li>
                  <li>Disagreement with the Host's response or perspective</li>
                  <li>Change of mind after receiving a response</li>
                  <li>Summons that have been completed as promised</li>
                </ul>
                <p className="text-foreground/90 leading-relaxed">
                  Refunds are typically processed within 3-5 business days. If you believe you're entitled to a refund that wasn't processed automatically, contact support with details.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.3 Host Payouts</h3>
                <p className="text-foreground/90 leading-relaxed">
                  Hosts receive payouts after successfully completing Summons and passing any necessary safety or fraud checks. Payout timing depends on the payment method. Hosts are responsible for any taxes on their earnings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Prohibited Conduct</h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                  <li>Impersonate others, provide false information, or misrepresent your identity or qualifications</li>
                  <li>Harass, abuse, threaten, or harm other users</li>
                  <li>Use the Service for illegal activities or to facilitate illegal transactions</li>
                  <li>Attempt to circumvent payment systems, fees, or refund policies</li>
                  <li>Spam, scam, defraud, or engage in deceptive practices</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
                  <li>Interfere with or disrupt the Service, servers, or networks</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                  <li>Share account credentials or allow others to use your account</li>
                  <li>Violate any applicable laws, regulations, or third-party rights</li>
                  <li>Post or transmit content that is illegal, harmful, threatening, abusive, or violates others' rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Content and Intellectual Property</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">7.1 Your Content</h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  You retain ownership of content you create and submit to the Service. However, by using the Service, you grant Kōru a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content solely for the purpose of operating and providing the Service.
                </p>
                <p className="text-foreground/90 leading-relaxed mb-6">
                  You are responsible for ensuring you have the right to post any content you submit and that it doesn't violate any third-party rights.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">7.2 Kōru's Intellectual Property</h3>
                <p className="text-foreground/90 leading-relaxed">
                  The Service, including its design, features, functionality, logos, and content, is owned by Kōru and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy</h2>
                <p className="text-foreground/90 leading-relaxed">
                  Your use of the Service is also governed by our <Link href="/privacy" className="text-koru-purple hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your information. By using the Service, you consent to the collection and use of information as described in the Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Disclaimers and Limitation of Liability</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">9.1 Service Disclaimer</h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>Uninterrupted, error-free, or secure operation of the Service</li>
                  <li>The accuracy, quality, or usefulness of Host responses</li>
                  <li>That the Service will meet your specific requirements or expectations</li>
                  <li>That any errors or defects will be corrected</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">9.2 Limitation of Liability</h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, KŌRU SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, revenue, data, use, goodwill, or other intangible losses</li>
                  <li>Damages resulting from your use or inability to use the Service</li>
                  <li>Damages resulting from interactions between users</li>
                  <li>Damages resulting from unauthorized access to or alteration of your data</li>
                </ul>
                <p className="text-foreground/90 leading-relaxed">
                  Our total liability to you for all claims arising from or related to the Service shall not exceed the amount you paid to us in the 12 months preceding the claim, or $100, whichever is greater.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Indemnification</h2>
                <p className="text-foreground/90 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Kōru, its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Termination</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">11.1 Termination by You</h3>
                <p className="text-foreground/90 leading-relaxed mb-6">
                  You may terminate your account at any time by deleting it through your account settings. You remain responsible for any outstanding Summons or obligations. Some information may be retained for legal or compliance purposes.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">11.2 Termination by Us</h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  We may suspend or terminate your account immediately, without prior notice, if you:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90 mb-6">
                  <li>Violate these Terms or our policies</li>
                  <li>Engage in fraudulent, illegal, or harmful activity</li>
                  <li>Abuse other users or the Service</li>
                  <li>Fail to pay fees or charges when due</li>
                  <li>Use the Service in a manner that exposes us to legal liability</li>
                </ul>
                <p className="text-foreground/90 leading-relaxed">
                  Upon termination, your right to use the Service immediately ceases. We may delete your account and data, subject to legal retention requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Dispute Resolution</h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  If you have a dispute with another user, we encourage you to contact them directly. If you have a dispute with Kōru, please contact us at <Link href="/contact" className="text-koru-purple hover:underline">support</Link>.
                </p>
                <p className="text-foreground/90 leading-relaxed">
                  These Terms are governed by the laws of the jurisdiction in which Kōru operates. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except where prohibited by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
                <p className="text-foreground/90 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page and updating the "Last updated" date. We may also notify you via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Service and delete your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">14. General Provisions</h2>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                  <li>These Terms constitute the entire agreement between you and Kōru regarding the Service</li>
                  <li>If any provision is found unenforceable, the remaining provisions will remain in effect</li>
                  <li>Our failure to enforce any right or provision does not waive that right</li>
                  <li>You may not assign these Terms or transfer your account without our consent</li>
                  <li>We may assign these Terms without restriction</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact Information</h2>
                <p className="text-foreground/90 leading-relaxed">
                  If you have questions about these Terms, please <Link href="/contact" className="text-koru-purple hover:underline">contact us</Link>. We're here to help and will respond to your inquiries promptly.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Questions about these terms?
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/faq">View FAQ</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
