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
    <div className="flex h-screen overflow-hidden bg-[#030712] relative">
      {/* Global Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60rem] h-[60rem] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[40%] left-[50%] w-[30rem] h-[30rem] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col glass-panel border-r border-white/5 text-sidebar-foreground transition-all duration-300 shrink-0 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center gap-2 px-4 py-6 border-b border-white/5">
          <Shield className="h-7 w-7 text-primary shrink-0" />
          {!collapsed && <span className="font-bold text-xl tracking-tight text-gradient">SmartFund</span>}
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
                  "flex items-center gap-3 w-full rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-primary/10 text-primary neon-glow border border-primary/20 shadow-inner"
                    : "text-sidebar-muted hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Role Switcher */}
        <div className="border-t border-white/5 p-4 bg-black/20">
          {!collapsed && (
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-sidebar-muted mb-2 block">
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
              "w-full rounded-md border border-white/10 bg-black/40 text-sidebar-foreground text-xs py-2 px-2 focus:ring-1 focus:ring-primary backdrop-blur-sm transition-all hover:bg-black/60 cursor-pointer",
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
          className="flex items-center justify-center py-4 border-t border-white/5 text-sidebar-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        <div className="max-w-7xl mx-auto p-6 lg:p-10 relative z-10">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
