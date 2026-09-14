import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PreventiveMaintenanceSchedule, ComplaintCategory } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  AlertTriangle,
  Loader2,
  X,
  Layers,
} from 'lucide-react';

export const PreventiveMaintenanceView: React.FC = () => {
  const [schedules, setSchedules] = useState<PreventiveMaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCategory, setTargetCategory] = useState<ComplaintCategory>('Plumbing');
  const [targetBlock, setTargetBlock] = useState('Block B');
  const [suggestedAction, setSuggestedAction] = useState('');
  const [frequencyDays, setFrequencyDays] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.getPreventiveSchedules();
      setSchedules(res.schedules || []);
    } catch (err) {
      console.error('Failed to load preventive schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'SCHEDULED' ? 'COMPLETED' : 'SCHEDULED';
    try {
      await api.updatePreventiveScheduleStatus(id, nextStatus);
      fetchSchedules();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !suggestedAction) return;
    setSubmitting(true);
    try {
      await api.createPreventiveSchedule({
        title,
        description,
        targetCategory,
        targetBlock,
        suggestedAction,
        frequencyDays: parseInt(frequencyDays) || 30,
        nextScheduledDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setSuggestedAction('');
      fetchSchedules();
    } catch (err) {
      console.error('Failed to create preventive schedule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-500" />
            <span>Preventive Maintenance &amp; Failure Prevention</span>
          </h1>
          <p className="text-xs text-slate-500">
            Automated recurring service routines and AI-suggested preventative actions before catastrophic breakdowns occur.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Scheduled Routine</span>
        </button>
      </div>

      {/* Routine Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
          <span className="text-xs">Loading preventive schedules...</span>
        </div>
      ) : schedules.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          No preventive routines scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    {item.createdReason === 'AI_FAILURE_PATTERN_ALERT' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Sparkles className="w-2.5 h-2.5" /> AI Pattern Triggered
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Target: {item.targetBlock} · {item.targetCategory} · Every {item.frequencyDays} days
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(item.id, item.status)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.status}</span>
                </button>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Standard Operating Action:
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {item.suggestedAction}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Next Scheduled: {item.nextScheduledDate}</span>
                <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                New Scheduled Maintenance Routine
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser Descaling & Thermostat Audit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as ComplaintCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Water">Water</option>
                    <option value="Internet">Internet</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hostel Block
                  </label>
                  <select
                    value={targetBlock}
                    onChange={(e) => setTargetBlock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Block D">Block D</option>
                    <option value="All Blocks">All Blocks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Suggested Procedure / Action
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Flush sediment, check heating element resistance, inspect safety valve..."
                  value={suggestedAction}
                  onChange={(e) => setSuggestedAction(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recurrence Frequency (Days)
                </label>
                <input
                  type="number"
                  value={frequencyDays}
                  onChange={(e) => setFrequencyDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500"
                >
                  {submitting ? 'Saving...' : 'Add Preventive Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
