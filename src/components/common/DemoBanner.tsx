import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Sparkles,
  GraduationCap,
  HardHat,
  Shield,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  X,
  PlayCircle,
  FileSpreadsheet,
  QrCode,
  AlertTriangle,
} from 'lucide-react';

interface DemoBannerProps {
  onNavigateToView?: (view: string) => void;
  onOpenReportModal?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  onNavigateToView,
  onOpenReportModal,
}) => {
  const { user, switchDemoRole } = useAuth();
  const [showTourModal, setShowTourModal] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'STUDENT',
      label: 'Student',
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-600',
      desc: 'Ananya · Rm B-204 · AI Triage & Feedback',
    },
    {
      role: 'TECHNICIAN',
      label: 'Technician',
      icon: HardHat,
      color: 'from-sky-500 to-indigo-600',
      desc: 'Rahul · Field Ops, Asset QR & Spare Parts ₹',
    },
    {
      role: 'ADMIN',
      label: 'Hostel Warden',
      icon: Shield,
      color: 'from-indigo-600 to-purple-600',
      desc: 'Dr. Sharma · Health Score, Heatmap & Dispatch',
    },
  ];

  return (
    <>
      <div className="w-full bg-slate-900 border-b border-slate-800 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Campus Workspace</span>
          </div>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-300 font-medium hidden md:inline">
            Solving real-world university hostel maintenance bottlenecks
          </span>
        </div>

        {/* Center/Right: Role Switch Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium hidden lg:inline mr-1">
            Active Workspace:
          </span>
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = user?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => {
                  switchDemoRole(r.role);
                  if (onNavigateToView) onNavigateToView('dashboard');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400 scale-[1.02]'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
                title={`Switch to ${r.label} mode: ${r.desc}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {isActive && (
                  <span className="text-[9px] px-1 rounded bg-white/20 uppercase tracking-wider">
                    Live
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => setShowTourModal(true)}
            className="ml-1 flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Scenarios</span>
          </button>
        </div>
      </div>

      {/* Real-World Walkthrough Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Real-World End-to-End Test Journey
                  </h3>
                  <p className="text-xs text-slate-400">
                    How HostelAssist eliminates hostel downtime and fixes campus infrastructure
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTourModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 leading-relaxed">
                💡 <strong className="text-white">Real-world Problem:</strong> University hostels experience 40%+ delayed repairs, forgotten maintenance complaints, safety hazards (sparks, geyser boiling leaks), and zero accountability for repair expenditure. Follow these steps to test how our platform solves it:
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-white text-sm">
                      Student Lodges Complaint with Gemini AI Triage
                    </h4>
                    <p className="text-slate-300">
                      Switch to <strong>Student</strong>, click <em>Report Problem</em>, and pick an instant preset like <em>"⚡ Sparking Socket"</em> or <em>"🚰 Geyser Steam &amp; Leak"</em>. Gemini AI categorizes it, detects safety hazards, and sets strict SLA deadlines.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={async () => {
                          await switchDemoRole('STUDENT');
                          if (onNavigateToView) onNavigateToView('dashboard');
                          setShowTourModal(false);
                          if (onOpenReportModal) onOpenReportModal();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Launch Student &amp; Report Issue</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-white text-sm">
                      Chief Warden Inspects Heatmap &amp; Dispatches Tech
                    </h4>
                    <p className="text-slate-300">
                      Switch to <strong>Hostel Warden (Admin)</strong> to view the live <em>Campus Spatial Heatmap</em>, failure density by block, and assign Technician Rahul with a single click.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={async () => {
                          await switchDemoRole('ADMIN');
                          if (onNavigateToView) onNavigateToView('complaints');
                          setShowTourModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold inline-flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Open Warden Dispatch Desk</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-white text-sm">
                      Field Technician Scans Asset QR &amp; Logs Spare Parts
                    </h4>
                    <p className="text-slate-300">
                      Switch to <strong>Technician</strong>, scan equipment QR barcode, view replacement history, log spare parts cost (e.g., ₹450 for heating element), and mark Resolved.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={async () => {
                          await switchDemoRole('TECHNICIAN');
                          if (onNavigateToView) onNavigateToView('dashboard');
                          setShowTourModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold inline-flex items-center gap-1.5"
                      >
                        <HardHat className="w-3.5 h-3.5" />
                        <span>Open Technician Workspace</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-white text-sm">
                      Student Verifies Repair &amp; Admin Exports Analytics
                    </h4>
                    <p className="text-slate-300">
                      Student gets verified notification, gives a 5-star rating (with confetti!), and Admin can export the complete maintenance CSV or print executive reports.
                    </p>
                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={async () => {
                          await switchDemoRole('ADMIN');
                          if (onNavigateToView) onNavigateToView('analytics');
                          setShowTourModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold inline-flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>View Analytics &amp; Reports</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowTourModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close &amp; Explore
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
