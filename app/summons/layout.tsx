import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Summons | Koru",
  description:
    "Rally support to reach the people you want to talk to. Create or back a summon to show demand for a conversation.",
  openGraph: {
    title: "Summons | Koru",
    description: "Rally support to reach the people you want to talk to.",
  },
};

export default function SummonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
