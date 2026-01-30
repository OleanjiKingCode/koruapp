"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useConnection,
  useBalance,
  useReadContract,
  useReadContracts,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
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
  const { address, isConnected } = useConnection();
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
  const { address, isConnected } = useConnection();
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
 * Hook to accept escrow
 */
export function useAcceptEscrow(escrowId: bigint) {
  const { address, isConnected } = useConnection();
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
  const { address, isConnected } = useConnection();
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
  const { address, isConnected } = useConnection();
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
  const { address, isConnected } = useConnection();
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
  const { address, isConnected } = useConnection();
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
  const { address, isConnected } = useConnection();
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
