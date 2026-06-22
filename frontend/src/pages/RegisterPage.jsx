import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../lib/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!emailPattern.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "user",
      });
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
        remember_me: true,
      });
      localStorage.setItem("segmify_token", data.access_token);
      setSuccess("Account created successfully. Opening your dashboard...");
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create account. Check the backend server and form fields.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-grid px-6 py-10 text-white">
      <Link to="/" className="fixed right-6 top-6 font-display text-xl md:right-10">
        Segmify.ai
      </Link>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-900/85 p-8 shadow-soft backdrop-blur md:p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Create account</p>
        <h1 className="mt-4 font-display text-4xl">Start your AI segmentation workspace</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Create your Segmify.ai user account to access customer intelligence dashboards and AI recommendations.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <input name="full_name" value={form.full_name} onChange={updateField} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Full Name" required />
          <input name="email" value={form.email} onChange={updateField} type="email" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Email" required />
          <input name="password" value={form.password} onChange={updateField} type="password" minLength={8} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Password" required />
          <input name="confirm_password" value={form.confirm_password} onChange={updateField} type="password" minLength={8} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-300" placeholder="Confirm Password" required />
        </div>
        {error && <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        {success && <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p>}
        <button disabled={loading} className="mt-6 rounded-2xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-brand-100 hover:text-white">Login</Link>
        </p>
      </form>
    </div>
  );
}
