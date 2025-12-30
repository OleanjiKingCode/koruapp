"use client";

import { useLocalStorage } from "./use-local-storage";

export interface Transaction {
  id: string;
  type: "payment" | "refund" | "withdrawal";
  amount: number;
  personId: string;
  personName: string;
  personHandle: string;
  slotName: string;
  date: string;
  time: string;
  status: "completed" | "pending" | "refunded";
  createdAt: string;
  expiresAt?: string; // For auto-refund after 24h
  receiptId: string;
}

const DEFAULT_TRANSACTIONS: Transaction[] = [];

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "koru-transactions",
    DEFAULT_TRANSACTIONS
  );

  const addTransaction = (
    transaction: Omit<Transaction, "id" | "createdAt" | "receiptId">
  ) => {
    const now = new Date();
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
      createdAt: now.toISOString(),
      receiptId: `RCP-${Date.now().toString(36).toUpperCase()}`,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  };

  const refundTransaction = (id: string) => {
    updateTransaction(id, { status: "refunded", type: "refund" });
  };

  // Check for auto-refunds (24h expired)
  const checkAutoRefunds = () => {
    const now = new Date();
    transactions.forEach((tx) => {
      if (
        tx.status === "pending" &&
        tx.expiresAt &&
        new Date(tx.expiresAt) < now
      ) {
        refundTransaction(tx.id);
      }
    });
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    refundTransaction,
    checkAutoRefunds,
  };
}






