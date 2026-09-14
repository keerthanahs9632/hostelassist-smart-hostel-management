import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Complaint, ComplaintCategory, PriorityLevel, ComplaintStatus } from '../../types';
import { StatusBadge, PriorityBadge, SlaBadge } from '../common/Badge';
import { AssignTechnicianModal } from './AssignTechnicianModal';
import { ComplaintDetailModal } from '../student/ComplaintDetailModal';
import {
  Search,
  Filter,
  UserPlus,
  ChevronRight,
  HardHat,
  Loader2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ComplaintsManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [viewingComplaintId, setViewingComplaintId] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.getComplaints(params);
      setComplaints(res.complaints || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, priorityFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleExportCsv = () => {
    if (complaints.length === 0) return;
    const headers = [
      'Ticket Number',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Block',
      'Room Number',
      'Reported By',
      'Assigned Engineer',
      'SLA Deadline',
      'Is Overdue',
      'Repair Cost (INR)',
      'Created At',
    ];

    const rows = complaints.map((c) => [
      `"${c.ticketNumber}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${c.block}"`,
      `"${c.roomNumber}"`,
      `"${c.reportedByName}"`,
      `"${c.assignedTechnicianName || 'Unassigned'}"`,
      `"${new Date(c.slaDeadline).toLocaleString()}"`,
      `"${c.isOverdue ? 'YES' : 'NO'}"`,
      `"${c.repairCost || 0}"`,
      `"${new Date(c.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hostel_Maintenance_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Complaints Dispatch Desk
          </h1>
          <p className="text-xs text-slate-500">
            Total {total} tickets logged. Filter by category, priority, status, or search student/room.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={complaints.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket, room, title, or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
          />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Categories</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Furniture">Furniture</option>
          <option value="Water">Water</option>
          <option value="Internet">Internet</option>
          <option value="Bathroom">Bathroom</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical (2h SLA)</option>
          <option value="HIGH">High (6h SLA)</option>
          <option value="MEDIUM">Medium (24h SLA)</option>
          <option value="LOW">Low (72h SLA)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Statuses</option>
          <option value="REPORTED">Reported</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        {(categoryFilter || priorityFilter || statusFilter || search) && (
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('');
              setPriorityFilter('');
              setStatusFilter('');
              setSearch('');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            <span className="text-xs">Fetching complaint records...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No complaints found matching current query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4">Assigned Engineer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      {c.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {c.block}, Rm {c.roomNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {c.category}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4">
                      <SlaBadge
                        deadline={c.slaDeadline}
                        isOverdue={c.isOverdue}
                        status={c.status}
                      />
                    </td>
                    <td className="py-3 px-4">
                      {c.assignedTechnicianName ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {c.assignedTechnicianName}
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {!c.assignedTechnicianId && !['RESOLVED', 'CLOSED'].includes(c.status) && (
                        <button
                          onClick={() => setAssigningComplaint(c)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        >
                          Dispatch
                        </button>
                      )}
                      <button
                        onClick={() => setViewingComplaintId(c.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignTechnicianModal
        complaint={assigningComplaint}
        isOpen={!!assigningComplaint}
        onClose={() => setAssigningComplaint(null)}
        onAssigned={fetchComplaints}
      />

      <ComplaintDetailModal
        complaintId={viewingComplaintId}
        isOpen={!!viewingComplaintId}
        onClose={() => setViewingComplaintId(null)}
        onUpdated={fetchComplaints}
      />

      {/* Printable Executive Operations Summary Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto print:m-0 print:p-0 print:shadow-none print:border-none">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Printer className="w-4 h-4" />
                <span>Hostel Operations Executive Brief</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="pt-6 space-y-6 text-slate-900 dark:text-slate-100">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
                  University Student Housing Services
                </span>
                <h2 className="text-2xl font-black mt-1">Hostel Infrastructure Operations Report</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Generated on {new Date().toLocaleDateString()} · Campus Chief Warden Directorate
                </p>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Issues</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{complaints.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[10px] text-emerald-600 block uppercase font-bold">Resolved</span>
                  <span className="text-xl font-black text-emerald-600">
                    {complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                  <span className="text-[10px] text-rose-600 block uppercase font-bold">Overdue SLA</span>
                  <span className="text-xl font-black text-rose-600">
                    {complaints.filter((c) => c.isOverdue).length}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                  <span className="text-[10px] text-amber-600 block uppercase font-bold">Maint. Expense</span>
                  <span className="text-xl font-black text-amber-600">
                    ₹{complaints.reduce((acc, c) => acc + (c.repairCost || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Active Tickets Breakdown
                </h3>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Ticket</th>
                        <th className="py-2.5 px-3">Room / Spot</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Engineer</th>
                        <th className="py-2.5 px-3 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {complaints.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2 px-3 font-mono text-[11px] font-bold">{c.ticketNumber}</td>
                          <td className="py-2 px-3">{c.block}, {c.roomNumber}</td>
                          <td className="py-2 px-3">{c.category}</td>
                          <td className="py-2 px-3 font-bold">{c.priority}</td>
                          <td className="py-2 px-3">{c.status}</td>
                          <td className="py-2 px-3">{c.assignedTechnicianName || 'Pending'}</td>
                          <td className="py-2 px-3 text-right font-mono">₹{c.repairCost || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signoff block */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Warden Office Audit Stamp</p>
                  <p className="mt-6 border-t border-slate-300 dark:border-slate-700 pt-1">Verified &amp; Approved</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Director of Campus Facilities</p>
                  <p className="mt-6 border-t border-slate-300 dark:border-slate-700 pt-1">Official Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
