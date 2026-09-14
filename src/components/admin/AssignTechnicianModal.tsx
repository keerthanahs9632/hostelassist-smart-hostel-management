import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { X, HardHat, CheckCircle2, Loader2, Phone, Sparkles } from 'lucide-react';

interface AssignTechnicianModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onAssigned,
}) => {
  const [technicians, setTechnicians] = useState<
    Array<{ id: string; name: string; email: string; specialty: string; phone?: string }>
  >([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .getTechnicians()
        .then((res) => {
          setTechnicians(res.technicians || []);
          if (res.technicians.length > 0) {
            setSelectedTechId(res.technicians[0].id);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen || !complaint) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;
    setError(null);
    setSubmitting(true);
    try {
      await api.assignTechnician(complaint.id, selectedTechId);
      onAssigned();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign technician.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Dispatch Technician
              </h2>
              <p className="text-xs text-slate-400 font-mono">{complaint.ticketNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">{complaint.title}</div>
            <div className="text-slate-500 mt-0.5">
              Category: <strong className="text-slate-700 dark:text-slate-300">{complaint.category}</strong> · Location: {complaint.block} ({complaint.roomNumber})
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Field Engineer
            </label>

            {loading ? (
              <div className="py-6 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading technicians...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {technicians.map((t) => {
                  const isCategoryMatch = t.specialty?.toLowerCase().includes(complaint.category.toLowerCase());
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTechId(t.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        selectedTechId === t.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{t.name}</span>
                          {isCategoryMatch && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                              <Sparkles className="w-2.5 h-2.5" /> Best Match
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Specialty: {t.specialty || 'General Maintenance'}
                        </div>
                      </div>

                      {t.phone && (
                        <span className="text-[10px] text-slate-400 font-mono">{t.phone}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedTechId}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Confirm Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
