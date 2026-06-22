import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import StatCard from "../components/shared/StatCard";
import { activity, cards, growth, segments } from "../data/mock";

const palette = ["#06b6d4", "#0f172a", "#f97316", "#14b8a6", "#8b5cf6", "#84cc16"];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Growth trend</p>
              <h3 className="font-display text-2xl">Customer and revenue growth</h3>
            </div>
            <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-800">Export Report</button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="customers" stroke="#06b6d4" strokeWidth={3} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Segment distribution</p>
          <h3 className="font-display text-2xl">Audience mix</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segments} innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={4}>
                  {segments.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {segments.map((item, index) => (
              <div key={item.name} className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                  {item.name}
                </div>
                <p className="mt-2 font-semibold">{item.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">AI recommendations</p>
          <h3 className="font-display text-2xl">Actions for growth this week</h3>
          <div className="mt-5 space-y-4">
            {[
              "Target premium buyers in electronics with VIP early access bundles.",
              "Launch a retention workflow for the 301 customers showing rising churn risk.",
              "Offer cross-sell kits to loyal urban segments with medium-to-high loyalty scores.",
            ].map((text) => (
              <div key={text} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">{text}</div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time activity</p>
          <h3 className="font-display text-2xl">Latest signals</h3>
          <div className="mt-5 space-y-4">
            {activity.map((item) => (
              <div key={item.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
