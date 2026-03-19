import React, { useState } from "react";
import { useSmartMoney } from "@/context/SmartMoneyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FundCreator: React.FC = () => {
  const { createFund, users } = useSmartMoney();
  const [token, setToken] = useState("mUSDC");
  const [maxAmount, setMaxAmount] = useState("100");
  const [category, setCategory] = useState("food");
  const [receiver, setReceiver] = useState("0xFoodVendor");
  const [expiryDays, setExpiryDays] = useState("7");
  const [maxUsage, setMaxUsage] = useState("10");
  const [assignTo, setAssignTo] = useState("user-1");
  const [initialAmount, setInitialAmount] = useState("1000");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    createFund({
      amount: parseFloat(initialAmount) || 0, // Starts with allocated amount
      ownerId: assignTo,
      rules: {
        allowedReceiver: receiver,
        category,
        expiry: new Date(Date.now() + parseInt(expiryDays) * 86400000).toISOString(),
        maxUsage: parseInt(maxUsage) || 1,
        maxAmount: parseFloat(maxAmount) || 100,
      },
    });

    toast.success("Smart Fund 'Food Allowance' created successfully!");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Smart Fund Creator</h1>
      <p className="text-sm text-muted-foreground mb-6">Demo Step 1: Admin defines rules and creates the fund.</p>

      <form onSubmit={handleCreate} className="max-w-xl space-y-5">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Token</Label>
              <Input value={token} onChange={(e) => setToken(e.target.value)} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label className="text-xs font-medium">Assign To</Label>
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring"
              >
                {users.filter((u) => u.role === "user").map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Allowed Vendor Address</Label>
            <Input value={receiver} onChange={(e) => setReceiver(e.target.value)} className="mt-1 font-mono text-sm" />
          </div>

          <div>
            <Label className="text-xs font-medium">Fund Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring"
            >
              <option value="food">Food Allowance</option>
              <option value="rent">Rent Allowance</option>
              <option value="travel">Travel & Transport</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Initial Amount (mUSDC)</Label>
              <Input type="number" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Max Limit / Tx (mUSDC)</Label>
              <Input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Total Usage Limit</Label>
              <Input type="number" value={maxUsage} onChange={(e) => setMaxUsage(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Expiry (days)</Label>
              <Input type="number" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full text-md font-semibold py-6">
          Create & Deploy Smart Fund
        </Button>
      </form>
    </div>
  );
};

export default FundCreator;

