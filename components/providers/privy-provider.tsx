"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { base, baseSepolia } from "viem/chains";
import { ReactNode } from "react";
import { useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi-config";

interface PrivyProviderProps {
  children: ReactNode;
}

// Create a client
const queryClient = new QueryClient();

// Use Base Sepolia for testing, Base for production
const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID !== "8453";

export function PrivyProvider({ children }: PrivyProviderProps) {
  const { theme } = useTheme();

  const defaultChain = isTestnet ? baseSepolia : base;
  const supportedChains = isTestnet ? [baseSepolia, base] : [base, baseSepolia];

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
        defaultChain,
        supportedChains,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </BasePrivyProvider>
  );
}
