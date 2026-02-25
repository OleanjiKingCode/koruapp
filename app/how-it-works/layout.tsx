import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Koru",
  description:
    "Learn how Koru connects seekers with experts through paid conversations, escrow protection, and summons.",
  openGraph: {
    title: "How It Works | Koru",
    description:
      "Discover how Koru facilitates meaningful, paid conversations.",
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
