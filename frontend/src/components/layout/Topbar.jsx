import { Bell, Moon, Search, Sun } from "lucide-react";

export default function Topbar({ user, darkMode, notificationCount = 0, onToggleDarkMode }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
        <h1 className="font-display text-2xl text-slate-950 dark:text-white">Customer Intelligence Dashboard</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brand-500">{user?.role === "admin" ? "Admin workspace" : "Customer workspace"}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 md:flex">
          <Search size={16} />
          Search customers, segments, reports
        </div>
        <button onClick={onToggleDarkMode} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
        </button>
        <button className="relative rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
          <Bell size={18} className="text-slate-700 dark:text-slate-200" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
