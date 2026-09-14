import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint, Feedback } from '../../types';
import { StatusBadge, PriorityBadge, SlaBadge } from '../common/Badge';
import { AssetScannerModal } from './AssetScannerModal';
import { UpdateStatusModal } from './UpdateStatusModal';
import { ComplaintDetailModal } from '../student/ComplaintDetailModal';
import {
  HardHat,
  AlertTriangle,
  Clock,
  CheckCircle2,
  QrCode,
  Star,
  MapPin,
  ChevronRight,
  TrendingUp,
  Loader2,
  Calendar,
} from 'lucide-react';

export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState({
    totalAssigned: 0,
    critical: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    averageResolutionHours: 3.5,
    averageRating: 4.8,
  });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [updatingComplaint, setUpdatingComplaint] = useState<Complaint | null>(null);
  const [viewingComplaintId, setViewingComplaintId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getTechnicianDashboard();
      setTasks(res.tasks || []);
      setMetrics(res.metrics || metrics);
      setFeedbacks(res.recentFeedbacks || []);
    } catch (err) {
      console.error('Failed to fetch technician dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-500/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm mb-3">
            <HardHat className="w-3.5 h-3.5" />
            <span>Field Engineering Desk · {user?.specialty || 'General Maintenance'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Technician Dispatch: {user?.name || 'Engineer'}
          </h1>
          <p className="mt-1 text-sm text-sky-100 max-w-xl">
            Prioritize high SLA risk tasks, scan asset barcodes to view failure history, and document completed repairs with photo evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-white text-sky-700 hover:bg-sky-50 shadow-lg shadow-black/10 hover:scale-105 transition flex items-center gap-2 shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Asset QR</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Queue</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {metrics.pending + metrics.inProgress}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending resolution</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical / Escalated</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {metrics.critical}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1 font-semibold">Immediate attention</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Resolution Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.averageResolutionHours}h
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Target: &lt; 6.0h</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Student Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-baseline gap-1">
            <span>{metrics.averageRating}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Based on student verifications</div>
        </div>
      </div>

      {/* Task Queue and Reviews split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Queue - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Assigned Work Queue ({tasks.length})
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by SLA deadline urgency and priority.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-500 mb-2" />
              <span className="text-xs">Loading task queue...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-slate-800 dark:text-slate-200">
                All assigned work completed!
              </div>
              <div className="text-xs text-slate-400 mt-1">No open tickets in your queue.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-sm ${
                    task.priority === 'CRITICAL'
                      ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200 dark:ring-rose-900/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          {task.ticketNumber}
                        </span>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-slate-500 font-semibold">
                          {task.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-sky-500" />
                          {task.block} · Room {task.roomNumber}
                        </span>
                        <span>Student: {task.studentName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <SlaBadge
                        deadline={task.slaDeadline}
                        isOverdue={task.isOverdue}
                        status={task.status}
                      />

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => setViewingComplaintId(task.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                        >
                          View Info
                        </button>
                        <button
                          onClick={() => setUpdatingComplaint(task)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews and verified feedback column - 1 col */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Student Verified Reviews
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            {feedbacks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No reviews yet. Completed tickets will show student verification ratings here.
              </div>
            ) : (
              feedbacks.slice(0, 5).map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {f.studentName}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= f.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 italic">
                    "{f.comment || 'Verified and completed successfully.'}"
                  </p>
                  <div className="text-[10px] text-slate-400">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssetScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <UpdateStatusModal
        complaint={updatingComplaint}
        isOpen={!!updatingComplaint}
        onClose={() => setUpdatingComplaint(null)}
        onUpdated={loadData}
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
