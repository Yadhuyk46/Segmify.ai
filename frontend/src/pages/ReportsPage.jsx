import { useState } from "react";
import { Download, FileText } from "lucide-react";

import api from "../lib/api";
import { isAdmin } from "../lib/auth";

const reports = ["Customer Segment Report", "Revenue Report", "Sales Trend Analysis", "Retention Analysis", "Customer Churn Analysis", "Business Performance Report"];

export default function ReportsPage() {
  const admin = isAdmin();
  const [status, setStatus] = useState({});

  if (!admin) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <FileText className="text-brand-500" />
        <h2 className="mt-4 font-display text-3xl">Reports are admin-only</h2>
        <p className="mt-3 text-slate-500 dark:text-slate-300">Customer accounts can upload their data and run segmentation. Full customer exports stay with the admin account.</p>
      </div>
    );
  }

  async function generate(report, format = "csv") {
    setStatus((current) => ({ ...current, [report]: "Generating..." }));
    try {
      const { data } = await api.post(`/reports/export?export_format=${format}`);
      const customers = await api.get("/customers", { params: { page: 1, page_size: 100 } });
      const rows = [...customers.data.items];
      const totalPages = Math.ceil(customers.data.total / 100);
      for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await api.get("/customers", { params: { page, page_size: 100 } });
        rows.push(...nextPage.data.items);
      }
      const csv = ["customer_code,full_name,country,city,total_spending,loyalty_score", ...rows.map((row) => [row.customer_code, row.full_name, row.country, row.city, row.total_spending, row.loyalty_score].join(","))].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = data.report.file_name || "customer_report.csv";
      link.click();
      URL.revokeObjectURL(url);
      setStatus((current) => ({ ...current, [report]: `Generated ${data.report.meta.rows} rows.` }));
    } catch (err) {
      setStatus((current) => ({ ...current, [report]: err.response?.data?.detail || "Unable to generate report." }));
    }
  }

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-slate-500 dark:text-slate-400">Analytics and reporting</p><h2 className="font-display text-3xl">Reports</h2></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <div key={report} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <FileText className="text-brand-500" />
            <h3 className="mt-4 font-display text-xl">{report}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Generate a backend report record and download the latest customer CSV.</p>
            <button onClick={() => generate(report)} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"><Download size={16} /> Generate Report</button>
            {status[report] && <p className="mt-4 rounded-xl bg-brand-500/10 px-3 py-2 text-sm text-brand-500">{status[report]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
