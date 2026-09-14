import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HealthScoreData, RecurringIssueAlert, Complaint, TechnicianMetric, AuditLog } from '../../types';
import { StatusBadge, PriorityBadge, SlaBadge } from '../common/Badge';
import { AssignTechnicianModal } from './AssignTechnicianModal';
import { ComplaintDetailModal } from '../student/ComplaintDetailModal';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Activity,
  HardHat,
  ChevronRight,
  Sparkles,
  Users,
  QrCode,
  Calendar,
  Layers,
  FileSpreadsheet,
  Loader2,
  AlertOctagon,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<{
    healthScore: HealthScoreData;
    metrics: any;
    recurringIssues: RecurringIssueAlert[];
    overdueComplaints: Complaint[];
    technicianLeaderboard: TechnicianMetric[];
    recentAuditLogs: AuditLog[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [viewingComplaintId, setViewingComplaintId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
        <span className="text-xs">Synthesizing hostel operations metrics...</span>
      </div>
    );
  }

  const { healthScore, metrics, recurringIssues, overdueComplaints, technicianLeaderboard } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hostel Warden &amp; Operations Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Infrastructure Overview
          </h1>
          <p className="mt-1 text-sm text-slate-300 max-w-xl">
            Real-time SLA monitoring, predictive failure pattern alerts, technician workload balancing, and maintenance expenditure intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('complaints')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
          >
            Dispatch Desk
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Heatmap &amp; Cost
          </button>
        </div>
      </div>

      {/* Health Score & Overdue Alert Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Gauge Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                Hostel Health Index
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  healthScore.score >= 85
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : healthScore.score >= 70
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {healthScore.grade}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {healthScore.score}
              </span>
              <span className="text-sm text-slate-400 font-bold">/ 100</span>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Algorithmic score calculating SLA adherence, recurring failure frequency, student satisfaction ratings, and asset wear.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
            <div className="text-slate-600 dark:text-slate-400">
              Critical Penalty:{' '}
              <strong className="text-rose-600">-{healthScore.breakdown.criticalPenalty} pts</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              SLA Breaches:{' '}
              <strong className="text-amber-600">-{healthScore.breakdown.slaPenalty} pts</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Recurring Breakdowns:{' '}
              <strong className="text-purple-600">-{healthScore.breakdown.recurringPenalty} pts</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Student Rating Bonus:{' '}
              <strong className="text-emerald-600">+{healthScore.breakdown.feedbackBonus} pts</strong>
            </div>
          </div>
        </div>

        {/* SLA Escalations & Overdue Queue */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Active SLA Escalation Alarms ({overdueComplaints.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              View all dispatch
            </button>
          </div>

          {overdueComplaints.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>All tickets are currently within SLA deadlines. No active breaches!</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
              {overdueComplaints.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500">{item.ticketNumber}</span>
                      <PriorityBadge priority={item.priority} />
                      <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.block} · Room {item.roomNumber} · Assigned:{' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {item.assignedTechnicianName || 'Unassigned'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SlaBadge
                      deadline={item.slaDeadline}
                      isOverdue={true}
                      status={item.status}
                    />
                    {!item.assignedTechnicianId && (
                      <button
                        onClick={() => setAssigningComplaint(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Critical issues escalate automatically if unresolved after 2 hours.</span>
            <span className="font-semibold text-rose-600">{overdueComplaints.length} overdue</span>
          </div>
        </div>
      </div>

      {/* Recurring Failure Pattern Alerts */}
      {recurringIssues.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-200">
                  Recurring Failure Pattern Alerts ({recurringIssues.length} Detected)
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  Multiple breakdowns detected within 90 days in the same hostel location. Component replacement recommended over repetitive patching.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('preventive')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
            >
              Schedule Preventive Ops
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recurringIssues.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-sm text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {alert.block} · Room {alert.roomNumber} ({alert.category})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    {alert.count} Breakdowns
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                  "{alert.descriptionSnippet}"
                </p>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[11px] text-amber-900 dark:text-amber-200">
                  <strong>AI Predictive Recommendation:</strong> {alert.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Tickets
          </span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {metrics.totalComplaints}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
            Open Backlog
          </span>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {metrics.openCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 block">
            In Progress
          </span>
          <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
            {metrics.inProgressCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">
            Resolved
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.resolvedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Maintenance Spend
          </span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{metrics.totalMaintenanceCost.toFixed(0)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
            Tracked Assets
          </span>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.assetCount}
          </div>
        </div>
      </div>

      {/* Technician Leaderboard & Fast Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard - 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-sky-500" />
                <span>Technician Dispatch &amp; Performance</span>
              </h2>
              <p className="text-xs text-slate-500">
                Workload balancing, SLA compliance rates, and student review ratings.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Engineer</th>
                  <th className="pb-3">Specialty</th>
                  <th className="pb-3 text-center">Workload</th>
                  <th className="pb-3 text-center">Resolved</th>
                  <th className="pb-3 text-center">Avg Time</th>
                  <th className="pb-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {technicianLeaderboard.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {tech.name}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {tech.specialty}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                        {tech.openWorkload} active
                      </span>
                    </td>
                    <td className="py-3 text-center font-semibold text-emerald-600">
                      {tech.totalResolved}
                    </td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-400">
                      {tech.avgResolutionHours}h
                    </td>
                    <td className="py-3 text-right font-bold text-amber-500">
                      ★ {tech.avgRating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Command Modules - 1 col */}
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Operations Modules
          </h2>

          <div
            onClick={() => onNavigate('complaints')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                All Complaints &amp; Dispatch Desk
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Filter tickets, assign technicians, and monitor status transitions.
            </p>
          </div>

          <div
            onClick={() => onNavigate('assets')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Asset Inventory &amp; QR Barcodes
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Hostel equipment registry, QR download tags, and failure histories.
            </p>
          </div>

          <div
            onClick={() => onNavigate('analytics')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Problem Heatmap &amp; Maintenance Cost
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Matrix heatmap of failures by block, and monthly repair expenditure.
            </p>
          </div>

          <div
            onClick={() => onNavigate('preventive')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Preventive Maintenance Ops
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Scheduled geyser descaling, tank chlorination, and switchboard inspections.
            </p>
          </div>

          <div
            onClick={() => onNavigate('audit')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                System Audit Trail Logs
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Immutable log of role authentications, ticket dispatches, and cost edits.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignTechnicianModal
        complaint={assigningComplaint}
        isOpen={!!assigningComplaint}
        onClose={() => setAssigningComplaint(null)}
        onAssigned={loadData}
      />

      <ComplaintDetailModal
        complaintId={viewingComplaintId}
        isOpen={!!viewingComplaintId}
        onClose={() => setViewingComplaintId(null)}
        onUpdated={loadData}
      />
    </div>
  );
};
