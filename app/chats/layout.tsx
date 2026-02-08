import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chats | Koru",
  description: "Manage your active conversations and message history on Koru.",
};

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
