export default function StatCard({ label, value, delta }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <h3 className="font-display text-2xl text-slate-950 dark:text-white">{value}</h3>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10">
          {delta}
        </span>
      </div>
    </div>
  );
}
