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
  attemptPayment: (fundId: string, receiverName: string, amount: number) => Transaction;
}

const DEMO_USERS: AppUser[] = [
  { id: "admin-1", name: "Admin Controller", role: "admin" },
  { id: "user-1", name: "Rahul Sharma", role: "user" },
  { id: "vendor-1", name: "Landlord (Mr. Patel)", role: "vendor" },
  { id: "vendor-2", name: "Friend (Amit)", role: "vendor" },
];

const SmartMoneyContext = createContext<SmartMoneyContextType | null>(null);

export const useSmartMoney = () => {
  const ctx = useContext(SmartMoneyContext);
  if (!ctx) throw new Error("useSmartMoney must be used within SmartMoneyProvider");
  return ctx;
};

export const SmartMoneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser>(DEMO_USERS[0]);
  const [funds, setFunds] = useState<SmartFund[]>([
    {
      id: "fund-1",
      amount: 5000,
      remainingBalance: 5000,
      ownerId: "user-1",
      rules: {
        allowedReceiver: "Landlord (Mr. Patel)",
        category: "rent",
        expiry: new Date(Date.now() + 30 * 86400000).toISOString(),
        maxUsage: 1,
      },
      createdAt: new Date().toISOString(),
    },
  ]);
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
          ? `Receiver "${receiverName}" matches allowed receiver`
          : `Receiver "${receiverName}" not allowed. Expected: "${fund.rules.allowedReceiver}"`,
      });
      if (!receiverMatch) allPassed = false;

      // Check expiry
      const notExpired = new Date(fund.rules.expiry) > new Date();
      checks.push({
        rule: "Expiry Check",
        passed: notExpired,
        detail: notExpired ? "Fund has not expired" : "Fund has expired",
      });
      if (!notExpired) allPassed = false;

      // Check balance
      const hasBalance = fund.remainingBalance >= amount;
      checks.push({
        rule: "Balance Check",
        passed: hasBalance,
        detail: hasBalance
          ? `Sufficient balance: ₹${fund.remainingBalance}`
          : `Insufficient balance: ₹${fund.remainingBalance} < ₹${amount}`,
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
          : `Max usage reached: ${usageCount}/${fund.rules.maxUsage}`,
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
          ? `Smart Contract Approved — ₹${amount} transferred to ${receiverName} via UPI`
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

  return (
    <SmartMoneyContext.Provider
      value={{ currentUser, setCurrentUser, users: DEMO_USERS, funds, transactions, createFund, attemptPayment }}
    >
      {children}
    </SmartMoneyContext.Provider>
  );
};
