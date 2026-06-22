import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../lib/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@segmify.ai", password: "Admin@123", remember_me: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!emailPattern.test(form.email.trim())) {
      setError("Please enter a valid admin email address.");
      return;
    }
    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { ...form, email: form.email.trim() });
      localStorage.setItem("segmify_token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in. Check the backend server and credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-grid px-6 py-10">
      <Link to="/" className="fixed right-6 top-6 font-display text-xl text-white md:right-10">
        Segmify.ai
      </Link>
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/85 shadow-soft backdrop-blur lg:grid-cols-2">
        <div className="bg-gradient-to-br from-brand-600 to-slate-950 p-10 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Segmify.ai</p>
          <h1 className="mt-6 font-display text-4xl">Admin command center.</h1>
          <p className="mt-4 max-w-md text-white/75">Monitor customer value, segment evolution, churn probability, and campaign opportunities in one place.</p>
        </div>
        <div className="p-10">
          <h2 className="font-display text-3xl text-white">Admin Login</h2>
          <p className="mt-3 text-sm text-slate-400">Use your administrator credentials to continue.</p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input name="email" value={form.email} onChange={updateField} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Email address" />
            <input name="password" value={form.password} onChange={updateField} type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Password" />
            <label className="flex items-center gap-3 text-sm text-slate-400">
              <input name="remember_me" checked={form.remember_me} onChange={updateField} type="checkbox" className="rounded" />
              Remember me
            </label>
            {error && <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <button disabled={loading} className="w-full rounded-2xl bg-white px-4 py-4 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          <div className="mt-6 flex justify-between text-sm text-slate-400">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/login">Choose login type</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
