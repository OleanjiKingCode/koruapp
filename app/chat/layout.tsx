import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | Koru",
  description: "Have a meaningful conversation on Koru.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
