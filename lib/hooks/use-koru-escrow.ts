"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { Address, formatUnits, parseUnits } from "viem";
import {
  KORU_ESCROW_ADDRESSES,
  KORU_ESCROW_ABI,
  USDC_ADDRESSES,
  ERC20_ABI,
  Escrow,
  Deadlines,
  EscrowStatus,
} from "../contracts/koru-escrow";
import { getChainId } from "../wagmi-config";

// =============================================================================
// HELPERS
// =============================================================================

// Get contract address for current chain
const getContractAddress = (): Address => {
  const chainId = getChainId();
  return KORU_ESCROW_ADDRESSES[chainId];
};

// Get USDC address for current chain
const getUsdcAddress = (): Address => {
  const chainId = getChainId();
  return USDC_ADDRESSES[chainId];
};

// =============================================================================
// READ HOOKS
// =============================================================================

/**
 * Hook to get escrow details by ID
 */
export function useEscrow(escrowId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "getEscrow",
    args: escrowId !== undefined ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== undefined,
    },
  });

  return {
    escrow: data as Escrow | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get escrow status
 */
export function useEscrowStatus(escrowId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "getEffectiveStatus",
    args: escrowId !== undefined ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== undefined,
      refetchInterval: 5000,
    },
  });

  return {
    status: data as EscrowStatus | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get escrow deadlines
 */
export function useEscrowDeadlines(escrowId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "getDeadlines",
    args: escrowId !== undefined ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== undefined,
    },
  });

  return {
    deadlines: data as Deadlines | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if escrow can be accepted
 */
export function useCanAccept(escrowId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "canAccept",
    args: escrowId !== undefined ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== undefined,
      refetchInterval: 5000,
    },
  });

  return {
    canAccept: (data as boolean) ?? false,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if depositor can withdraw (expired escrow)
 */
export function useCanDepositorWithdraw(escrowId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "canDepositorWithdraw",
    args: escrowId !== undefined ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== undefined,
      refetchInterval: 5000,
    },
  });

  return {
    canWithdraw: (data as boolean) ?? false,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if recipient can withdraw
 */
export function useCanRecipientWithdraw(escrowId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "canRecipientWithdraw",
    args: escrowId !== undefined ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== undefined,
      refetchInterval: 5000,
    },
  });

  return {
    canWithdraw: (data as boolean) ?? false,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if can dispute
 */
export function useCanDispute(escrowId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "canDispute",
    args: escrowId !== undefined ? [escrowId] : undefined,
    query: {
      enabled: escrowId !== undefined,
      refetchInterval: 5000,
    },
  });

  return {
    canDispute: (data as boolean) ?? false,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get total escrow count
 */
export function useEscrowCount() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "getEscrowCount",
  });

  return {
    count: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to calculate fee for an amount
 */
export function useCalculateFee(amount?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "calculateFee",
    args: amount !== undefined ? [amount] : undefined,
    query: {
      enabled: amount !== undefined,
    },
  });

  const result = data as [bigint, bigint] | undefined;

  return {
    fee: result?.[0],
    netAmount: result?.[1],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get USDC balance using useReadContract
 */
export function useUsdcBalance(address?: Address) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getUsdcAddress(),
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  const balance = (data as bigint) ?? BigInt(0);

  return {
    balance,
    formatted: formatUnits(balance, 6),
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get ETH balance using wagmi's useBalance
 */
export function useEthBalance(address?: Address) {
  const { data, isLoading, error, refetch } = useBalance({
    address,
    query: {
      enabled: !!address,
      refetchInterval: 15000,
    },
  });

  return {
    balance: data?.value ?? BigInt(0),
    formatted: data ? formatUnits(data.value, 18) : "0",
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get USDC allowance for escrow contract
 */
export function useUsdcAllowance(address?: Address) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getUsdcAddress(),
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, getContractAddress()] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  return {
    allowance: (data as bigint) ?? BigInt(0),
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get contract info (fee, paused state, etc.)
 */
export function useContractInfo() {
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address: getContractAddress(),
        abi: KORU_ESCROW_ABI,
        functionName: "feeBps",
      },
      {
        address: getContractAddress(),
        abi: KORU_ESCROW_ABI,
        functionName: "paused",
      },
      {
        address: getContractAddress(),
        abi: KORU_ESCROW_ABI,
        functionName: "owner",
      },
    ],
  });

  return {
    feeBps: data?.[0]?.result as bigint | undefined,
    paused: data?.[1]?.result as boolean | undefined,
    owner: data?.[2]?.result as Address | undefined,
    isLoading,
    error,
    refetch,
  };
}

