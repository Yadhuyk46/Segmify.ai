import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import api from "../lib/api";

const palette = ["#06b6d4", "#f97316", "#14b8a6", "#8b5cf6", "#84cc16", "#ef4444"];

function ChartCard({ title, children }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">Live analytics</p>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-6 h-72">{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/analytics/dashboard")
      .then(({ data }) => setAnalytics(data))
      .catch((err) => setError(err.response?.data?.detail || "Unable to load analytics. Sign in and check the backend."));
  }, []);

  if (error) return <div className="rounded-2xl bg-red-500/10 p-4 text-red-300">{error}</div>;
  if (!analytics) return <div className="rounded-2xl bg-white p-6 dark:bg-slate-900">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.metrics.slice(0, 4).map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 font-display text-3xl">{metric.value}</p>
            <p className="mt-1 text-sm text-brand-500">{metric.delta}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Customer Growth Graph">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.customer_growth}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="label" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line dataKey="value" stroke="#06b6d4" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.revenue_trend}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="label" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line dataKey="value" stroke="#f97316" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Purchase Frequency Graph">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.purchase_frequency}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="range" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Customer Lifetime Value Chart">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.clv_distribution}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="range" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Geographic Customer Distribution">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.geo_distribution} dataKey="value" nameKey="name" outerRadius={110} label>{analytics.geo_distribution.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Segment Distribution">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.segment_distribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>{analytics.segment_distribution.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
