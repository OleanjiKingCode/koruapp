import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Koru",
  description:
    "Frequently asked questions about Koru - payments, summons, refunds, smart contracts, and more.",
  openGraph: {
    title: "FAQ | Koru",
    description: "Get answers to common questions about using Koru.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Koru?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Koru is a pay-for-attention platform that connects you with experts, creators, and thought leaders. Use Summons to publicly pledge how much you'd pay to bring someone to the platform, or directly message Hosts who are already here for guaranteed responses.",
      },
    },
    {
      "@type": "Question",
      name: "How does Koru work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Koru works in two ways: 1) If someone is already on Koru, search for them in Discover and message them directly. 2) If they're NOT on Koru yet, create a Summon to publicly pledge how much you'd pay to bring them here. Others can back your Summon to increase the total pledge and get their attention.",
      },
    },
    {
      "@type": "Question",
      name: "What is a Summon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Summon is a public pledge to bring someone to Koru who isn't on the platform yet. It's not a paid request—you're simply stating how much you would pay if they join. Think of it as a community-driven way to get the attention of people you want to connect with.",
      },
    },
    {
      "@type": "Question",
      name: "When am I actually charged?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You're only charged when you initiate a direct engagement with a Host who is on Koru. This happens through our secure escrow smart contract. Summon pledges are NOT charged—they're just public commitments.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Koru escrow smart contract work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When you pay to message a Host, your USDC is deposited into our secure escrow smart contract—not directly to the Host. The funds are held safely until the engagement is complete. This protects both parties: Seekers know their money is safe, and Hosts know the payment is real.",
      },
    },
    {
      "@type": "Question",
      name: "When am I eligible for a refund?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You're eligible for a full refund if: (1) The Host doesn't accept within 24 hours—you can reclaim automatically, (2) You raise a valid dispute within 48 hours of acceptance, (3) The Host fails to deliver what was promised. Refunds through the smart contract are instant.",
      },
    },
    {
      "@type": "Question",
      name: "How do I become a Host?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anyone can become a Host on Koru! Simply set your availability, choose your pricing for different types of Summons (messages vs. calls), and start accepting requests. You can customize your profile and set response time preferences.",
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
