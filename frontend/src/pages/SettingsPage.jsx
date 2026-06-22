export default function SettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-2xl">Account Settings</h2>
        <div className="mt-6 space-y-4">
          {["Full Name", "Email", "Phone Number", "Company Name", "Business Type"].map((field) => (
            <input key={field} className="w-full rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800 dark:bg-slate-950" placeholder={field} />
          ))}
        </div>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-2xl">Preferences</h2>
        <div className="mt-6 space-y-4 text-sm text-slate-500 dark:text-slate-300">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">Theme customization</div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">Language settings</div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">API key management</div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">Notification preferences</div>
        </div>
      </div>
    </div>
  );
}