// =============================================================================
// WRITE HOOKS
// =============================================================================

/**
 * Hook to approve USDC spending
 */
export function useApproveUsdc(amount: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getUsdcAddress(),
    abi: ERC20_ABI,
    functionName: "approve",
    args: [getContractAddress(), amount],
    query: {
      enabled: enabled && isConnected,
    },
  });

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    approve: () => setEnabled(true),
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  };
}

/**
 * Hook to create escrow
 * Returns escrowId from simulation result (the contract returns it!)
 */
export function useCreateEscrow(recipient: Address, amount: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "createEscrow",
    args: [recipient, amount],
    query: {
      enabled: enabled && isConnected && !!recipient && amount > BigInt(0),
    },
  });

  // Get escrowId from simulation result (contract returns it)
  const escrowId = simData?.result as bigint | undefined;

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset: writeReset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    createEscrow: () => setEnabled(true),
    escrowId, // The escrow ID that will be assigned (from simulation)
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset: writeReset,
  };
}

/**
 * Simple async hook for escrow payment flow
 * Call approveAndCreateEscrow() and it handles everything
 */
export function useEscrowPayment(recipient: Address, amount: bigint) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "approving" | "creating" | "confirming" | "done" | "error"
  >("idle");
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [escrowId, setEscrowId] = useState<bigint | null>(null);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setCurrentStep("idle");
    setError(null);
    setTxHash(null);
    setEscrowId(null);
  }, []);

  const approveAndCreateEscrow = useCallback(async () => {
    if (!walletClient || !publicClient || !address) {
      throw new Error("Wallet not connected");
    }
    if (
      !recipient ||
      recipient === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error("Invalid recipient address");
    }
    if (amount <= BigInt(0)) {
      throw new Error("Invalid amount");
    }

    setIsProcessing(true);
    setError(null);
    setCurrentStep("approving");

    try {
      const usdcAddress = getUsdcAddress();
      const escrowAddress = getContractAddress();

      // Check current allowance
      const currentAllowance = await publicClient.readContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, escrowAddress],
      });

      // Step 1: Approve if needed
      if ((currentAllowance as bigint) < amount) {
        console.log("[EscrowPayment] Approving USDC spend...");
        const approveHash = await walletClient.writeContract({
          address: usdcAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [escrowAddress, amount],
        });

        console.log("[EscrowPayment] Waiting for approval confirmation...");
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log("[EscrowPayment] Approval confirmed!");
      } else {
        console.log("[EscrowPayment] Already approved, skipping...");
      }

      // Step 2: Create escrow
      setCurrentStep("creating");
      console.log("[EscrowPayment] Creating escrow...");

      // Simulate first to get escrow ID
      const { result: simulatedEscrowId } = await publicClient.simulateContract(
        {
          address: escrowAddress,
          abi: KORU_ESCROW_ABI,
          functionName: "createEscrow",
          args: [recipient, amount],
          account: address,
        },
      );

      const createHash = await walletClient.writeContract({
        address: escrowAddress,
        abi: KORU_ESCROW_ABI,
        functionName: "createEscrow",
        args: [recipient, amount],
      });

      setTxHash(createHash);
      setCurrentStep("confirming");
      console.log("[EscrowPayment] Waiting for escrow confirmation...");

      await publicClient.waitForTransactionReceipt({ hash: createHash });

      setEscrowId(simulatedEscrowId as bigint);
      setCurrentStep("done");
      console.log(
        "[EscrowPayment] Escrow created! ID:",
        (simulatedEscrowId as bigint).toString(),
      );

      return {
        txHash: createHash,
        escrowId: simulatedEscrowId as bigint,
      };
    } catch (err) {
      console.error("[EscrowPayment] Error:", err);
      setError(err as Error);
      setCurrentStep("error");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [walletClient, publicClient, address, recipient, amount]);

  return {
    approveAndCreateEscrow,
    isProcessing,
    currentStep,
    error,
    txHash,
    escrowId,
    reset,
    address,
    isConnected,
  };
}

/**
 * Hook to accept escrow
 */
export function useAcceptEscrow(escrowId: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "accept",
    args: [escrowId],
    query: {
      enabled: enabled && isConnected,
    },
  });

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    accept: () => setEnabled(true),
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  };
}

