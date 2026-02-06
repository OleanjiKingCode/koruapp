import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Koru",
  description: "View and manage your Koru profile, availability, and earnings.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
