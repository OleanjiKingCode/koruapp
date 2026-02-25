import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Koru",
  description:
    "Get in touch with the Koru team. Reach out for support, partnerships, or feedback.",
  openGraph: {
    title: "Contact | Koru",
    description: "Reach out to the Koru team for support or partnerships.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
