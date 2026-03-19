import React, { useState } from "react";
import { SmartMoneyProvider } from "@/context/SmartMoneyContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import FundCreator from "@/pages/FundCreator";
import SmartWallet from "@/pages/SmartWallet";
import PaymentEngine from "@/pages/PaymentEngine";
import TransactionLog from "@/pages/TransactionLog";

type Page = "dashboard" | "creator" | "wallet" | "payment" | "logs";

const pages: Record<Page, React.FC> = {
  dashboard: Dashboard,
  creator: FundCreator,
  wallet: SmartWallet,
  payment: PaymentEngine,
  logs: TransactionLog,
};

const Index: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const ActiveComponent = pages[activePage];

  return (
    <SmartMoneyProvider>
      <AppLayout activePage={activePage} onNavigate={setActivePage}>
        <ActiveComponent />
      </AppLayout>
    </SmartMoneyProvider>
  );
};

export default Index;
