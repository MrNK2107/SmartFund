import React, { useState } from "react";
import { useSmartFund } from "@/context/SmartFundContext";
import { LayoutDashboard, PlusCircle, Wallet, CreditCard, FileText, Shield, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Page = "dashboard" | "creator" | "wallet" | "payment" | "logs" | "fraud";

interface AppLayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { id: Page; label: string; icon: React.ElementType; roles: string[] }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "user"] },
  { id: "creator", label: "Fund Creator", icon: PlusCircle, roles: ["admin"] },
  { id: "wallet", label: "Smart Wallet", icon: Wallet, roles: ["user"] },
  { id: "payment", label: "Payment Engine", icon: CreditCard, roles: ["user"] },
  { id: "logs", label: "Transaction Log", icon: FileText, roles: ["admin", "user", "vendor"] },
  { id: "fraud", label: "Fraud Simulation", icon: ShieldAlert, roles: ["admin"] },
];

const AppLayout: React.FC<AppLayoutProps> = ({ activePage, onNavigate, children }) => {
  const { currentUser, setCurrentUser, users } = useSmartFund();
  const [collapsed, setCollapsed] = useState(false);

  const visibleNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
          <Shield className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-semibold text-sm tracking-tight">SmartFund</span>}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Role Switcher */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && (
            <label className="text-[10px] uppercase tracking-widest text-sidebar-muted mb-1 block">
              Switch Role
            </label>
          )}
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find((u) => u.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className={cn(
              "w-full rounded-md border-0 bg-sidebar-accent text-sidebar-foreground text-xs py-1.5 px-2 focus:ring-1 focus:ring-sidebar-ring",
              collapsed && "text-[0px] px-1"
            )}
          >
            {users.filter(u => u.role !== "vendor").map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-3 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