/**
 * Hook to cancel escrow
 */
export function useCancelEscrow(escrowId: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "cancel",
    args: [escrowId],
    query: {
      enabled: enabled && isConnected,
    },
  });

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    cancel: () => setEnabled(true),
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  };
}

/**
 * Hook to release escrow
 */
export function useReleaseEscrow(escrowId: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "release",
    args: [escrowId],
    query: {
      enabled: enabled && isConnected,
    },
  });

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    release: () => setEnabled(true),
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  };
}

/**
 * Hook to dispute escrow
 */
export function useDisputeEscrow(escrowId: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "dispute",
    args: [escrowId],
    query: {
      enabled: enabled && isConnected,
    },
  });

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    dispute: () => setEnabled(true),
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  };
}

/**
 * Hook to counter dispute
 */
export function useCounterDispute(escrowId: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "counterDispute",
    args: [escrowId],
    query: {
      enabled: enabled && isConnected,
    },
  });

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    counterDispute: () => setEnabled(true),
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  };
}

/**
 * Hook to withdraw from escrow
 */
export function useWithdrawEscrow(escrowId: bigint) {
  const { address, isConnected } = useAccount();
  const [enabled, setEnabled] = useState(false);

  const {
    data: simData,
    status: simStatus,
    error: simError,
    fetchStatus: simFetchStatus,
  } = useSimulateContract({
    address: getContractAddress(),
    abi: KORU_ESCROW_ABI,
    functionName: "withdraw",
    args: [escrowId],
    query: {
      enabled: enabled && isConnected,
    },
  });

  const {
    writeContract,
    data: txHash,
    error: writeError,
    status: writeStatus,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const newFetchRef = useRef(false);

  useEffect(() => {
    if (simFetchStatus === "fetching") {
      newFetchRef.current = true;
    }
  }, [simFetchStatus]);

  useEffect(() => {
    if (
      newFetchRef.current &&
      enabled &&
      simStatus === "success" &&
      simData?.request
    ) {
      writeContract(simData.request);
      newFetchRef.current = false;
      setEnabled(false);
    }
  }, [simStatus, simData?.request, enabled, writeContract]);

  useEffect(() => {
    if (simError && enabled) {
      setEnabled(false);
    }
  }, [simError, enabled]);

  return {
    withdraw: () => setEnabled(true),
    txHash,
    address,
    isConnected,
    isSimulating: simFetchStatus === "fetching",
    isPending: writeStatus === "pending",
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  };
}

// =============================================================================
// COMBINED HOOK
// =============================================================================

/**
 * Combined hook for a specific escrow with all read data
 */
export function useEscrowDetails(escrowId?: bigint) {
  const {
    escrow,
    isLoading: escrowLoading,
    refetch: refetchEscrow,
  } = useEscrow(escrowId);
  const { status, refetch: refetchStatus } = useEscrowStatus(escrowId);
  const { deadlines } = useEscrowDeadlines(escrowId);
  const { canAccept } = useCanAccept(escrowId);
  const { canWithdraw: canDepositorWithdraw } =
    useCanDepositorWithdraw(escrowId);
  const { canWithdraw: canRecipientWithdraw } =
    useCanRecipientWithdraw(escrowId);
  const { canDispute } = useCanDispute(escrowId);

  const refetch = () => {
    refetchEscrow();
    refetchStatus();
  };

  return {
    // Data
    escrow,
    status,
    deadlines,
    canAccept,
    canDepositorWithdraw,
    canRecipientWithdraw,
    canDispute,

    // State
    isLoading: escrowLoading,

    // Actions
    refetch,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Parse USDC amount (human readable to contract format)
 */
export function parseUsdcAmount(amount: string | number): bigint {
  return parseUnits(amount.toString(), 6);
}

/**
 * Format USDC amount (contract format to human readable)
 */
export function formatUsdcAmount(amount: bigint): string {
  return formatUnits(amount, 6);
}

/**
 * Get escrow contract address for current chain
 */
export function getEscrowAddress(): Address {
  return getContractAddress();
}

/**
 * Get USDC contract address for current chain
 */
export function getUsdcContractAddress(): Address {
  return getUsdcAddress();
}

// Re-export types
export type { Escrow, Deadlines, EscrowStatus };

// =============================================================================
// BATCH READ HOOKS (For fetching multiple escrows by ID from database)
// =============================================================================

/**
 * Hook to fetch multiple escrows by their IDs (from database)
 * Use this when you have escrow IDs stored in your database
 */
export function useEscrowsByIds(escrowIds: bigint[]) {
  const contracts = useMemo(() => {
    return escrowIds.map((id) => ({
      address: getContractAddress(),
      abi: KORU_ESCROW_ABI,
      functionName: "getEscrow" as const,
      args: [id] as const,
    }));
  }, [escrowIds]);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: escrowIds.length > 0,
      refetchInterval: 30000,
    },
  });

  const escrows = useMemo(() => {
    if (!data) return [];
    return data
      .map((result, index) => {
        if (result.status === "success" && result.result) {
          return {
            id: escrowIds[index],
            ...(result.result as Escrow),
          };
        }
        return null;
      })
      .filter((e): e is { id: bigint } & Escrow => e !== null);
  }, [data, escrowIds]);

  return {
    escrows,
    isLoading,
    error,
    refetch,
  };
}

