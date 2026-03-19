import React, { useState } from "react";
import { useSmartMoney } from "@/context/SmartMoneyContext";
import { Lock, Clock, User, Tag, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SmartWallet: React.FC = () => {
  const { funds, currentUser, deposit } = useSmartMoney();
  const userFunds = funds.filter((f) => f.ownerId === currentUser.id);

  const [isDepositing, setIsDepositing] = useState<string | null>(null);

  const handleDeposit = async (id: string) => {
    setIsDepositing(id);
    
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const { ethers } = await import("ethers");
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        const txRes = await signer.sendTransaction({ to: await signer.getAddress(), value: 0 });
        deposit(id, 500);
        toast.success(`500 mUSDC deposited! (Tx Hash: ${txRes.hash})`, {
            action: { label: "View on Etherscan", onClick: () => window.open(`https://sepolia.etherscan.io/tx/${txRes.hash}`, "_blank") },
            duration: 5000,
        });
      } catch (err: any) {
        if (err.code === "ACTION_REJECTED") {
          toast.error("Deposit rejected in MetaMask.");
        } else {
          console.error("MetaMask Tx Failed. Using demo mode fallback.", err);
          deposit(id, 500);
          toast.success("500 mUSDC deposited successfully! (Demo mode)");
        }
      } finally {
        setIsDepositing(null);
      }
    } else {
      console.warn("No MetaMask found. Using demo mode fallback.");
      deposit(id, 500);
      toast.success("500 mUSDC deposited successfully! (Demo mode)");
      setIsDepositing(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Smart Wallet</h1>
      <p className="text-sm text-muted-foreground mb-6">Demo Step 2: Deposit funds into the allowance.</p>

      {userFunds.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No smart funds assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {userFunds.map((fund) => {
            const pct = fund.amount > 0 ? (fund.remainingBalance / fund.amount) * 100 : 0;
            const expired = new Date(fund.rules.expiry) < new Date();
            const daysLeft = Math.max(0, Math.ceil((new Date(fund.rules.expiry).getTime() - Date.now()) / 86400000));

            return (
              <div
                key={fund.id}
                className="rounded-lg border bg-card p-6 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl font-semibold">{fund.remainingBalance.toLocaleString()} mUSDC</p>
                    <p className="text-xs text-muted-foreground">
                      of {fund.amount.toLocaleString()} mUSDC allocated
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        expired ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      }`}
                    >
                      {expired ? "Expired" : "Restricted"}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => handleDeposit(fund.id)} className="text-xs" disabled={isDepositing === fund.id}>
                      <PlusCircle className={`mr-1 h-3 w-3 ${isDepositing === fund.id ? "animate-spin" : ""}`} /> 
                      {isDepositing === fund.id ? "Depositing..." : "Deposit 500 mUSDC"}
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-5">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Category: <span className="font-medium text-foreground capitalize">{fund.rules.category}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>To: <span className="font-medium text-foreground">{fund.rules.allowedReceiver}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {expired ? "Expired" : `${daysLeft} days left`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Max {fund.rules.maxAmount} mUSDC / tx</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartWallet;
