import React from "react";
import { useSmartFund } from "@/context/SmartFundContext";
import { CheckCircle2, XCircle } from "lucide-react";

const TransactionLog: React.FC = () => {
  const { transactions } = useSmartFund();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Transaction Log</h1>
      <p className="text-sm text-muted-foreground mb-6">Immutable record of all smart contract decisions.</p>

      {transactions.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
          No transactions yet. Try making a payment first.
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {tx.status === "approved" ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      ₹{tx.amount.toLocaleString()} → {tx.receiverName}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.reason}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    tx.status === "approved"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              {/* Rule details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tx.ruleChecks.map((check, i) => (
                  <div
                    key={i}
                    className={`text-[10px] rounded px-2 py-1.5 font-medium ${
                      check.passed
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {check.passed ? "✓" : "✗"} {check.rule}
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground mt-2">
                {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionLog;
