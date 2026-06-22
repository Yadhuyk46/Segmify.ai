import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getCurrentUserFromToken } from "../../lib/auth";
import api from "../../lib/api";
import AIAssistantPanel from "../ai/AIAssistantPanel";

export default function AppShell({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const user = getCurrentUserFromToken();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    let ignore = false;

    async function loadNotificationCount() {
      if (user?.role !== "admin") return;
      try {
        const { data } = await api.get("/admin/overview");
        if (!ignore) setNotificationCount(data.unread_inquiries || 0);
      } catch {
        if (!ignore) setNotificationCount(0);
      }
    }

    loadNotificationCount();
    window.addEventListener("segmify:notifications-updated", loadNotificationCount);
    return () => {
      ignore = true;
      window.removeEventListener("segmify:notifications-updated", loadNotificationCount);
    };
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen">
        <Sidebar user={user} notificationCount={notificationCount} onOpenAssistant={() => setAssistantOpen(true)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar user={user} darkMode={darkMode} notificationCount={notificationCount} onToggleDarkMode={() => setDarkMode((value) => !value)} />
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
      <button onClick={() => setAssistantOpen(true)} className="fixed bottom-4 right-4 z-40 rounded-2xl bg-gradient-to-br from-brand-500 to-accent px-4 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 lg:hidden">
        AI Assistant
      </button>
      <AIAssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
