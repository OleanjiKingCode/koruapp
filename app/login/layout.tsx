import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Koru",
  description:
    "Sign in to Koru with your X account to start connecting with experts and creators.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
