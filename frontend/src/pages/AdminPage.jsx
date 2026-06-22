import { useEffect, useState } from "react";
import { Activity, Bell, CheckCircle2, Download, Mail, Shield, Trash2, Users } from "lucide-react";

import api from "../lib/api";
import { isAdmin } from "../lib/auth";

const tabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "logs", label: "Activity Logs", icon: Activity },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function AdminPage() {
  const admin = isAdmin();
  const [activeTab, setActiveTab] = useState("users");
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState({ users: [], logs: [], notifications: [] });
  const [message, setMessage] = useState("");

  async function loadAdminData() {
    if (!admin) return;
    setMessage("");
    try {
      const [overviewResponse, usersResponse, logsResponse, notificationsResponse] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/users"),
        api.get("/admin/logs"),
        api.get("/admin/notifications"),
      ]);
      setOverview(overviewResponse.data);
      setRows({ users: usersResponse.data, logs: logsResponse.data, notifications: notificationsResponse.data });
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to load admin data.");
    }
  }

  async function updateNotification(notificationId, payload) {
    try {
      const { data } = await api.patch(`/admin/notifications/${notificationId}`, payload);
      setRows((current) => ({
        ...current,
        notifications: current.notifications.map((item) => (item.id === notificationId ? data : item)),
      }));
      window.dispatchEvent(new Event("segmify:notifications-updated"));
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to update notification.");
    }
  }

  async function deleteNotification(notificationId) {
    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      setRows((current) => ({
        ...current,
        notifications: current.notifications.filter((item) => item.id !== notificationId),
      }));
      window.dispatchEvent(new Event("segmify:notifications-updated"));
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to delete notification.");
    }
  }

  async function downloadAllCustomers() {
    try {
      const { data } = await api.post("/reports/export?export_format=csv");
      const firstPage = await api.get("/customers", { params: { page: 1, page_size: 100 } });
      const allRows = [...firstPage.data.items];
      const totalPages = Math.ceil(firstPage.data.total / 100);
      for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await api.get("/customers", { params: { page, page_size: 100 } });
        allRows.push(...nextPage.data.items);
      }
      const columns = ["customer_code", "full_name", "email", "country", "city", "total_spending", "loyalty_score", "churn_risk"];
      const csv = [columns.join(","), ...allRows.map((row) => columns.map((column) => `"${String(row[column] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = data.report.file_name || "segmify-all-customers.csv";
      link.click();
      URL.revokeObjectURL(url);
      setMessage(`Downloaded ${data.report.meta.rows} customer records.`);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to download customers.");
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  if (!admin) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <Shield className="text-brand-500" />
        <h2 className="mt-4 font-display text-3xl">Admin access required</h2>
        <p className="mt-3 text-slate-500 dark:text-slate-300">Customer accounts can upload data, train models, and predict segments. Reports and full customer downloads are admin-only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Admin control center</p>
          <h2 className="font-display text-3xl">Platform Administration</h2>
        </div>
        <button onClick={downloadAllCustomers} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">
          <Download size={16} /> Download Customer Data
        </button>
      </div>

      {overview && (
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(overview).map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm capitalize text-slate-500">{label}</p>
              <p className="mt-2 font-display text-3xl">{value}</p>
            </div>
          ))}
        </div>
      )}

      {message && <p className="rounded-2xl bg-brand-500/10 px-4 py-3 text-sm text-brand-500">{message}</p>}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${activeTab === id ? "bg-brand-500 text-white" : "border border-slate-200 dark:border-slate-800"}`}>
              <Icon size={16} /> {label}
              {id === "notifications" && rows.notifications.filter((item) => !item.is_read).length > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
                  {rows.notifications.filter((item) => !item.is_read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          {activeTab === "users" && <AdminTable columns={["full_name", "email", "role", "is_active", "created_at"]} rows={rows.users} />}
          {activeTab === "logs" && <AdminTable columns={["actor_email", "action", "entity_type", "entity_id", "created_at"]} rows={rows.logs} />}
          {activeTab === "notifications" && (
            <NotificationsPanel
              rows={rows.notifications}
              onMarkRead={(id) => updateNotification(id, { is_read: true })}
              onResolve={(id) => updateNotification(id, { status: "Resolved", is_read: true })}
              onDelete={deleteNotification}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AdminTable({ columns, rows }) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="text-slate-500 dark:text-slate-300">
        <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-medium capitalize">{column.replaceAll("_", " ")}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.id}-${row.created_at}`} className="border-t border-slate-100 dark:border-slate-800">
            {columns.map((column) => <td key={column} className="px-4 py-3">{String(row[column] ?? "-").slice(0, 90)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NotificationsPanel({ rows, onMarkRead, onResolve, onDelete }) {
  if (!rows.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-800">
        <Bell className="mx-auto text-brand-500" size={28} />
        <p className="mt-4 font-display text-2xl">No customer inquiries yet</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Submitted walkthrough requests will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {rows.map((item) => (
        <article key={item.id} className={`rounded-3xl border p-5 transition hover:-translate-y-0.5 ${item.is_read ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40" : "border-brand-300/40 bg-brand-500/5 dark:bg-brand-500/10"}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${item.is_read ? "bg-slate-400" : "bg-accent shadow-[0_0_16px_rgba(249,115,22,0.7)]"}`} />
                <h3 className="font-display text-xl">{item.full_name}</h3>
                <StatusBadge status={item.status} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {item.is_read ? "Read" : "Unread"}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Mail size={15} /> {item.email}
              </p>
              <p className="mt-4 max-w-4xl leading-7 text-slate-600 dark:text-slate-300">{item.message}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">{formatDateTime(item.created_at)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!item.is_read && (
                <button onClick={() => onMarkRead(item.id)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800">
                  <CheckCircle2 size={15} /> Mark as Read
                </button>
              )}
              <button onClick={() => onResolve(item.id)} className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                <CheckCircle2 size={15} /> Mark as Resolved
              </button>
              <button onClick={() => onDelete(item.id)} className="inline-flex items-center gap-2 rounded-2xl border border-red-400/30 px-4 py-2 text-sm text-red-500 transition hover:bg-red-500/10">
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    New: "bg-cyan-400/10 text-cyan-300",
    "In Progress": "bg-amber-400/10 text-amber-300",
    Resolved: "bg-emerald-400/10 text-emerald-300",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.New}`}>{status}</span>;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
