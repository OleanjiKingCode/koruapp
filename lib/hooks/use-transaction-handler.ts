"use client";

import { useState, useCallback } from "react";
import {
  parseTransactionError,
  safeTransaction,
  type TransactionError,
  getErrorAction,
} from "@/lib/utils/transaction-utils";

interface UseTransactionHandlerOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: TransactionError) => void;
}

export function useTransactionHandler(options?: UseTransactionHandlerOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TransactionError | null>(null);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const executeTransaction = useCallback(
    async <T,>(transactionFn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      const result = await safeTransaction(transactionFn, (err) => {
        setError(err);
        if (options?.onError) {
          options.onError(err);
        }
      });

      setIsLoading(false);

      if (result.success && result.data) {
        setLastTransaction(result.data);
        if (options?.onSuccess) {
          options.onSuccess(result.data);
        }
        return result.data;
      }

      return null;
    },
    [options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const errorAction = error ? getErrorAction(error) : null;

  return {
    executeTransaction,
    isLoading,
    error,
    errorAction,
    clearError,
    lastTransaction,
  };
}

