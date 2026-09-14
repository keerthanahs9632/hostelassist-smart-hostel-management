import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  Shield,
  Sparkles,
  Zap,
  Activity,
  QrCode,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  Database,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectRole: (role: 'STUDENT' | 'TECHNICIAN' | 'ADMIN') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onSelectRole }) => {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/10 dark:bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Next-Gen Campus Infrastructure Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Smart Hostel Operations &amp;{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
              Predictive Maintenance
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate hostel downtime with automated complaint triage, real-time SLA escalation, recurring failure detection, and asset lifecycle tracking.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onSelectRole('STUDENT')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition flex items-center gap-2"
            >
              <span>Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectRole('TECHNICIAN')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm transition flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-sky-500" />
              <span>Technician Workspace</span>
            </button>

            <button
              onClick={() => onSelectRole('ADMIN')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-sm transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Admin Command Center</span>
            </button>
          </div>

          {/* Interactive Role Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <div
              onClick={() => onSelectRole('STUDENT')}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                Student Experience
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Report electrical, plumbing, or room issues with AI assistance. Instant category recommendations, live SLA countdown, and 1-5 star verification feedback.
              </p>
            </div>

            <div
              onClick={() => onSelectRole('TECHNICIAN')}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                Technician Dispatch
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Field engineer dashboard with prioritized queue, SLA timers, work notes, repair cost tracking, repair photo evidence upload, and asset QR lookup.
              </p>
            </div>

            <div
              onClick={() => onSelectRole('ADMIN')}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                Admin &amp; Predictive Ops
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamic Hostel Health Score, automated recurring problem cluster detection, problem heatmap matrix, maintenance expenditure analytics, and audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Bento Grid */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Beyond Basic Ticketing
            </span>
            <h2 className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-white">
              Intelligent Engineering for Modern Campus Facilities
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              HostelAssist transforms complaints into predictive maintenance intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Smart Classification &amp; Triage
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Natural language problem parser powered by Gemini with local rule fallback. Detects safety hazards (sparks, burning, pipe bursts) and suggests priority and root causes before ticket creation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Recurring Failure Detection
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Identifies repeated breakdowns in the same room or asset within 90 days. Flags component fatigue and generates replacement recommendations over continuous patching.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Hostel Health Score (0-100)
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Algorithmic score synthesized from unresolved tickets, SLA compliance ratios, student satisfaction ratings, recurring failure penalties, and physical asset conditions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                QR Code Asset Registry
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate high-resolution QR tags for fans, geysers, Wi-Fi routers, and water coolers. Field technicians scan with mobile to view full service history and cumulative repair costs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Real SLA &amp; Escalation Engine
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Enforces strict SLA targets (Critical: 2h, High: 6h, Medium: 24h, Low: 72h). Overdue tickets automatically trigger escalation alerts to wardens and administrators.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Cost Intelligence &amp; Heatmap
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Breakdown of maintenance expenditure by hostel block and category. Visual density heatmap pinpointing high-failure corridors and floors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">HOSTELASSIST</span>
            <span className="text-xs text-slate-400">· Campus Facility Intelligence</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
            Full-Stack Spring Boot &amp; React Enterprise Architecture · JWT &amp; BCrypt Security · MySQL Engine
          </p>
        </div>
      </footer>
    </div>
  );
};
