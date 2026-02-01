import { Address } from "viem";

// Contract addresses per chain
export const KORU_ESCROW_ADDRESSES: Record<number, Address> = {
  8453: "0x0000000000000000000000000000000000000000" as Address, // Base Mainnet - TODO: Deploy
  84532: "0xef6B722516f9D8aDbA594311DE72bfCfa57b9683" as Address, // Base Sepolia
};

// USDC addresses per chain
export const USDC_ADDRESSES: Record<number, Address> = {
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address, // Base Mainnet
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address, // Base Sepolia
};

// Escrow Status enum matching the contract
export enum EscrowStatus {
  Pending = 0,
  Accepted = 1,
  Released = 2,
  Disputed = 3,
  Completed = 4,
  Cancelled = 5,
  Expired = 6,
}

export const STATUS_LABELS: Record<EscrowStatus, string> = {
  [EscrowStatus.Pending]: "Pending",
  [EscrowStatus.Accepted]: "Accepted",
  [EscrowStatus.Released]: "Released",
  [EscrowStatus.Disputed]: "Disputed",
  [EscrowStatus.Completed]: "Completed",
  [EscrowStatus.Cancelled]: "Cancelled",
  [EscrowStatus.Expired]: "Expired",
};

// Escrow data structure (uint48 values come back as number from viem)
export interface Escrow {
  depositor: Address;
  createdAt: number;
  acceptedAt: number;
  recipient: Address;
  disputedAt: number;
  status: EscrowStatus;
  feeBps: number;
  feeRecipient: Address;
  amount: bigint;
}

export interface Deadlines {
  acceptDeadline: bigint;
  disputeDeadline: bigint;
}

