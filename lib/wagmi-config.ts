import { http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { createConfig } from "@privy-io/wagmi";

// Determine which chain to use based on environment
const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID !== "8453";

// Create wagmi config using Privy's createConfig for proper integration
export const wagmiConfig = createConfig({
  chains: isTestnet ? [baseSepolia, base] : [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Export chain helpers
export const getDefaultChain = () => (isTestnet ? baseSepolia : base);
export const getChainId = () => getDefaultChain().id;
