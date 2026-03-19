import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "user" | "vendor";

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface FundRule {
  allowedReceiver: string;
  category: string;
  expiry: string; // ISO date
  maxUsage: number;
  maxAmount: number;
}

export interface SmartFund {
  id: string;
  amount: number;
  remainingBalance: number;
  ownerId: string;
  rules: FundRule;
  createdAt: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverName: string;
  amount: number;
  fundId: string;
  status: "approved" | "rejected";
  reason: string;
  timestamp: string;
  ruleChecks: RuleCheck[];
  hash?: string;
}

export interface RuleCheck {
  rule: string;
  passed: boolean;
  detail: string;
}

interface SmartMoneyContextType {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  users: AppUser[];
  funds: SmartFund[];
  transactions: Transaction[];
  createFund: (fund: Omit<SmartFund, "id" | "createdAt" | "remainingBalance">) => void;
  deposit: (fundId: string, amount: number) => void;
  attemptPayment: (fundId: string, receiverName: string, amount: number) => Transaction;
  forceExpire: (fundId: string) => void;
  updateTransaction: (txId: string, hash: string) => void;
}

const DEMO_USERS: AppUser[] = [
  { id: "admin-1", name: "Admin Controller", role: "admin" },
  { id: "user-1", name: "Demo User", role: "user" },
  { id: "vendor-1", name: "0xFoodVendor", role: "vendor" },
  { id: "vendor-2", name: "0xLandlordWallet", role: "vendor" },
  { id: "vendor-3", name: "Unknown Person", role: "vendor" },
];

const SmartMoneyContext = createContext<SmartMoneyContextType | null>(null);

export const useSmartMoney = () => {
  const ctx = useContext(SmartMoneyContext);
  if (!ctx) throw new Error("useSmartMoney must be used within SmartMoneyProvider");
  return ctx;
};

export const SmartMoneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser>(DEMO_USERS[0]);
  const [funds, setFunds] = useState<SmartFund[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const createFund = useCallback((fund: Omit<SmartFund, "id" | "createdAt" | "remainingBalance">) => {
    const newFund: SmartFund = {
      ...fund,
      id: `fund-${Date.now()}`,
      remainingBalance: fund.amount,
      createdAt: new Date().toISOString(),
    };
    setFunds((prev) => [...prev, newFund]);
  }, []);

  const deposit = useCallback((fundId: string, amount: number) => {
    setFunds((prev) => prev.map((f) => 
      f.id === fundId ? { ...f, amount: f.amount + amount, remainingBalance: f.remainingBalance + amount } : f
    ));
  }, []);

  const forceExpire = useCallback((fundId: string) => {
    setFunds((prev) => prev.map((f) => 
      f.id === fundId ? { ...f, rules: { ...f.rules, expiry: new Date(Date.now() - 100000).toISOString() } } : f
    ));
  }, []);

  const attemptPayment = useCallback(
    (fundId: string, receiverName: string, amount: number): Transaction => {
      const fund = funds.find((f) => f.id === fundId);
      if (!fund) throw new Error("Fund not found");

      const checks: RuleCheck[] = [];
      let allPassed = true;

      // Check receiver
      const receiverMatch = fund.rules.allowedReceiver.toLowerCase() === receiverName.toLowerCase();
      checks.push({
        rule: "Allowed Receiver",
        passed: receiverMatch,
        detail: receiverMatch
          ? `Receiver "${receiverName}" matches allowed vendor`
          : `Vendor not approved. Expected: "${fund.rules.allowedReceiver}"`,
      });
      if (!receiverMatch) allPassed = false;

      // Check max amount
      const validAmount = amount <= fund.rules.maxAmount;
      checks.push({
        rule: "Max Tx Amount",
        passed: validAmount,
        detail: validAmount
          ? `Amount ${amount} does not exceed transaction max (${fund.rules.maxAmount})`
          : `Amount exceeds maximum allowed (${fund.rules.maxAmount})`,
      });
      if (!validAmount) allPassed = false;

      // Check expiry
      const notExpired = new Date(fund.rules.expiry) > new Date();
      checks.push({
        rule: "Expiry Check",
        passed: notExpired,
        detail: notExpired ? "Fund has not expired" : "Fund expired",
      });
      if (!notExpired) allPassed = false;

      // Check balance
      const hasBalance = fund.remainingBalance >= amount;
      checks.push({
        rule: "Balance Check",
        passed: hasBalance,
        detail: hasBalance
          ? `Sufficient balance: ₹${fund.remainingBalance}`
          : `Insufficient fund balance: ₹${fund.remainingBalance} < ₹${amount}`,
      });
      if (!hasBalance) allPassed = false;

      // Check usage
      const usageCount = transactions.filter((t) => t.fundId === fundId && t.status === "approved").length;
      const withinUsage = usageCount < fund.rules.maxUsage;
      checks.push({
        rule: "Max Usage",
        passed: withinUsage,
        detail: withinUsage
          ? `Usage ${usageCount}/${fund.rules.maxUsage}`
          : `Max usage limit reached: ${usageCount}/${fund.rules.maxUsage}`,
      });
      if (!withinUsage) allPassed = false;

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        senderId: currentUser.id,
        receiverName,
        amount,
        fundId,
        status: allPassed ? "approved" : "rejected",
        reason: allPassed
          ? `Smart Contract Approved — ${amount} USDC transferred to ${receiverName}`
          : `Transaction Rejected by Contract — ${checks.find((c) => !c.passed)?.detail}`,
        timestamp: new Date().toISOString(),
        ruleChecks: checks,
      };

      setTransactions((prev) => [tx, ...prev]);

      if (allPassed) {
        setFunds((prev) =>
          prev.map((f) =>
            f.id === fundId ? { ...f, remainingBalance: f.remainingBalance - amount } : f
          )
        );
      }

      return tx;
    },
    [funds, transactions, currentUser]
  );

  const updateTransaction = useCallback((txId: string, hash: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, hash, reason: `${t.reason} (Tx Hash: ${hash})` } : t))
    );
  }, []);

  return (
    <SmartMoneyContext.Provider
      value={{ currentUser, setCurrentUser, users: DEMO_USERS, funds, transactions, createFund, deposit, forceExpire, attemptPayment, updateTransaction }}
    >
      {children}
    </SmartMoneyContext.Provider>
  );
};
