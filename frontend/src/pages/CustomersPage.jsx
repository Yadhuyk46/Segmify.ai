import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Plus, RefreshCw, Search, Upload, X } from "lucide-react";

import api from "../lib/api";
import { isAdmin } from "../lib/auth";

const blankCustomer = {
  customer_code: "",
  full_name: "",
  age: 30,
  gender: "Female",
  email: "",
  phone: "",
  address: "",
  country: "India",
  city: "Bengaluru",
  occupation: "Analyst",
  income: 65000,
  purchase_frequency: 5,
  average_order_value: 120,
  total_spending: 1800,
  last_purchase_date: new Date().toISOString().slice(0, 10),
  preferred_category: "Electronics",
  loyalty_score: 70,
  customer_lifetime_value: 4200,
  churn_risk: 0.22,
  is_active: true,
};

const numericFields = ["age", "income", "purchase_frequency", "average_order_value", "total_spending", "loyalty_score", "customer_lifetime_value", "churn_risk"];
const requiredTextFields = ["customer_code", "full_name", "email", "phone", "address", "country", "city", "occupation", "gender", "preferred_category", "last_purchase_date"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userFieldGroups = [
  ["full_name", "customer_code", "email", "phone"],
  ["age", "gender", "occupation", "income"],
  ["preferred_category", "purchase_frequency", "average_order_value", "total_spending"],
  ["loyalty_score", "customer_lifetime_value", "churn_risk", "last_purchase_date"],
  ["country", "city", "address"],
];

function spendingProfile(customer) {
  const totalSpending = Number(customer.total_spending || 0);
  const averageOrderValue = Number(customer.average_order_value || 0);
  if (totalSpending >= 5000 || averageOrderValue >= 350) {
    return { label: "High Spender", tone: "text-emerald-300", note: `Highest activity in ${customer.preferred_category || "selected category"}` };
  }
  if (totalSpending >= 1500 || averageOrderValue >= 120) {
    return { label: "Moderate Spender", tone: "text-amber-300", note: `Moderate activity in ${customer.preferred_category || "selected category"}` };
  }
  return { label: "Low Spender", tone: "text-sky-300", note: `Low activity in ${customer.preferred_category || "selected category"}` };
}

function toCsv(rows) {
  const columns = ["customer_code", "full_name", "email", "country", "city", "total_spending", "loyalty_score", "churn_risk"];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n");
}

export default function CustomersPage() {
  const admin = isAdmin();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [minSpend, setMinSpend] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(blankCustomer);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  async function loadCustomers(nextPage = page, options = {}) {
    setLoading(true);
    if (!options.keepMessage) setMessage("");
    try {
      const { data } = await api.get("/customers", { params: { page: nextPage, page_size: 25, search: search || undefined } });
      setCustomers(data.items);
      setTotal(data.total);
      setPage(nextPage);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to load customers. Sign in and make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers(1);
  }, []);

  const visibleCustomers = useMemo(() => {
    const threshold = Number(minSpend || 0);
    return customers.filter((customer) => Number(customer.total_spending) >= threshold);
  }, [customers, minSpend]);
  const currentProfile = spendingProfile(form);

  function updateForm(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function validateCustomerForm() {
    const missingField = requiredTextFields.find((field) => !String(form[field] ?? "").trim());
    if (missingField) {
      return `${missingField.replaceAll("_", " ")} is required.`;
    }
    if (!emailPattern.test(form.email.trim())) {
      return "Enter a valid customer email address.";
    }
    const invalidNumber = numericFields.find((field) => Number.isNaN(Number(form[field])) || Number(form[field]) < 0);
    if (invalidNumber) {
      return `${invalidNumber.replaceAll("_", " ")} must be a valid non-negative number.`;
    }
    if (Number(form.loyalty_score) > 100) {
      return "Loyalty score must be 100 or lower.";
    }
    if (Number(form.churn_risk) > 1) {
      return "Churn risk must be between 0 and 1.";
    }
    return "";
  }

  async function addCustomer(event) {
    event.preventDefault();
    setMessage("");
    const validationMessage = validateCustomerForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
    const payload = {
      ...form,
      customer_code: form.customer_code.trim(),
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      occupation: form.occupation.trim(),
      gender: form.gender.trim(),
      preferred_category: form.preferred_category.trim(),
      age: Number(form.age),
      income: Number(form.income),
      purchase_frequency: Number(form.purchase_frequency),
      average_order_value: Number(form.average_order_value),
      total_spending: Number(form.total_spending),
      loyalty_score: Number(form.loyalty_score),
      customer_lifetime_value: Number(form.customer_lifetime_value),
      churn_risk: Number(form.churn_risk),
      last_purchase_date: new Date(form.last_purchase_date).toISOString(),
    };
    setSaveLoading(true);
    try {
      await api.post("/customers", payload);
      setModalOpen(false);
      setForm(blankCustomer);
      setMessage("Customer saved successfully");
      await loadCustomers(1, { keepMessage: true });
    } catch (err) {
      console.error("Customer save failed", err);
      const detail = err.response?.data?.detail;
      setMessage(Array.isArray(detail) ? detail.map((item) => item.msg).join(" ") : detail || "Unable to save customer. Please check the fields and try again.");
    } finally {
      setSaveLoading(false);
    }
  }

  function parseCsv(text) {
    const [headerLine, ...lines] = text.trim().split(/\r?\n/);
    const headers = headerLine.split(",").map((value) => value.trim());
    return lines.filter(Boolean).map((line) => {
      const values = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((value) => value.replace(/^"|"$/g, "").replaceAll('""', '"')) || [];
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
      return {
        ...blankCustomer,
        ...row,
        age: Number(row.age || blankCustomer.age),
        income: Number(row.income || blankCustomer.income),
        purchase_frequency: Number(row.purchase_frequency || blankCustomer.purchase_frequency),
        average_order_value: Number(row.average_order_value || blankCustomer.average_order_value),
        total_spending: Number(row.total_spending || blankCustomer.total_spending),
        loyalty_score: Number(row.loyalty_score || blankCustomer.loyalty_score),
        customer_lifetime_value: Number(row.customer_lifetime_value || blankCustomer.customer_lifetime_value),
        churn_risk: Number(row.churn_risk || blankCustomer.churn_risk),
        last_purchase_date: new Date(row.last_purchase_date || blankCustomer.last_purchase_date).toISOString(),
        is_active: String(row.is_active ?? "true").toLowerCase() !== "false",
      };
    });
  }

  async function importCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage("");
    try {
      const rows = parseCsv(await file.text());
      if (!rows.length) {
        setMessage("No customer rows found in the CSV file.");
        return;
      }
      const { data } = await api.post("/customers/import", rows);
      setMessage(`Imported ${data.created} customers${data.failed ? `, ${data.failed} skipped.` : "."}`);
      loadCustomers(1);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to import CSV. Check that the headers match the customer fields.");
    }
  }

  function exportCsv() {
    const blob = new Blob([toCsv(visibleCustomers)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "segmify-customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{admin ? "Customer management" : "Customer input workspace"}</p>
          <h2 className="font-display text-3xl">{admin ? "Customers" : "Customer Profile Input"}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadCustomers(1)} className="w-64 bg-transparent text-sm outline-none" placeholder="Search name or email" />
          </div>
          <button onClick={() => loadCustomers(1)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"><RefreshCw size={16} /> Refresh</button>
          <button onClick={() => setFilterOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"><Filter size={16} /> Filters</button>
          {admin && <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"><Download size={16} /> Export</button>}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <Upload size={16} /> Upload CSV
            <input onChange={importCsv} type="file" accept=".csv,text/csv" className="hidden" />
          </label>
          <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950"><Plus size={16} /> Add Customer</button>
        </div>
      </div>

      {filterOpen && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <label className="text-sm text-slate-500">Minimum total spending</label>
          <input value={minSpend} onChange={(event) => setMinSpend(event.target.value)} type="number" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 outline-none dark:border-slate-700" placeholder="0" />
          <button onClick={() => setMinSpend("")} className="text-sm text-brand-500">Clear filter</button>
        </div>
      )}

      {message && <p className="rounded-2xl bg-brand-500/10 px-4 py-3 text-sm text-brand-600 dark:text-brand-100">{message}</p>}

      {!admin && (
        <form onSubmit={addCustomer} className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 xl:grid-cols-[1fr_320px]">
          <div>
            <h3 className="font-display text-2xl">Enter Customer Details</h3>
            <div className="mt-5 space-y-4">
              {userFieldGroups.map((group) => (
                <div key={group.join("-")} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {group.map((key) => (
                    <label key={key} className={`text-sm capitalize text-slate-500 dark:text-slate-300 ${key === "address" ? "xl:col-span-2" : ""}`}>
                      {key.replaceAll("_", " ")}
                      <input
                        name={key}
                        value={form[key]}
                        onChange={updateForm}
                        type={key.includes("date") ? "date" : numericFields.includes(key) ? "number" : "text"}
                        step="0.01"
                        required
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 outline-none focus:border-brand-500 dark:border-slate-700"
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <button disabled={saveLoading} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950">
              <Plus size={16} /> {saveLoading ? "Saving..." : "Save Customer Input"}
            </button>
          </div>
          <div className="rounded-2xl bg-slate-950 p-5 text-white dark:bg-slate-800">
            <p className="text-sm text-slate-300">Current spending profile</p>
            <p className={`mt-3 font-display text-3xl ${currentProfile.tone}`}>{currentProfile.label}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{currentProfile.note}. This preview is based on total spending and average order value.</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2"><span>Total spending</span><strong>{Number(form.total_spending || 0).toLocaleString()}</strong></div>
              <div className="flex justify-between border-b border-white/10 pb-2"><span>Average order</span><strong>{Number(form.average_order_value || 0).toLocaleString()}</strong></div>
              <div className="flex justify-between"><span>Loyalty score</span><strong>{form.loyalty_score}</strong></div>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {!admin && <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800"><h3 className="font-display text-xl">Saved Customer Inputs</h3></div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
              <tr>{["Customer", "Segment", "Location", "Total Spending", "Loyalty", "Churn Risk", "Status"].map((head) => <th key={head} className="px-6 py-4 font-medium">{head}</th>)}</tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-6 py-4"><p className="font-semibold">{customer.full_name}</p><p className="text-sm text-slate-500">{customer.customer_code}</p></td>
                  <td className="px-6 py-4">{customer.segment_id ? `Segment ${customer.segment_id}` : "Unassigned"}</td>
                  <td className="px-6 py-4">{customer.city}, {customer.country}</td>
                  <td className="px-6 py-4">${Number(customer.total_spending).toLocaleString()}</td>
                  <td className="px-6 py-4">{customer.loyalty_score}</td>
                  <td className="px-6 py-4">{customer.churn_risk}</td>
                  <td className="px-6 py-4">{customer.is_active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm dark:border-slate-800">
          <span>{loading ? "Loading..." : `Showing ${visibleCustomers.length} of ${total} customers`}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => loadCustomers(page - 1)} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-40 dark:border-slate-700">Previous</button>
            <button disabled={page * 25 >= total} onClick={() => loadCustomers(page + 1)} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-40 dark:border-slate-700">Next</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <form onSubmit={addCustomer} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-950 shadow-soft dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between"><h3 className="font-display text-2xl">Add Customer</h3><button type="button" onClick={() => setModalOpen(false)}><X /></button></div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {Object.keys(blankCustomer).filter((key) => key !== "is_active").map((key) => (
                <label key={key} className="text-sm capitalize text-slate-500">{key.replaceAll("_", " ")}
                  <input name={key} value={form[key]} onChange={updateForm} type={key.includes("date") ? "date" : ["age", "income", "purchase_frequency", "average_order_value", "total_spending", "loyalty_score", "customer_lifetime_value", "churn_risk"].includes(key) ? "number" : "text"} step="0.01" required className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 outline-none dark:border-slate-700" />
                </label>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm"><input name="is_active" checked={form.is_active} onChange={updateForm} type="checkbox" /> Active customer</label>
            <button disabled={saveLoading} className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950">{saveLoading ? "Saving..." : "Save Customer"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
