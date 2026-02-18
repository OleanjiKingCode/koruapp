import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Koru",
  description:
    "Read the Koru terms of service. Understand the rules and guidelines for using the Koru platform.",
  openGraph: {
    title: "Terms of Service | Koru",
    description: "Rules and guidelines for using the Koru platform.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
