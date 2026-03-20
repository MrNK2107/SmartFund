import React from "react";
import { useSmartFund } from "@/context/SmartFundContext";
import { Wallet, ShieldCheck, AlertTriangle, ArrowRightLeft } from "lucide-react";

const Dashboard: React.FC = () => {
  const { funds, transactions, currentUser } = useSmartFund();

  const userFunds = currentUser.role === "admin" ? funds : funds.filter((f) => f.ownerId === currentUser.id);
  const totalFunds = userFunds.reduce((s, f) => s + f.amount, 0);
  const totalRemaining = userFunds.reduce((s, f) => s + f.remainingBalance, 0);
  const approvedTx = transactions.filter((t) => t.status === "approved").length;
  const rejectedTx = transactions.filter((t) => t.status === "rejected").length;

  const stats = [
    { label: "Total Allocated", value: `₹${totalFunds.toLocaleString()}`, icon: Wallet, color: "text-primary" },
    { label: "Remaining Balance", value: `₹${totalRemaining.toLocaleString()}`, icon: ShieldCheck, color: "text-success" },
    { label: "Approved Tx", value: approvedTx.toString(), icon: ArrowRightLeft, color: "text-success" },
    { label: "Rejected Tx", value: rejectedTx.toString(), icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 tracking-tight text-gradient">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">
        SmartFund OS: Programmable money is not transferred unless rules allow it.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card rounded-xl p-5 hover:shadow-[0_0_20px_rgba(79,172,254,0.15)] transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-colors group-hover:bg-primary/10"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</span>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-semibold">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Active Smart Funds */}
      <h2 className="text-xl font-bold mb-4 tracking-tight text-white/90">Active Smart Funds</h2>
      {userFunds.length === 0 ? (
        <p className="text-sm text-muted-foreground">No funds allocated yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userFunds.map((fund) => {
            const pct = (fund.remainingBalance / fund.amount) * 100;
            const expired = new Date(fund.rules.expiry) < new Date();
            return (
              <div
                key={fund.id}
                className="glass-card rounded-xl p-6 hover:shadow-[0_0_25px_rgba(79,172,254,0.1)] transition-all duration-300 relative overflow-hidden group border border-white/5 hover:border-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div>
                    <p className="text-xl font-semibold">₹{fund.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground capitalize">{fund.rules.category} Only</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      expired
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {expired ? "Expired" : "Active"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Receiver</span>
                    <span className="font-medium text-foreground">{fund.rules.allowedReceiver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires</span>
                    <span className="font-medium text-foreground">
                      {new Date(fund.rules.expiry).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Balance bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Remaining</span>
                    <span>₹{fund.remainingBalance.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-4 tracking-tight text-white/90">Recent Transactions</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-black/40 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Receiver</th>
                  <th className="text-left px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="px-4 py-2.5 font-medium">{tx.receiverName}</td>
                    <td className="px-4 py-2.5">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          tx.status === "approved"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
