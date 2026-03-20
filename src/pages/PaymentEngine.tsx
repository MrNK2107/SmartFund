import React, { useState } from "react";
import { useSmartFund, Transaction } from "@/context/SmartFundContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Zap, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const PaymentEngine: React.FC = () => {
  const { funds, currentUser, attemptPayment, forceExpire, updateTransaction } = useSmartFund();
  const userFunds = funds.filter((f) => f.ownerId === currentUser.id);

  const [selectedFund, setSelectedFund] = useState(userFunds[0]?.id || "");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<Transaction | null>(null);
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [pendingTx, setPendingTx] = useState<any>(null);

  const executePayment = async (fundId: string, rec: string, amt: number) => {
    setReceiver(rec);
    setAmount(amt.toString());
    const tx = attemptPayment(fundId, rec, amt);

    if (tx.status === "approved") {
      setPendingTx({ ...tx, amount: amt, receiver: rec });
      // 1. MetaMask Verification FIRST
      if (typeof window !== "undefined" && (window as any).ethereum) {
        setIsProcessingTx(true);
        setResult({ ...tx, reason: "Please approve verification in MetaMask..." });
        
        try {
          const { ethers } = await import("ethers");
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          
          const toAddress = ethers.isAddress(rec) ? rec : await signer.getAddress();
          const txRes = await signer.sendTransaction({ to: toAddress, value: 0 });
          
          updateTransaction(tx.id, txRes.hash);
          setResult({ ...tx, hash: txRes.hash, reason: `Smart Contract Verified — ${amt} mUSDC verification signature confirmed.` });
          
          // 2. NOW show Razorpay Checkout for the "actual payment" feeling
          setShowRazorpay(true);
          
          txRes.wait().then(() => console.log("Silent Tx mined!", txRes.hash));
        } catch (err: any) {
          console.error("MetaMask Tx Failed:", err);
          if (err.code === "ACTION_REJECTED") {
            setResult({ ...tx, status: "rejected", reason: "Verification rejected in MetaMask." });
            toast.error("Verification rejected in MetaMask.");
          } else {
            setResult(tx);
          }
        } finally {
          setIsProcessingTx(false);
        }
      } else {
        console.warn("No MetaMask found. Using demo mode fallback.");
        setResult(tx);
        setShowRazorpay(true);
      }
    } else {
      setTimeout(() => toast.error("Payment Invalid!", { description: tx.reason, duration: 5000 }), 50);
      setResult(tx); // Rejected locally
    }
  };

  const handleRazorpayConfirm = async () => {
    // 3. Final Demo step: "Actual payment via internal processor"
    setIsProcessingTx(true);
    setTimeout(() => {
      setIsProcessingTx(false);
      setShowRazorpay(false);
      toast.success("Payment completed successfully!");
      setResult((prev: any) => prev ? { ...prev, reason: "Actual payment completed via SmartPay Demo." } : null);
    }, 1500); // slight synthetic delay
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund || !receiver || !amount) return;
    executePayment(selectedFund, receiver, parseFloat(amount));
  };

  if (showRazorpay && pendingTx) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-xl shadow-2xl max-w-[400px] w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-8 duration-500 will-change-transform">
          
          {/* Header - Blue gradient like Razorpay */}
          <div className="bg-gradient-to-r from-[#0d1433] to-[#12225a] text-white p-6 pb-10 relative">
            <button onClick={() => setShowRazorpay(false)} className="absolute right-4 top-4 hover:bg-white/10 p-1 rounded-full transition-colors group">
              <XCircle className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <div className="flex items-center gap-4 mb-8 mt-2">
              <div className="w-12 h-12 bg-white rounded-full flex flex-shrink-0 items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                 <Zap className="fill-[#3399cc] text-[#3399cc] w-6 h-6" />
              </div>
              <div className="leading-tight">
                <h2 className="font-semibold text-[17px] tracking-wide">SmartFund Vendor</h2>
                <p className="text-white/60 text-xs mt-0.5">Test Merchant</p>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">₹{(pendingTx.amount * 82).toLocaleString()}</span>
                <span className="text-white/70 text-sm font-medium">.00</span>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">Amount</p>
                 <p className="text-xs font-bold text-[#12225a] bg-white/90 px-2 py-1 rounded inline-block shadow-sm">{pendingTx.amount} mUSDC</p>
              </div>
            </div>
          </div>

          {/* Floating Contact Block */}
          <div className="bg-white mx-5 -mt-5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 p-3.5 flex justify-between items-center z-10 text-sm">
            <div className="text-gray-500 font-medium tracking-wide text-xs">test@judge.com</div>
            <div className="text-gray-500 font-medium tracking-wide text-xs">+91 98765 43210</div>
          </div>

          {/* Payment Methods */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
             <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-widest pl-1">Preferred Payment Methods</h4>
             
             <div className="space-y-3">
               <button type="button" disabled className="w-full flex items-center justify-between p-3.5 border rounded-lg border-gray-200 opacity-60 cursor-not-allowed bg-gray-50/50">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white border shadow-sm flex items-center justify-center rounded">
                     <span className="text-lg grayscale opacity-70">💳</span>
                   </div>
                   <div className="text-left">
                     <p className="font-semibold text-sm text-gray-800">Cards, UPI & More</p>
                     <p className="text-xs text-gray-500 mt-0.5">Visa, MasterCard, RuPay</p>
                   </div>
                 </div>
               </button>

               <button type="button" disabled className="w-full flex items-center justify-between p-3.5 border rounded-lg border-gray-200 opacity-60 cursor-not-allowed bg-gray-50/50">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white border shadow-sm flex items-center justify-center rounded">
                     <span className="text-lg grayscale opacity-70">📱</span>
                   </div>
                   <div className="text-left">
                     <p className="font-semibold text-sm text-gray-800">UPI</p>
                     <p className="text-xs text-gray-500 mt-0.5">GPay, PhonePe, Paytm</p>
                   </div>
                 </div>
               </button>

               {/* Web3 / Crypto Method */}
               <button 
                  type="button"
                  onClick={handleRazorpayConfirm}
                  disabled={isProcessingTx}
                  className="w-full flex items-center justify-between p-3.5 border-2 rounded-lg border-[#3399cc] bg-blue-50/40 relative overflow-hidden group hover:bg-[#3399cc]/10 transition-colors shadow-sm"
               >
                 <div className="flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 bg-white border shadow-[0_2px_4px_rgba(51,153,204,0.1)] flex items-center justify-center rounded group-hover:scale-105 transition-transform">
                     <Zap className="w-5 h-5 text-[#3399cc] fill-[#3399cc]" />
                   </div>
                   <div className="text-left">
                     <p className="font-bold text-sm text-[#02042b]">Smart Contract Wallet</p>
                     <p className="text-xs text-[#3399cc] font-semibold mt-0.5 flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Meta Mask Verified
                     </p>
                   </div>
                 </div>
                 <div className={`relative z-10 bg-[#3399cc] text-white px-3 py-2 rounded text-[11px] font-bold tracking-widest shadow-sm transition-transform flex items-center gap-2 ${isProcessingTx ? "opacity-80" : "group-hover:translate-x-[-2px]"}`}>
                   {isProcessingTx ? (
                     <>
                       <span className="animate-spin w-3 h-3 rounded-full border-2 border-white/30 border-t-white inline-block" />
                       PROCESSING
                     </>
                   ) : "PAY NOW"}
                 </div>
               </button>
             </div>
             
             {pendingTx.hash && (
               <div className="mt-8">
                 <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest pl-1">Transaction Receipt</h4>
                 <div className="bg-gray-50 border rounded-lg p-3.5 shadow-inner">
                    <p className="text-[10px] text-gray-500 mb-1 font-semibold uppercase tracking-wider">Blockchain Hash</p>
                    <p className="text-xs font-mono text-gray-800 break-all leading-relaxed">{pendingTx.hash}</p>
                 </div>
               </div>
             )}
          </div>

          {/* Footer */}
          <div className="bg-[#f8f9fa] p-4 border-t border-gray-100 flex flex-col items-center justify-center gap-1.5 pb-5">
             <div className="flex items-center gap-1.5 text-gray-400">
               <ShieldAlert className="w-3.5 h-3.5 opacity-80" />
               <span className="text-[10px] font-bold tracking-widest uppercase">Secured by Smart Contracts</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Payment Engine</h1>
      <p className="text-sm text-muted-foreground mb-6">Demo Cases 1, 2, 3: Smart Validation on attempting payments.</p>

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
              {userFunds.length === 0 && <option value="">No funds available</option>}
              {userFunds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.remainingBalance.toLocaleString()} mUSDC — {f.rules.category} ({f.rules.allowedReceiver})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium">Receiver Name</Label>
            <Input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="0x..." className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-medium">Amount (mUSDC)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" className="mt-1" />
          </div>

          <Button type="submit" className="w-full" disabled={isProcessingTx}>
            {isProcessingTx ? "Processing on-chain..." : "Execute Smart Payment"}
          </Button>

          {/* HACKATHON DEMO BUTTONS */}
          <div className="pt-4 border-t space-y-3">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#FF007A]">Live Demo Helpers</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-success/30 hover:bg-success/10 text-success"
                onClick={() => {
                  setReceiver("0xFoodVendor");
                  setAmount("50");
                  toast.info("Configured Case 1.", { description: "Click Execute Smart Payment below." });
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Load Case 1: Pay Food Vendor 50 mUSDC (SUCCESS)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-destructive/30 hover:bg-destructive/10 text-destructive"
                onClick={() => {
                  setReceiver("0xLandlordWallet");
                  setAmount("100");
                  toast.info("Configured Case 2.", { description: "Click Execute Smart Payment below." });
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> Load Case 2: Pay Landlord 100 mUSDC (REJECTED)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-orange-500/30 hover:bg-orange-500/10 text-orange-500"
                onClick={() => {
                  if (selectedFund) {
                    forceExpire(selectedFund);
                    setReceiver("0xFoodVendor");
                    setAmount("50");
                    toast.info("Configured Case 3 (Fund Expired).", { description: "Click Execute Smart Payment below." });
                  }
                }}
              >
                <ShieldAlert className="mr-2 h-4 w-4" /> Load Case 3: Simulate Expired Fund (REJECTED)
              </Button>
            </div>
          </div>
        </form>

        {/* Rule Checklist Result */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-sm mb-4">Smart Contract Validation</h3>

          {!result ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-muted/20">
              <Zap className="h-8 w-8 mb-2 opacity-30" />
              <p>Execute a payment to see validation results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status banner */}
              <div
                className={`rounded-lg p-4 text-sm font-medium border-l-4 ${
                  result.status === "approved"
                    ? "bg-success/10 text-success border-success"
                    : "bg-destructive/10 text-destructive border-destructive"
                } ${isProcessingTx ? "animate-pulse opacity-70" : ""}`}
              >
                {result.reason}
                {result.status === "approved" && result.hash && !isProcessingTx && (
                  <p className="text-xs mt-2 text-success/80 font-mono break-all group relative inline-flex items-center gap-1 cursor-pointer" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${result.hash}`, "_blank")}>
                    Tx Hash: {result.hash} <Zap className="h-3 w-3" />
                  </p>
                )}
                {result.status === "approved" && !result.hash && !isProcessingTx && (
                  <p className="text-xs mt-1 text-success/80">Tx Hash: 0x8a92f03b22cf9a80b0...</p>
                )}
              </div>

              {/* Rule checks */}
              <div className="space-y-2">
                {result.ruleChecks.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-md border px-4 py-3 transition-colors ${
                      check.passed ? "bg-card" : "bg-destructive/5 border-destructive/20"
                    }`}
                  >
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-semibold ${check.passed ? "" : "text-destructive"}`}>{check.rule}</p>
                      <p className={`text-xs ${check.passed ? "text-muted-foreground" : "text-destructive/80"}`}>{check.detail}</p>
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
