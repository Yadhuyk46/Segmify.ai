import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const loginTypes = [
  {
    title: "Admin",
    text: "Manage users, audit customer intelligence workflows, and monitor platform settings.",
    icon: ShieldCheck,
    to: "/login/admin",
  },
  {
    title: "User",
    text: "Open your segmentation workspace, dashboards, reports, and AI recommendations.",
    icon: UserRound,
    to: "/login/user",
  },
];

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-hero-grid px-6 py-10 text-white">
      <Link to="/" className="fixed right-6 top-6 font-display text-xl md:right-10">
        Segmify.ai
      </Link>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-soft backdrop-blur md:p-10">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Secure access</p>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">Choose Login Type</h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Continue through the right portal for your Segmify.ai workspace.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {loginTypes.map(({ title, text, icon: Icon, to }) => (
              <Link
                key={title}
                to={to}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-300/50 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex rounded-2xl bg-brand-500/15 p-3 text-brand-100">
                    <Icon size={24} />
                  </span>
                  <ArrowRight className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" size={22} />
                </div>
                <h2 className="mt-6 font-display text-3xl">{title}</h2>
                <p className="mt-3 leading-7 text-slate-300">{text}</p>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-brand-100 hover:text-white">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
