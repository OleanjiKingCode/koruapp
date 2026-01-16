/**
 * Transaction utilities for handling blockchain transactions
 * with proper error handling, especially for insufficient funds
 */

export interface TransactionError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  isInsufficientFunds: boolean;
  isUserRejected: boolean;
  isNetworkError: boolean;
}

/**
 * Parse transaction errors and provide user-friendly messages
 */
export function parseTransactionError(error: any): TransactionError {
  const errorString = error?.message || error?.toString() || "";
  const errorCode = error?.code || error?.error?.code || "";

  // Check for insufficient funds
  if (
    errorString.includes("insufficient funds") ||
    errorString.includes("InsufficientFunds") ||
    errorCode === "INSUFFICIENT_FUNDS" ||
    error?.error?.message?.includes("insufficient funds")
  ) {
    return {
      code: "INSUFFICIENT_FUNDS",
      message: errorString,
      userFriendlyMessage:
        "Insufficient funds. You don't have enough tokens to cover the transaction amount and gas fees. Please add funds to your wallet and try again.",
      isInsufficientFunds: true,
      isUserRejected: false,
      isNetworkError: false,
    };
  }

  // Check for user rejection
  if (
    errorString.includes("User rejected") ||
    errorString.includes("user rejected") ||
    errorString.includes("User denied") ||
    errorCode === "ACTION_REJECTED" ||
    errorCode === 4001
  ) {
    return {
      code: "USER_REJECTED",
      message: errorString,
      userFriendlyMessage:
        "Transaction was cancelled. Please try again when you're ready.",
      isInsufficientFunds: false,
      isUserRejected: true,
      isNetworkError: false,
    };
  }

  // Check for network errors
  if (
    errorString.includes("network") ||
    errorString.includes("Network") ||
    errorString.includes("RPC") ||
    errorCode === "NETWORK_ERROR"
  ) {
    return {
      code: "NETWORK_ERROR",
      message: errorString,
      userFriendlyMessage:
        "Network error. Please check your internet connection and try again. If the problem persists, the network may be experiencing issues.",
      isInsufficientFunds: false,
      isUserRejected: false,
      isNetworkError: true,
    };
  }

  // Generic error
  return {
    code: errorCode || "UNKNOWN_ERROR",
    message: errorString,
    userFriendlyMessage:
      "Transaction failed. Please try again. If the problem persists, contact support.",
    isInsufficientFunds: false,
    isUserRejected: false,
    isNetworkError: false,
  };
}

/**
 * Format error message for display to user
 */
export function formatTransactionErrorMessage(error: TransactionError): string {
  return error.userFriendlyMessage;
}

/**
 * Get helpful action based on error type
 */
export function getErrorAction(error: TransactionError): {
  action: string;
  description: string;
  link?: string;
} {
  if (error.isInsufficientFunds) {
    return {
      action: "Add Funds",
      description:
        "You need to add more tokens to your wallet to complete this transaction.",
      link: "#",
    };
  }

  if (error.isUserRejected) {
    return {
      action: "Try Again",
      description:
        "Please approve the transaction in your wallet when prompted.",
    };
  }

  if (error.isNetworkError) {
    return {
      action: "Retry",
      description:
        "The network may be experiencing issues. Please try again in a moment.",
    };
  }

  return {
    action: "Contact Support",
    description: "If this problem persists, please contact our support team.",
    link: "/contact",
  };
}

/**
 * Safe transaction wrapper that handles errors gracefully
 */
export async function safeTransaction<T>(
  transactionFn: () => Promise<T>,
  onError?: (error: TransactionError) => void
): Promise<{ success: boolean; data?: T; error?: TransactionError }> {
  try {
    const data = await transactionFn();
    return { success: true, data };
  } catch (error: any) {
    const parsedError = parseTransactionError(error);

    if (onError) {
      onError(parsedError);
    }

    return {
      success: false,
      error: parsedError,
    };
  }
}
