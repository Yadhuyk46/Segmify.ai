import { ArrowRight, Bot, ChartSpline, CircleDollarSign, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

import SectionTitle from "../components/shared/SectionTitle";
import { stats } from "../data/mock";

const features = [
  { icon: Bot, title: "AI Segmentation", text: "Cluster and classify customers with K-Means, KNN, and hierarchical intelligence." },
  { icon: ChartSpline, title: "Live Analytics", text: "Track revenue, retention, churn, and segment performance through executive dashboards." },
  { icon: CircleDollarSign, title: "Growth Recommendations", text: "Discover high-value cohorts, next-best offers, and upsell opportunities instantly." },
  { icon: ShieldCheck, title: "Business-Ready Security", text: "JWT auth, RBAC, input validation, audit logs, and secure API architecture." },
];

const growthData = [
  { month: "Jan", customers: 920 },
  { month: "Feb", customers: 1180 },
  { month: "Mar", customers: 1460 },
  { month: "Apr", customers: 1780 },
  { month: "May", customers: 2240 },
  { month: "Jun", customers: 2860 },
];

const revenueData = [
  { month: "Jan", revenue: 38 },
  { month: "Feb", revenue: 45 },
  { month: "Mar", revenue: 54 },
  { month: "Apr", revenue: 68 },
  { month: "May", revenue: 83 },
  { month: "Jun", revenue: 101 },
];

const clvData = [
  { tier: "Low Value", loyalty: 22, spend: 18, clv: 1100, color: "#38bdf8" },
  { tier: "Low Value", loyalty: 35, spend: 28, clv: 1400, color: "#38bdf8" },
  { tier: "Medium Value", loyalty: 52, spend: 44, clv: 3600, color: "#2dd4bf" },
  { tier: "Medium Value", loyalty: 64, spend: 58, clv: 4700, color: "#2dd4bf" },
  { tier: "High Value", loyalty: 78, spend: 74, clv: 8200, color: "#f97316" },
  { tier: "High Value", loyalty: 88, spend: 86, clv: 9800, color: "#f97316" },
];

const geoPoints = [
  { city: "New York", x: "23%", y: "42%", value: "31%" },
  { city: "London", x: "48%", y: "35%", value: "22%" },
  { city: "Dubai", x: "58%", y: "50%", value: "14%" },
  { city: "Singapore", x: "72%", y: "63%", value: "18%" },
  { city: "Sydney", x: "82%", y: "77%", value: "9%" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ full_name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ type: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);

  function updateContactField(event) {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
  }

  async function submitContactForm(event) {
    event.preventDefault();
    setContactStatus({ type: "", message: "" });

    if (!contactForm.full_name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactStatus({ type: "error", message: "Please complete all inquiry fields." });
      return;
    }
    if (!emailPattern.test(contactForm.email.trim())) {
      setContactStatus({ type: "error", message: "Please enter a valid work email." });
      return;
    }

    setContactLoading(true);
    try {
      await axios.post("/api/contact", {
        full_name: contactForm.full_name.trim(),
        email: contactForm.email.trim(),
        message: contactForm.message.trim(),
      }, {
        headers: { "Content-Type": "application/json" },
      });
      setContactStatus({ type: "success", message: "Inquiry submitted successfully" });
      setContactForm({ full_name: "", email: "", message: "" });
    } catch (err) {
      setContactStatus({ type: "error", message: err.response?.data?.detail || "Unable to submit inquiry. Please try again." });
    } finally {
      setContactLoading(false);
    }
  }

  return (
    <div className="bg-slate-950 text-white">
      <section className="relative overflow-hidden bg-hero-grid">
        <div className="absolute right-6 top-6 z-10 font-display text-xl text-white md:right-10">
          Segmify.ai
        </div>
        <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-brand-100">
              Smart Customer Segmentation Powered by AI
            </span>
            <h1 className="mt-8 max-w-3xl font-display text-5xl leading-tight md:text-7xl">
              See who your best customers are before your competitors do.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Segmify.ai helps teams collect customer data, predict high-value segments, detect churn risk, and turn behavior into revenue-ready strategy.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:translate-y-[-2px]">
                Create Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="rounded-2xl border border-white/15 px-6 py-4 font-semibold text-white">
                Login
              </Link>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-3xl font-display">{item.value}</p>
                  <p className="mt-2 text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-soft backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6">
                <p className="text-sm text-white/80">Predicted Top Segment</p>
                <h3 className="mt-3 font-display text-3xl">Premium Customers</h3>
                <p className="mt-4 text-sm text-white/80">Confidence 98.4% across revenue-led cohorts</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-slate-400">Churn Alert</p>
                <h3 className="mt-3 font-display text-3xl text-accent">301</h3>
                <p className="mt-4 text-sm text-slate-400">Customers need retention action this week</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:col-span-2">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Campaign Opportunity</p>
                    <h3 className="mt-3 font-display text-2xl">Upsell electronics to loyal urban buyers</h3>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">+24% est. lift</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionTitle eyebrow="Features" title="Everything you need to turn customer data into action" text="Designed for analysts, admins, and business teams that need speed, clarity, and trustworthy AI outputs." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="inline-flex rounded-2xl bg-brand-500/15 p-3 text-brand-200">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-xl">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <SectionTitle eyebrow="How It Works" title="Simple for beginners, powerful for growth teams" text="Import customer data, train the model, explore dashboards, and export reports your stakeholders can act on." />
          <div className="mt-10 space-y-5">
            {["Upload customer records", "Train segmentation engine", "Analyze cohorts and churn", "Deploy offers with AI insights"].map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950 font-bold">{index + 1}</span>
                <p className="font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8">
            <h3 className="font-display text-2xl">Pricing Plans</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {["Starter", "Growth", "Scale"].map((tier, index) => (
                <div key={tier} className={`rounded-3xl p-5 ${index === 1 ? "bg-white text-slate-950" : "border border-white/10 bg-white/5"}`}>
                  <p className="font-semibold">{tier}</p>
                  <p className="mt-3 font-display text-3xl">{["$29", "$99", "$249"][index]}</p>
                  <p className="mt-3 text-sm opacity-80">Perfect for {["new teams", "analyst-led companies", "multi-brand operations"][index]}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h3 className="font-display text-2xl">Testimonials</h3>
            <p className="mt-4 text-slate-300">“Segmify.ai helped us spot revenue-ready customer groups in a week and improved retention playbooks immediately.”</p>
            <p className="mt-4 text-sm text-slate-500">Ariana Cho, Growth Director</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <SectionTitle eyebrow="Analytics Preview" title="Executive-grade visibility, without the spreadsheet chaos" text="Track segment shifts, revenue momentum, churn movement, and action-ready AI suggestions from one operating dashboard." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="group rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-brand-300/40">
              <div className="flex items-center justify-between">
                <p className="font-display text-xl">Customer Growth</p>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">+211%</span>
              </div>
              <div className="mt-4 h-36 rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent/10 p-3 shadow-[0_0_28px_rgba(6,182,212,0.12)]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="customerGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
                    <Area type="monotone" dataKey="customers" stroke="#67e8f9" strokeWidth={3} fill="url(#customerGrowth)" dot={false} activeDot={{ r: 5, fill: "#fff", stroke: "#06b6d4", strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-brand-300/40">
              <div className="flex items-center justify-between">
                <p className="font-display text-xl">Revenue Trend</p>
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs text-brand-100">$101k</span>
              </div>
              <div className="mt-4 h-36 rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent/10 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
                    <Bar dataKey="revenue" radius={[8, 8, 2, 2]}>
                      {revenueData.map((entry, index) => (
                        <Cell key={entry.month} fill={index > 3 ? "#22d3ee" : "#155e75"} className="transition-opacity hover:opacity-80" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-brand-300/40">
              <div className="flex items-center justify-between">
                <p className="font-display text-xl">CLV Mapping</p>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-orange-200">3 tiers</span>
              </div>
              <div className="mt-4 h-36 rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent/10 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="loyalty" type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="spend" type="number" hide domain={[0, 100]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3", stroke: "rgba(103,232,249,0.35)" }} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
                    <Scatter data={clvData} dataKey="spend">
                      {clvData.map((entry) => (
                        <Cell key={`${entry.tier}-${entry.clv}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                {["Low Value", "Medium Value", "High Value"].map((tier) => <span key={tier}>{tier}</span>)}
              </div>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-brand-300/40">
              <div className="flex items-center justify-between">
                <p className="font-display text-xl">Geo Insights</p>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Global</span>
              </div>
              <div className="relative mt-4 h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent/10">
                <div className="absolute inset-4 rounded-[45%] border border-brand-200/10" />
                <div className="absolute left-[13%] top-[32%] h-8 w-20 rounded-full bg-slate-700/50 blur-[1px]" />
                <div className="absolute left-[42%] top-[28%] h-7 w-24 rounded-full bg-slate-700/50 blur-[1px]" />
                <div className="absolute left-[58%] top-[53%] h-8 w-28 rounded-full bg-slate-700/50 blur-[1px]" />
                <div className="absolute left-[76%] top-[70%] h-6 w-16 rounded-full bg-slate-700/50 blur-[1px]" />
                {geoPoints.map((point) => (
                  <div key={point.city} className="absolute" style={{ left: point.x, top: point.y }}>
                    <span className="absolute -left-2 -top-2 h-4 w-4 animate-ping rounded-full bg-cyan-300/40" />
                    <span className="relative block h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)]" title={`${point.city}: ${point.value}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <SectionTitle eyebrow="FAQ" title="Questions teams ask before they switch" text="Segmify.ai is built to be simple enough for students and startups, while still feeling like a serious business analytics platform." />
          <div className="mt-8 space-y-4">
            {[
              "Can I use my own customer CSV files? Yes, the backend is structured for imports and local seeding.",
              "Does it support role-based access? Yes, Admin, Analyst, and Standard User roles are included.",
              "Can I swap SQLite for PostgreSQL? Yes, change the `DATABASE_URL` and run migrations in production.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 p-4 text-slate-300">{item}</div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <SectionTitle eyebrow="Contact" title="Book a product walkthrough" text="Use this contact area as the base for a support or sales form in production." />
          <form className="mt-8 space-y-4" onSubmit={submitContactForm}>
            <input name="full_name" value={contactForm.full_name} onChange={updateContactField} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Full Name" />
            <input name="email" value={contactForm.email} onChange={updateContactField} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Work Email" />
            <textarea name="message" value={contactForm.message} onChange={updateContactField} rows="5" className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Tell us about your segmentation goals" />
            {contactStatus.message && (
              <p className={`rounded-2xl px-4 py-3 text-sm ${contactStatus.type === "success" ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border border-red-400/20 bg-red-500/10 text-red-200"}`}>
                {contactStatus.message}
              </p>
            )}
            <button disabled={contactLoading} className="rounded-2xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {contactLoading ? "Sending..." : "Send Inquiry"}
            </button>
          </form>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-20 text-center">
        <h3 className="font-display text-4xl">Ready to predict your next best customers?</h3>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">Move from spreadsheets to AI-assisted segmentation, reporting, and decision-making in one platform.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/signup" className="rounded-2xl bg-brand-500 px-6 py-4 font-semibold">Get Started</Link>
          <Link to="/app/dashboard" className="rounded-2xl border border-white/15 px-6 py-4 font-semibold">View Demo</Link>
        </div>
        <footer className="mx-auto mt-16 max-w-6xl border-t border-white/10 pt-8 text-sm text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>Segmify.ai</p>
            <p>Customer segmentation, predictive insights, and growth recommendations in one AI platform.</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
