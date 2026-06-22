export default function ProfilePage() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-500 to-accent text-4xl font-display text-white">
          SP
        </div>
        <div>
          <h2 className="font-display text-3xl">Segmify Operator</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-300">Business Analyst • Global Retail Company</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Manage your profile photo, contact details, password, and account preferences.</p>
        </div>
      </div>
    </div>
  );
}