// =============================================================================
// PENDING BALANCE FROM CONTRACT (via wagmi useReadContract / useReadContracts)
// =============================================================================

/**
 * Hook to get user's pending balance directly from the smart contract.
 * Uses wagmi's useReadContract/useReadContracts — no publicClient.
 *
 * Step 1: read escrow count
 * Step 2: batch-read all escrows + their effective statuses via useReadContracts
 * Step 3: compute pending/ready totals for the wallet
 */
export function useContractPendingBalance(walletAddress?: Address) {
  const escrowAddress = getContractAddress();

  // Step 1: get the total escrow count
  const {
    data: escrowCount,
    isLoading: isLoadingCount,
    error: countError,
    refetch: refetchCount,
  } = useReadContract({
    address: escrowAddress,
    abi: KORU_ESCROW_ABI,
    functionName: "getEscrowCount",
    query: {
      refetchInterval: 30_000,
    },
  });

  const count = escrowCount !== undefined ? Number(escrowCount) : 0;

  // Step 2: build contract calls for all escrows
  // 3 calls per escrow: getEscrow, getEffectiveStatus, canRecipientWithdraw
  const CALLS_PER_ESCROW = 3;
  const contracts = useMemo(() => {
    if (count === 0) return [];
    const calls = [];
    for (let i = 0; i < count; i++) {
      calls.push({
        address: escrowAddress,
        abi: KORU_ESCROW_ABI,
        functionName: "getEscrow" as const,
        args: [BigInt(i)] as const,
      });
      calls.push({
        address: escrowAddress,
        abi: KORU_ESCROW_ABI,
        functionName: "getEffectiveStatus" as const,
        args: [BigInt(i)] as const,
      });
      calls.push({
        address: escrowAddress,
        abi: KORU_ESCROW_ABI,
        functionName: "canRecipientWithdraw" as const,
        args: [BigInt(i)] as const,
      });
    }
    return calls;
  }, [count, escrowAddress]);

  const {
    data: batchData,
    isLoading: isLoadingBatch,
    error: batchError,
    refetch: refetchBatch,
  } = useReadContracts({
    contracts,
    query: {
      enabled: count > 0 && !!walletAddress,
      refetchInterval: 30_000,
    },
  });

  // Step 3: compute totals
  const { pendingBalance, readyBalance } = useMemo(() => {
    if (!batchData || !walletAddress) {
      return { pendingBalance: BigInt(0), readyBalance: BigInt(0) };
    }
    const normalizedWallet = walletAddress.toLowerCase();
    let totalPending = BigInt(0);
    let totalReady = BigInt(0);

    for (let i = 0; i < count; i++) {
      const escrowResult = batchData[i * CALLS_PER_ESCROW];
      const statusResult = batchData[i * CALLS_PER_ESCROW + 1];
      const canWithdrawResult = batchData[i * CALLS_PER_ESCROW + 2];

      if (
        escrowResult?.status !== "success" ||
        !escrowResult.result ||
        statusResult?.status !== "success"
      )
        continue;

      const escrow = escrowResult.result as Escrow;
      const effectiveStatus = Number(statusResult.result) as EscrowStatus;
      const canWithdraw =
        canWithdrawResult?.status === "success"
          ? (canWithdrawResult.result as boolean)
          : false;
      const isRecipient = escrow.recipient.toLowerCase() === normalizedWallet;

      if (!isRecipient) continue;

      // Show net amount (after fee) — what the recipient will actually receive
      const fee = (escrow.amount * BigInt(escrow.feeBps)) / BigInt(10000);
      const netAmount = escrow.amount - fee;

      // If contract says recipient can withdraw, it's ready regardless of status label
      if (canWithdraw) {
        totalReady += netAmount;
      } else if (
        effectiveStatus === EscrowStatus.Pending ||
        effectiveStatus === EscrowStatus.Accepted ||
        effectiveStatus === EscrowStatus.Disputed
      ) {
        totalPending += netAmount;
      } else if (effectiveStatus === EscrowStatus.Released) {
        totalReady += netAmount;
      }
    }

    return { pendingBalance: totalPending, readyBalance: totalReady };
  }, [batchData, walletAddress, count]);

  const refetch = useCallback(() => {
    refetchCount();
    refetchBatch();
  }, [refetchCount, refetchBatch]);

  return {
    pendingBalance,
    readyBalance,
    pendingFormatted: formatUsdcAmount(pendingBalance),
    readyFormatted: formatUsdcAmount(readyBalance),
    isLoading: isLoadingCount || isLoadingBatch,
    error: countError || batchError,
    refetch,
  };
}

