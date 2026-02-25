import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Koru",
  description:
    "Stay updated with your latest activity, messages, and summon updates on Koru.",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
