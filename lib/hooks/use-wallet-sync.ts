"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
    isAuthenticated,
    linkWallet,
    changePrimaryWallet,
    isWalletLinked,
    hasLinkedWallet,
    canChangeWallet,
    getDaysUntilWalletChange,
    primaryWalletAddress,
    refresh,
  } = useUser();
  const [isLinking, setIsLinking] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Track if we've already attempted to link this address
  const linkAttemptedRef = useRef<string | null>(null);

  // Get connected wallet address from Privy
  const connectedWalletAddress =
    privyUser?.wallet?.address?.toLowerCase() || null;

  // Check if wallet is already linked (stable reference)
  const hasWallet = hasLinkedWallet();
  const isCurrentWalletLinked = connectedWalletAddress
    ? isWalletLinked(connectedWalletAddress)
    : false;

  // Determine sync status
  const getSyncStatus = useCallback((): WalletSyncStatus => {
    // No wallet connected via Privy
    if (!privyReady || !privyAuthenticated || !connectedWalletAddress) {
      return "no_wallet";
    }

    // User has connected wallet but no linked wallet in DB
    if (!hasWallet) {
      return "no_linked_wallet";
    }

    // Check if connected wallet matches linked wallet
    if (isCurrentWalletLinked) {
      return "wallet_synced";
    }

    // Wallet mismatch
    return "wallet_mismatch";
  }, [
    privyReady,
    privyAuthenticated,
    connectedWalletAddress,
    hasWallet,
    isCurrentWalletLinked,
  ]);

  const syncStatus = getSyncStatus();

  // Auto-link wallet when user connects for the first time
  useEffect(() => {
    // Only attempt to link if:
    // 1. Status is "no_linked_wallet"
    // 2. We have a connected address
    // 3. User is authenticated
    // 4. We're not already linking
    // 5. We haven't already tried this address
    if (
      syncStatus !== "no_linked_wallet" ||
      !connectedWalletAddress ||
      !isAuthenticated ||
      isLinking ||
      linkAttemptedRef.current === connectedWalletAddress
    ) {
      return;
    }

    // Mark this address as attempted
    linkAttemptedRef.current = connectedWalletAddress;

    const autoLinkWallet = async () => {
      setIsLinking(true);
      setLinkError(null);
      try {
        await linkWallet(connectedWalletAddress, "base");
        refresh();
      } catch (error: unknown) {
        console.error("Failed to auto-link wallet:", error);
        // Check if it's the "already linked" error
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("already linked")) {
          setLinkError(
            "This wallet is already linked to another Koru account. Please use a different wallet.",
          );
        } else {
          setLinkError("Failed to link wallet to your account");
        }
        // Reset so user can try again manually
        linkAttemptedRef.current = null;
      } finally {
        setIsLinking(false);
      }
    };

    autoLinkWallet();
  }, [syncStatus, connectedWalletAddress, isAuthenticated]);

  // Reset link attempted when wallet changes
  useEffect(() => {
    if (connectedWalletAddress !== linkAttemptedRef.current) {
      // Don't reset if it's the current address, only if it changed
      if (linkAttemptedRef.current !== null && connectedWalletAddress) {
        linkAttemptedRef.current = null;
      }
    }
  }, [connectedWalletAddress]);

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
    } catch (error: unknown) {
      console.error("Failed to link wallet:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("already linked")) {
        setLinkError(
          "This wallet is already linked to another Koru account. Please use a different wallet.",
        );
      } else {
        setLinkError("Failed to link wallet to your account");
      }
      return false;
    } finally {
      setIsLinking(false);
    }
  };

  // Change to the currently connected wallet (with 14-day cooldown)
  const changeSyncedWallet = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!connectedWalletAddress) {
      return { success: false, error: "No wallet connected" };
    }

    setIsChanging(true);
    setLinkError(null);

    try {
      const result = await changePrimaryWallet(connectedWalletAddress, "base");
      if (result.success) {
        refresh();
      } else {
        setLinkError(result.error || "Failed to change wallet");
      }
      return result;
    } catch (error) {
      console.error("Failed to change wallet:", error);
      const errorMsg = "Failed to change wallet";
      setLinkError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsChanging(false);
    }
  };

  // Check if user can change their synced wallet
  const canChangeSyncedWallet = canChangeWallet();
  const daysUntilChange = getDaysUntilWalletChange();

  return {
    syncStatus,
    connectedWalletAddress,
    linkedWalletAddress: primaryWalletAddress,
    isLinking,
    isChanging,
    linkError,
    manualLinkWallet,
    changeSyncedWallet,
    canChangeSyncedWallet,
    daysUntilChange,
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
