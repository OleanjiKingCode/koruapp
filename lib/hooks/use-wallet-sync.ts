"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "./use-user";

export type WalletSyncStatus =
  | "no_wallet" // User hasn't connected a wallet via Privy
  | "no_linked_wallet" // User connected wallet but hasn't linked to account
  | "wallet_mismatch" // Connected wallet doesn't match linked wallet
  | "wallet_synced"; // Connected wallet matches linked wallet

export function useWalletSync() {
  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
  } = usePrivy();
  const {
    user,
    isAuthenticated,
    linkWallet,
    isWalletLinked,
    hasLinkedWallet,
    primaryWalletAddress,
    refresh,
  } = useUser();
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Get connected wallet address from Privy
  const connectedWalletAddress =
    privyUser?.wallet?.address?.toLowerCase() || null;

  // Determine sync status
  const getSyncStatus = (): WalletSyncStatus => {
    // No wallet connected via Privy
    if (!privyReady || !privyAuthenticated || !connectedWalletAddress) {
      return "no_wallet";
    }

    // User has connected wallet but no linked wallet in DB
    if (!hasLinkedWallet()) {
      return "no_linked_wallet";
    }

    // Check if connected wallet matches linked wallet
    if (isWalletLinked(connectedWalletAddress)) {
      return "wallet_synced";
    }

    // Wallet mismatch
    return "wallet_mismatch";
  };

  const syncStatus = getSyncStatus();

  // Auto-link wallet when user connects for the first time
  useEffect(() => {
    const autoLinkWallet = async () => {
      if (
        syncStatus === "no_linked_wallet" &&
        connectedWalletAddress &&
        isAuthenticated &&
        !isLinking
      ) {
        setIsLinking(true);
        setLinkError(null);
        try {
          await linkWallet(connectedWalletAddress, "base");
          refresh();
        } catch (error) {
          console.error("Failed to auto-link wallet:", error);
          setLinkError("Failed to link wallet to your account");
        } finally {
          setIsLinking(false);
        }
      }
    };

    autoLinkWallet();
  }, [
    syncStatus,
    connectedWalletAddress,
    isAuthenticated,
    isLinking,
    linkWallet,
    refresh,
  ]);

  // Manual link wallet function
  const manualLinkWallet = async () => {
    if (!connectedWalletAddress) {
      setLinkError("No wallet connected");
      return false;
    }

    setIsLinking(true);
    setLinkError(null);

    try {
      await linkWallet(connectedWalletAddress, "base");
      refresh();
      return true;
    } catch (error) {
      console.error("Failed to link wallet:", error);
      setLinkError("Failed to link wallet to your account");
      return false;
    } finally {
      setIsLinking(false);
    }
  };

  return {
    syncStatus,
    connectedWalletAddress,
    linkedWalletAddress: primaryWalletAddress,
    isLinking,
    linkError,
    manualLinkWallet,
    // Helper flags
    isWalletConnected: !!connectedWalletAddress,
    isWalletLinked: syncStatus === "wallet_synced",
    isWalletMismatch: syncStatus === "wallet_mismatch",
    needsWalletLink: syncStatus === "no_linked_wallet",
  };
}

// Shorten address for display
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
