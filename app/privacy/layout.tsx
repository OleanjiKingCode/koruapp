import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Koru",
  description:
    "Read the Koru privacy policy. Learn how we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy | Koru",
    description:
      "How Koru collects, uses, and protects your personal information.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
