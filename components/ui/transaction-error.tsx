"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TransactionError } from "@/lib/utils/transaction-utils";
import { getErrorAction, formatTransactionErrorMessage } from "@/lib/utils/transaction-utils";
import Link from "next/link";

interface TransactionErrorProps {
  error: TransactionError;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function TransactionErrorAlert({
  error,
  onDismiss,
  onRetry,
  className,
}: TransactionErrorProps) {
  const errorAction = getErrorAction(error);
  const message = formatTransactionErrorMessage(error);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "rounded-2xl border-2 p-6 shadow-lg",
          error.isInsufficientFunds
            ? "border-red-500/50 bg-red-50/80 dark:bg-red-950/20 dark:border-red-500/30"
            : error.isUserRejected
            ? "border-yellow-500/50 bg-yellow-50/80 dark:bg-yellow-950/20 dark:border-yellow-500/30"
            : "border-orange-500/50 bg-orange-50/80 dark:bg-orange-950/20 dark:border-orange-500/30",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "rounded-full p-2 shrink-0",
              error.isInsufficientFunds
                ? "bg-red-100 dark:bg-red-900/30"
                : error.isUserRejected
                ? "bg-yellow-100 dark:bg-yellow-900/30"
                : "bg-orange-100 dark:bg-orange-900/30"
            )}
          >
            {error.isInsufficientFunds ? (
              <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold mb-2",
                error.isInsufficientFunds
                  ? "text-red-900 dark:text-red-100"
                  : "text-orange-900 dark:text-orange-100"
              )}
            >
              {error.isInsufficientFunds
                ? "Insufficient Funds"
                : error.isUserRejected
                ? "Transaction Cancelled"
                : "Transaction Failed"}
            </h3>
            <p
              className={cn(
                "text-sm mb-4",
                error.isInsufficientFunds
                  ? "text-red-800 dark:text-red-200"
                  : "text-orange-800 dark:text-orange-200"
              )}
            >
              {message}
            </p>

            {errorAction && (
              <div className="flex flex-wrap gap-3">
                {error.isInsufficientFunds && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open wallet or bridge to add funds
                      window.open("https://bridge.arbitrum.io/", "_blank");
                    }}
                    className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                )}

                {onRetry && !error.isInsufficientFunds && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/30"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {errorAction.action}
                  </Button>
                )}

                {errorAction.link && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={errorAction.link}>
                      {errorAction.action}
                    </Link>
                  </Button>
                )}

                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="ml-auto"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

