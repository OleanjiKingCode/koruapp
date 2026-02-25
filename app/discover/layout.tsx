import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover | Koru",
  description:
    "Find and connect with experts, creators, and people who matter. Browse curated profiles and start meaningful conversations.",
  openGraph: {
    title: "Discover | Koru",
    description:
      "Find and connect with experts, creators, and people who matter.",
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