// =============================================================================
// CONTRACT ESCROW LIST (for modal — via wagmi hooks, no publicClient)
// =============================================================================

export interface ContractEscrowItem {
  escrowId: number;
  depositor: Address;
  recipient: Address;
  amount: bigint;
  /** The raw stored status */
  status: EscrowStatus;
  /** The effective status (accounts for expired windows) */
  effectiveStatus: EscrowStatus;
  createdAt: number;
  acceptedAt: number;
  disputedAt: number;
  feeBps: number;
  feeRecipient: Address;
  /** Is the current wallet the recipient? */
  isRecipient: boolean;
  /** Can recipient withdraw right now? (from contract) */
  canRecipientWithdraw: boolean;
  /** Can depositor withdraw/reclaim right now? (from contract) */
  canDepositorWithdraw: boolean;
  /** accept deadline timestamp (seconds) */
  acceptDeadline: number;
  /** dispute deadline timestamp (seconds), 0 if not accepted */
  disputeDeadline: number;
}

/**
 * Hook that reads every escrow from the contract where the connected wallet
 * is either depositor or recipient.
 *
 * Uses wagmi useReadContract + useReadContracts — NO publicClient.
 *
 * Step 1: read escrow count
 * Step 2: batch-read all escrows via useReadContracts
 * Step 3: for relevant escrows, batch-read effectiveStatus + canRecipientWithdraw + canDepositorWithdraw
 */
