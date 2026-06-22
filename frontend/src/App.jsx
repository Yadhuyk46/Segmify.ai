import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LoginSelectionPage = lazy(() => import("./pages/LoginSelectionPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const UserLoginPage = lazy(() => import("./pages/UserLoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const SegmentationPage = lazy(() => import("./pages/SegmentationPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function Wrapped(page) {
  return <AppShell>{page}</AppShell>;
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="text-center">
            <p className="font-display text-3xl">Segmify.ai</p>
            <p className="mt-3 text-slate-400">Loading customer intelligence workspace...</p>
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/login" element={<LoginSelectionPage />} />
        <Route path="/login/admin" element={<LoginPage />} />
        <Route path="/login/user" element={<UserLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<LoginPage />} />
        <Route path="/dashboard" element={Wrapped(<DashboardPage />)} />
        <Route path="/app/dashboard" element={Wrapped(<DashboardPage />)} />
        <Route path="/app/customers" element={Wrapped(<CustomersPage />)} />
        <Route path="/app/segmentation" element={Wrapped(<SegmentationPage />)} />
        <Route path="/app/analytics" element={Wrapped(<AnalyticsPage />)} />
        <Route path="/app/reports" element={Wrapped(<ReportsPage />)} />
        <Route path="/app/settings" element={Wrapped(<SettingsPage />)} />
        <Route path="/app/profile" element={Wrapped(<ProfilePage />)} />
        <Route path="/app/admin" element={Wrapped(<AdminPage />)} />
      </Routes>
    </Suspense>
  );
}
