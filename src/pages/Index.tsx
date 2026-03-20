import React, { useState } from "react";
import { SmartFundProvider } from "@/context/SmartFundContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import FundCreator from "@/pages/FundCreator";
import SmartWallet from "@/pages/SmartWallet";
import PaymentEngine from "@/pages/PaymentEngine";
import TransactionLog from "@/pages/TransactionLog";
import FraudSimulation from "@/pages/FraudSimulation";

type Page = "dashboard" | "creator" | "wallet" | "payment" | "logs" | "fraud";

const pages: Record<Page, React.FC> = {
  dashboard: Dashboard,
  creator: FundCreator,
  wallet: SmartWallet,
  payment: PaymentEngine,
  logs: TransactionLog,
  fraud: FraudSimulation,
};

const Index: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const ActiveComponent = pages[activePage];

  return (
    <SmartFundProvider>
      <AppLayout activePage={activePage} onNavigate={setActivePage}>
        <ActiveComponent />
      </AppLayout>
    </SmartFundProvider>
  );
};

export default Index;
