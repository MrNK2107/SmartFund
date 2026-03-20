import React, { useState } from "react";
import { useSmartFund } from "@/context/SmartFundContext";
import { ShieldAlert, Zap, AlertTriangle, CheckCircle2, XCircle, Activity } from "lucide-react";

interface FraudAttempt {
  id: string;
  description: string;
  receiverName: string;
  amount: number;
  fundId: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  flags: string[];
}

const FRAUD_SCENARIOS: Omit<FraudAttempt, "id" | "fundId">[] = [
  {
    description: "Payment to unauthorized receiver",
    receiverName: "Unknown Person",
    amount: 5000,
    riskScore: 92,
    riskLevel: "critical",
    flags: ["Receiver mismatch", "First-time recipient", "Full amount withdrawal"],
  },
  {
    description: "Expired fund usage attempt",
    receiverName: "Landlord (Mr. Patel)",
    amount: 2000,
    riskScore: 78,
    riskLevel: "high",
    flags: ["Potential replay attack", "Unusual timing pattern"],
  },
  {
    description: "Exceeding max usage limit",
    receiverName: "Landlord (Mr. Patel)",
    amount: 1000,
    riskScore: 65,
    riskLevel: "medium",
    flags: ["Usage limit exceeded", "Repeated attempt pattern"],
  },
  {
    description: "Suspicious micro-transaction burst",
    receiverName: "Friend (Amit)",
    amount: 50,
    riskScore: 85,
    riskLevel: "high",
    flags: ["Category mismatch", "Rapid-fire attempts", "Social engineering pattern"],
  },
];

const riskColors: Record<string, string> = {
  low: "text-success",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-destructive",
};

const riskBgColors: Record<string, string> = {
  low: "bg-success/10",
  medium: "bg-yellow-500/10",
  high: "bg-orange-500/10",
  critical: "bg-destructive/10",
};

const FraudSimulation: React.FC = () => {
  const { funds, attemptPayment, transactions } = useSmartFund();
  const [simResults, setSimResults] = useState<
    { attempt: FraudAttempt; txStatus: "approved" | "rejected"; reason: string }[]
  >([]);
  const [running, setRunning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const runSimulation = async () => {
    if (funds.length === 0) return;
    setSimResults([]);
    setRunning(true);

    const targetFund = funds[0];

    for (let i = 0; i < FRAUD_SCENARIOS.length; i++) {
      setActiveIndex(i);
      await new Promise((r) => setTimeout(r, 800));

      const scenario = FRAUD_SCENARIOS[i];
      const attempt: FraudAttempt = {
        ...scenario,
        id: `fraud-${Date.now()}-${i}`,
        fundId: targetFund.id,
      };

      const tx = attemptPayment(targetFund.id, scenario.receiverName, scenario.amount);

      setSimResults((prev) => [
        ...prev,
        { attempt, txStatus: tx.status, reason: tx.reason },
      ]);
    }

    setActiveIndex(-1);
    setRunning(false);
  };

  const blockedCount = simResults.filter((r) => r.txStatus === "rejected").length;
  const totalRisk = simResults.length > 0
    ? Math.round(simResults.reduce((s, r) => s + r.attempt.riskScore, 0) / simResults.length)
    : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <ShieldAlert className="h-6 w-6 text-destructive" />
        <h1 className="text-2xl font-semibold">Fraud Simulation</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Simulate suspicious transaction attempts with AI risk scoring and real-time rule enforcement.
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={runSimulation}
          disabled={running || funds.length === 0}
          className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          {running ? "Running Simulation..." : "Run Fraud Simulation"}
        </button>
        {funds.length === 0 && (
          <span className="text-xs text-muted-foreground">Create a fund first to simulate.</span>
        )}
      </div>

      {/* Summary Cards */}
      {simResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attempts</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold">{simResults.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blocked</span>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-2xl font-semibold text-destructive">{blockedCount}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Risk Score</span>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-2xl font-semibold">{totalRisk}/100</p>
          </div>
        </div>
      )}

      {/* Scanning indicator */}
      {running && activeIndex >= 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-4 animate-pulse">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <ShieldAlert className="h-4 w-4" />
            Scanning: {FRAUD_SCENARIOS[activeIndex]?.description}...
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {simResults.map((result, i) => (
          <div
            key={result.attempt.id}
            className="rounded-lg border bg-card p-5 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {result.txStatus === "rejected" ? (
                  <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{result.attempt.description}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{result.attempt.amount.toLocaleString()} → {result.attempt.receiverName}
                  </p>
                </div>
              </div>

              {/* Risk Score */}
              <div className="text-right">
                <div className={`text-lg font-bold ${riskColors[result.attempt.riskLevel]}`}>
                  {result.attempt.riskScore}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${riskBgColors[result.attempt.riskLevel]} ${riskColors[result.attempt.riskLevel]}`}
                >
                  {result.attempt.riskLevel}
                </span>
              </div>
            </div>

            {/* Risk bar */}
            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.attempt.riskScore >= 80
                      ? "bg-destructive"
                      : result.attempt.riskScore >= 60
                      ? "bg-orange-500"
                      : "bg-success"
                  }`}
                  style={{ width: `${result.attempt.riskScore}%` }}
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {result.attempt.flags.map((flag) => (
                <span
                  key={flag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"
                >
                  ⚠ {flag}
                </span>
              ))}
            </div>

            {/* Contract verdict */}
            <div
              className={`text-xs font-medium rounded-md px-3 py-2 ${
                result.txStatus === "rejected"
                  ? "bg-destructive/5 text-destructive"
                  : "bg-success/5 text-success"
              }`}
            >
              {result.txStatus === "rejected"
                ? `🛡 Blocked: ${result.reason}`
                : `✓ ${result.reason}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FraudSimulation;
