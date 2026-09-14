import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { StatusBadge, PriorityBadge, SlaBadge } from '../common/Badge';
import { ReportProblemModal } from './ReportProblemModal';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  HardHat,
  ChevronRight,
  Activity,
  Sparkles,
  Inbox,
  Loader2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [hostelHealth, setHostelHealth] = useState({ score: 94, grade: 'Excellent' });
  const [loading, setLoading] = useState(true);

  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentDashboard();
      setComplaints(data.recentComplaints || []);
      setMetrics(data.metrics || { total: 0, open: 0, inProgress: 0, resolved: 0 });
      if (data.hostelHealth) setHostelHealth(data.hostelHealth);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchesFilter =
      filterTab === 'ALL'
        ? true
        : filterTab === 'ACTIVE'
        ? !['RESOLVED', 'CLOSED'].includes(c.status)
        : ['RESOLVED', 'CLOSED'].includes(c.status);

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Facility Desk · Room {user?.roomNumber || 'B-204'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}
          </h1>
          <p className="mt-1 text-sm text-indigo-100 max-w-xl leading-relaxed">
            Report maintenance issues, monitor technician resolution in real-time, and verify completed repairs with your rating.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-black/10 hover:scale-105 transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Report Problem</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tickets</span>
            <Inbox className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {metrics.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Logged from your account</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Open / Triage</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {metrics.open}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending dispatch</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-2">
            {metrics.inProgress}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Technician working</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.resolved}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for verification</div>
        </div>
      </div>

      {/* Main List & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              My Reported Problems
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any ticket to view detailed technician work logs, SLA timer, and feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    filterTab === tab
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Table/Cards */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            <span className="text-xs">Loading your tickets...</span>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tickets found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'All clear! Click "Report Problem" if anything is broken in your room.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
            {filteredComplaints.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedComplaintId(item.id)}
                className="py-4 px-3 -mx-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      {item.ticketNumber}
                    </span>
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right">
                    <SlaBadge
                      deadline={item.slaDeadline}
                      isOverdue={item.isOverdue}
                      status={item.status}
                    />
                    <div className="text-[10px] text-slate-400 mt-1">
                      Reported {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ReportProblemModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onComplaintCreated={loadDashboardData}
      />

      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onUpdated={loadDashboardData}
      />
    </div>
  );
};
