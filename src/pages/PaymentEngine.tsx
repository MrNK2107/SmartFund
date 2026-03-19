import React, { useState } from "react";
import { useSmartMoney, Transaction } from "@/context/SmartMoneyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Zap } from "lucide-react";

const PaymentEngine: React.FC = () => {
  const { funds, currentUser, attemptPayment } = useSmartMoney();
  const userFunds = funds.filter((f) => f.ownerId === currentUser.id);

  const [selectedFund, setSelectedFund] = useState(userFunds[0]?.id || "");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<Transaction | null>(null);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund || !receiver || !amount) return;
    const tx = attemptPayment(selectedFund, receiver, parseFloat(amount));
    setResult(tx);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Payment Engine</h1>
      <p className="text-sm text-muted-foreground mb-6">Attempt a transaction — rules decide if it goes through.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <form onSubmit={handlePay} className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Transaction Details
          </h3>

          <div>
            <Label className="text-xs font-medium">Select Fund</Label>
            <select
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring"
            >
              {userFunds.map((f) => (
                <option key={f.id} value={f.id}>
                  ₹{f.remainingBalance.toLocaleString()} — {f.rules.category} ({f.rules.allowedReceiver})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium">Receiver Name</Label>
            <Input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="e.g. Landlord (Mr. Patel)" className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-medium">Amount (₹)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" className="mt-1" />
          </div>

          <Button type="submit" className="w-full">
            Execute Smart Payment
          </Button>

          {/* Quick demo buttons */}
          <div className="pt-2 border-t space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Quick Demo</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs flex-1"
                onClick={() => {
                  setReceiver("Landlord (Mr. Patel)");
                  setAmount("5000");
                }}
              >
                ✅ Valid Payment
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs flex-1"
                onClick={() => {
                  setReceiver("Friend (Amit)");
                  setAmount("5000");
                }}
              >
                ❌ Invalid Payment
              </Button>
            </div>
          </div>
        </form>

        {/* Rule Checklist Result */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-sm mb-4">Smart Contract Validation</h3>

          {!result ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
              <Zap className="h-8 w-8 mb-2 opacity-30" />
              <p>Execute a payment to see validation results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status banner */}
              <div
                className={`rounded-lg p-4 text-sm font-medium ${
                  result.status === "approved"
                    ? "bg-success/10 text-success animate-pulse-success"
                    : "bg-destructive/10 text-destructive animate-pulse-destructive"
                }`}
              >
                {result.reason}
              </div>

              {/* Rule checks */}
              <div className="space-y-2">
                {result.ruleChecks.map((check, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-md border px-4 py-3"
                  >
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold">{check.rule}</p>
                      <p className="text-xs text-muted-foreground">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentEngine;
