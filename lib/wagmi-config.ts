import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

// Determine which chain to use based on environment
const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID !== "8453";

export const wagmiConfig = createConfig({
  chains: isTestnet ? [baseSepolia, base] : [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

// Export chain helpers
export const getDefaultChain = () => (isTestnet ? baseSepolia : base);
export const getChainId = () => getDefaultChain().id;
