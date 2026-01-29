"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { ReactNode } from "react";
import { useTheme } from "next-themes";

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const { theme } = useTheme();

  return (
    <BasePrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["wallet", "email"],
        appearance: {
          theme: theme === "dark" ? "dark" : "light",
          accentColor: "#c385ee",
          logo: "/kayaSideWays.png",
          showWalletLoginFirst: true,
          walletChainType: "ethereum-only",
          walletList: [
            "detected_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "wallet_connect",
          ],
          loginMessage: "Connect your wallet",
        },
        defaultChain: base,
        supportedChains: [base],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
