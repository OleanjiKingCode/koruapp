import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Koru",
  description:
    "Connect your wallet to sign in to Koru and start earning for your time.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
