import React, { useState } from "react";
import { useSmartMoney } from "@/context/SmartMoneyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FundCreator: React.FC = () => {
  const { createFund, users } = useSmartMoney();
  const [amount, setAmount] = useState("5000");
  const [category, setCategory] = useState("rent");
  const [receiver, setReceiver] = useState("Landlord (Mr. Patel)");
  const [expiryDays, setExpiryDays] = useState("30");
  const [maxUsage, setMaxUsage] = useState("1");
  const [assignTo, setAssignTo] = useState("user-1");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    createFund({
      amount: amt,
      ownerId: assignTo,
      rules: {
        allowedReceiver: receiver,
        category,
        expiry: new Date(Date.now() + parseInt(expiryDays) * 86400000).toISOString(),
        maxUsage: parseInt(maxUsage) || 1,
      },
    });

    toast.success("Smart Fund created successfully");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Smart Fund Creator</h1>
      <p className="text-sm text-muted-foreground mb-6">Define rules and allocate restricted funds.</p>

      <form onSubmit={handleCreate} className="max-w-lg space-y-5">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <Label className="text-xs font-medium">Amount (₹)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-medium">Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring"
            >
              <option value="rent">Rent</option>
              <option value="food">Food</option>
              <option value="education">Education</option>
              <option value="medical">Medical</option>
              <option value="utilities">Utilities</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium">Allowed Receiver</Label>
            <Input value={receiver} onChange={(e) => setReceiver(e.target.value)} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Expiry (days)</Label>
              <Input type="number" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Max Usage</Label>
              <Input type="number" value={maxUsage} onChange={(e) => setMaxUsage(e.target.value)} className="mt-1" />
            </div>
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

        <Button type="submit" className="w-full">Create Smart Fund</Button>
      </form>
    </div>
  );
};

export default FundCreator;
