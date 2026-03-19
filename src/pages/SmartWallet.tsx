import React from "react";
import { useSmartMoney } from "@/context/SmartMoneyContext";
import { Lock, Clock, User, Tag } from "lucide-react";

const SmartWallet: React.FC = () => {
  const { funds, currentUser } = useSmartMoney();
  const userFunds = funds.filter((f) => f.ownerId === currentUser.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Smart Wallet</h1>
      <p className="text-sm text-muted-foreground mb-6">Your restricted spending tokens.</p>

      {userFunds.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No smart funds assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userFunds.map((fund) => {
            const pct = (fund.remainingBalance / fund.amount) * 100;
            const expired = new Date(fund.rules.expiry) < new Date();
            const daysLeft = Math.max(0, Math.ceil((new Date(fund.rules.expiry).getTime() - Date.now()) / 86400000));

            return (
              <div
                key={fund.id}
                className="rounded-lg border bg-card p-6 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl font-semibold">₹{fund.remainingBalance.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      of ₹{fund.amount.toLocaleString()} allocated
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        expired ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      }`}
                    >
                      {expired ? "Expired" : "Restricted"}
                    </span>
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
                    <span>Max uses: {fund.rules.maxUsage}</span>
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
