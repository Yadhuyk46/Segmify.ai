import { BarChart3, Bot, LayoutDashboard, Settings, Shield, Users, WalletCards } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/segmentation", label: "Segmentation", icon: Bot },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/reports", label: "Reports", icon: WalletCards, adminOnly: true },
  { to: "/app/admin", label: "Admin", icon: Shield, adminOnly: true },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ user, notificationCount = 0, onOpenAssistant }) {
  const role = user?.role || "user";
  const visibleItems = items.filter((item) => !item.adminOnly || role === "admin");

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/90 px-5 py-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:flex">
      <NavLink to="/" className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-lg font-bold text-white">
          S
        </div>
        <div>
          <p className="font-display text-xl text-slate-950 dark:text-white">Segmify.ai</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI segmentation suite</p>
        </div>
      </NavLink>
      <nav className="space-y-2">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              }`
            }
          >
            <Icon size={18} />
            {label}
            {label === "Admin" && notificationCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <button onClick={onOpenAssistant} className="mt-auto rounded-3xl bg-gradient-to-br from-brand-600 to-slate-900 p-5 text-left text-white transition hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(6,182,212,0.18)]">
        <p className="font-display text-lg">AI Assistant</p>
        <p className="mt-2 text-sm text-white/80">Ask for churn insights, next-best offers, and segment-level recommendations.</p>
      </button>
    </aside>
  );
}