export function useContractEscrows(walletAddress?: Address) {
  const escrowAddress = getContractAddress();
  const ACCEPT_WINDOW = 24 * 60 * 60;
  const DISPUTE_WINDOW = 48 * 60 * 60;

  // Step 1: get escrow count
  const {
    data: escrowCount,
    isLoading: isLoadingCount,
    error: countError,
    refetch: refetchCount,
  } = useReadContract({
    address: escrowAddress,
    abi: KORU_ESCROW_ABI,
    functionName: "getEscrowCount",
    query: {
      refetchInterval: 30_000,
    },
  });

  const count = escrowCount !== undefined ? Number(escrowCount) : 0;

  // Step 2: batch-read ALL escrows
  const escrowContracts = useMemo(() => {
    if (count === 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      address: escrowAddress,
      abi: KORU_ESCROW_ABI,
      functionName: "getEscrow" as const,
      args: [BigInt(i)] as const,
    }));
  }, [count, escrowAddress]);

  const {
    data: allEscrowsData,
    isLoading: isLoadingEscrows,
    error: escrowsError,
    refetch: refetchEscrows,
  } = useReadContracts({
    contracts: escrowContracts,
    query: {
      enabled: count > 0 && !!walletAddress,
      refetchInterval: 30_000,
    },
  });

  // Filter to only escrows relevant to this wallet (active statuses)
  const relevantIds = useMemo(() => {
    if (!allEscrowsData || !walletAddress) return [];
    const normalizedWallet = walletAddress.toLowerCase();
    const ids: number[] = [];
    const activeStatuses = [
      EscrowStatus.Pending,
      EscrowStatus.Accepted,
      EscrowStatus.Released,
      EscrowStatus.Disputed,
    ];
    for (let i = 0; i < allEscrowsData.length; i++) {
      const result = allEscrowsData[i];
      if (result?.status !== "success" || !result.result) continue;
      const escrow = result.result as Escrow;
      if (!activeStatuses.includes(escrow.status)) continue;
      const isDepositor = escrow.depositor.toLowerCase() === normalizedWallet;
      const isRecipient = escrow.recipient.toLowerCase() === normalizedWallet;
      if (isDepositor || isRecipient) ids.push(i);
    }
    return ids;
  }, [allEscrowsData, walletAddress]);

  // Step 3: for each relevant escrow, batch-read effectiveStatus + canRecipientWithdraw + canDepositorWithdraw
  const detailContracts = useMemo(() => {
    if (relevantIds.length === 0) return [];
    const calls = [];
    for (const id of relevantIds) {
      calls.push({
        address: escrowAddress,
        abi: KORU_ESCROW_ABI,
        functionName: "getEffectiveStatus" as const,
        args: [BigInt(id)] as const,
      });
      calls.push({
        address: escrowAddress,
        abi: KORU_ESCROW_ABI,
        functionName: "canRecipientWithdraw" as const,
        args: [BigInt(id)] as const,
      });
      calls.push({
        address: escrowAddress,
        abi: KORU_ESCROW_ABI,
        functionName: "canDepositorWithdraw" as const,
        args: [BigInt(id)] as const,
      });
    }
    return calls;
  }, [relevantIds, escrowAddress]);

  const {
    data: detailData,
    isLoading: isLoadingDetails,
    error: detailsError,
    refetch: refetchDetails,
  } = useReadContracts({
    contracts: detailContracts,
    query: {
      enabled: relevantIds.length > 0,
      refetchInterval: 30_000,
    },
  });

  // Step 4: assemble final items
  const escrows = useMemo(() => {
    if (!allEscrowsData || !detailData || !walletAddress) return [];
    const normalizedWallet = walletAddress.toLowerCase();
    const items: ContractEscrowItem[] = [];

    for (let idx = 0; idx < relevantIds.length; idx++) {
      const escrowId = relevantIds[idx];
      const escrowResult = allEscrowsData[escrowId];
      if (escrowResult?.status !== "success" || !escrowResult.result) continue;

      const escrow = escrowResult.result as Escrow;

      const effectiveStatusResult = detailData[idx * 3];
      const canRecipientResult = detailData[idx * 3 + 1];
      const canDepositorResult = detailData[idx * 3 + 2];

      const effectiveStatus =
        effectiveStatusResult?.status === "success"
          ? (Number(effectiveStatusResult.result) as EscrowStatus)
          : escrow.status;
      const canRecipient =
        canRecipientResult?.status === "success"
          ? (canRecipientResult.result as boolean)
          : false;
      const canDepositor =
        canDepositorResult?.status === "success"
          ? (canDepositorResult.result as boolean)
          : false;

      const isRecipient = escrow.recipient.toLowerCase() === normalizedWallet;

      const acceptDeadline = escrow.createdAt + ACCEPT_WINDOW;
      const disputeDeadline =
        escrow.acceptedAt > 0 ? escrow.acceptedAt + DISPUTE_WINDOW : 0;

      items.push({
        escrowId,
        depositor: escrow.depositor,
        recipient: escrow.recipient,
        amount: escrow.amount,
        status: escrow.status,
        effectiveStatus,
        createdAt: escrow.createdAt,
        acceptedAt: escrow.acceptedAt,
        disputedAt: escrow.disputedAt,
        feeBps: escrow.feeBps,
        feeRecipient: escrow.feeRecipient,
        isRecipient,
        canRecipientWithdraw: canRecipient,
        canDepositorWithdraw: canDepositor,
        acceptDeadline,
        disputeDeadline,
      });
    }

    // Sort newest first
    items.sort((a, b) => b.createdAt - a.createdAt);
    return items;
  }, [allEscrowsData, detailData, walletAddress, relevantIds]);

  const isLoading = isLoadingCount || isLoadingEscrows || isLoadingDetails;
  const error = countError || escrowsError || detailsError;

  const refetch = useCallback(() => {
    refetchCount();
    refetchEscrows();
    refetchDetails();
  }, [refetchCount, refetchEscrows, refetchDetails]);

  return {
    escrows,
    isLoading,
    error,
    refetch,
  };
}