// Contract ABI - only include functions we need
export const KORU_ESCROW_ABI = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "ACCEPT_WINDOW",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BPS_DENOMINATOR",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "COUNTER_DISPUTE_WINDOW",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "DISPUTE_WINDOW",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "EMERGENCY_UNLOCK_PERIOD",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_ESCROW_AMOUNT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_FEE_BPS",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MIN_ESCROW_AMOUNT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "accept",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "calculateFee",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "fee", type: "uint256", internalType: "uint256" },
      { name: "netAmount", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canAccept",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canDepositorWithdraw",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canDispute",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canRecipientWithdraw",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cancel",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "counterDispute",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createEscrow",
    inputs: [
      { name: "recipient", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "dispute",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "emergencyWithdrawDisputed",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "feeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint96", internalType: "uint96" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeRecipient",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDeadlines",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "deadlines",
        type: "tuple",
        internalType: "struct IKoruEscrow.Deadlines",
        components: [
          { name: "acceptDeadline", type: "uint256", internalType: "uint256" },
          { name: "disputeDeadline", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEffectiveStatus",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "", type: "uint8", internalType: "enum IKoruEscrow.Status" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEscrow",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IKoruEscrow.Escrow",
        components: [
          { name: "depositor", type: "address", internalType: "address" },
          { name: "createdAt", type: "uint48", internalType: "uint48" },
          { name: "acceptedAt", type: "uint48", internalType: "uint48" },
          { name: "recipient", type: "address", internalType: "address" },
          { name: "disputedAt", type: "uint48", internalType: "uint48" },
          {
            name: "status",
            type: "uint8",
            internalType: "enum IKoruEscrow.Status",
          },
          { name: "feeBps", type: "uint16", internalType: "uint16" },
          { name: "feeRecipient", type: "address", internalType: "address" },
          { name: "amount", type: "uint96", internalType: "uint96" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEscrowCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStatus",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "", type: "uint8", internalType: "enum IKoruEscrow.Status" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasCounterDisputed",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      { name: "_usdc", type: "address", internalType: "address" },
      { name: "_feeBps", type: "uint256", internalType: "uint256" },
      { name: "_feeRecipient", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "release",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveDispute",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "winner", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFee",
    inputs: [{ name: "newFeeBps", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeRecipient",
    inputs: [
      { name: "newFeeRecipient", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      { name: "newImplementation", type: "address", internalType: "address" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BalanceChanged",
    inputs: [
      { name: "user", type: "address", indexed: true, internalType: "address" },
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "balanceType",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeResolved",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "winner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "resolver",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      { name: "fee", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EmergencyWithdrawal",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "depositor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "depositorAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "recipientAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowAccepted",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "acceptedAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "disputeDeadline",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowCancelled",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "depositor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "refundAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowCounterDisputed",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "counterDisputedAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowCreated",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "depositor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "acceptDeadline",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowDisputed",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "depositor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "disputedAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowExpired",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "expiredAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowReleased",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "depositor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "releasedAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EscrowWithdrawn",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "withdrawer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      { name: "fee", type: "uint256", indexed: false, internalType: "uint256" },
      {
        name: "netAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "isDepositorWithdraw",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeeRecipientUpdated",
    inputs: [
      {
        name: "oldRecipient",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "newRecipient",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeeUpdated",
    inputs: [
      {
        name: "oldFeeBps",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newFeeBps",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferInitiated",
    inputs: [
      {
        name: "currentOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "pendingOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Paused",
    inputs: [
      { name: "by", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [
      { name: "by", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UpgradeAuthorized",
    inputs: [
      {
        name: "proxy",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newImplementation",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "authorizer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AcceptDeadlineNotReached",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "current", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "AcceptDeadlinePassed",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "current", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [{ name: "target", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "AlreadyCounterDisputed",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "AmountTooHigh",
    inputs: [
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "maxAmount", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "AmountTooLow",
    inputs: [
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "minAmount", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "CannotWithdraw",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
  },
  { type: "error", name: "ContractNotPaused", inputs: [] },
  { type: "error", name: "ContractPaused", inputs: [] },
  {
    type: "error",
    name: "CounterDisputeWindowPassed",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "current", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "DisputeDeadlineNotReached",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "current", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "DisputeDeadlinePassed",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "current", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      { name: "implementation", type: "address", internalType: "address" },
    ],
  },
  { type: "error", name: "ERC1967NonPayable", inputs: [] },
  {
    type: "error",
    name: "EscrowNotFound",
    inputs: [{ name: "escrowId", type: "uint256", internalType: "uint256" }],
  },
  { type: "error", name: "EthNotAccepted", inputs: [] },
  { type: "error", name: "FailedCall", inputs: [] },
  {
    type: "error",
    name: "FeeTooHigh",
    inputs: [
      { name: "fee", type: "uint256", internalType: "uint256" },
      { name: "maxFee", type: "uint256", internalType: "uint256" },
    ],
  },
  { type: "error", name: "InvalidERC20", inputs: [] },
  { type: "error", name: "InvalidInitialization", inputs: [] },
  {
    type: "error",
    name: "InvalidStatus",
    inputs: [
      { name: "escrowId", type: "uint256", internalType: "uint256" },
      { name: "currentStatus", type: "uint8", internalType: "uint8" },
      { name: "requiredStatus", type: "uint8", internalType: "uint8" },
    ],
  },
  {
    type: "error",
    name: "InvalidWinner",
    inputs: [{ name: "winner", type: "address", internalType: "address" }],
  },
  { type: "error", name: "NotAContract", inputs: [] },
  { type: "error", name: "NotDepositor", inputs: [] },
  { type: "error", name: "NotInitializing", inputs: [] },
  { type: "error", name: "NotOwner", inputs: [] },
  { type: "error", name: "NotParticipant", inputs: [] },
  { type: "error", name: "NotPendingOwner", inputs: [] },
  { type: "error", name: "NotRecipient", inputs: [] },
  { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "SelfEscrow", inputs: [] },
  { type: "error", name: "UUPSUnauthorizedCallContext", inputs: [] },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }],
  },
  { type: "error", name: "ZeroAddress", inputs: [] },
] as const;

// ERC20 ABI for USDC approval
export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;
