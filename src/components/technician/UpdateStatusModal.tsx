import React, { useState } from 'react';
import { api } from '../../services/api';
import { Complaint, ComplaintStatus } from '../../types';
import {
  X,
  CheckCircle,
  Loader2,
  DollarSign,
  FileText,
  Camera,
  AlertTriangle,
  HardHat,
} from 'lucide-react';

interface UpdateStatusModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const QUICK_RESOLUTIONS = [
  {
    label: '⚡ Rewired Socket & Replaced Plate',
    notes: 'Isolated power at distribution board. Removed charred 16A modular socket, trimmed oxidized copper wires, installed Anchor Roma 16A socket and re-torqued terminal screws. Load-tested at 230V.',
    cost: '180',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: '🚰 Replaced Geyser Valve & Gasket',
    notes: 'Drained 25L geyser, replaced malfunctioning 8-bar pressure relief valve and degraded silicone flange gasket. Powered on and verified zero leak during 20-min thermal heating cycle.',
    cost: '450',
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: '📶 Re-crimped RJ45 & PoE Reboot',
    notes: 'Diagnosed broken locking clip on uplink cable to ceiling AP. Re-crimped Cat6 RJ-45 with gold-plated pass-through connector. Power cycled PoE port; AP booted green with 5GHz beacon active.',
    cost: '60',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: '💧 Flushed Sediment & Replaced RO Filter',
    notes: 'Replaced 5-micron spun polypropylene pre-filter cartridge and flushed commercial carbon block. Calibrated TDS meter to 110 ppm and verified pure potable flow rate.',
    cost: '320',
    img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
  },
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [workNotes, setWorkNotes] = useState('');
  const [repairCost, setRepairCost] = useState<string>('0');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !complaint) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const applyQuickResolution = (item: typeof QUICK_RESOLUTIONS[0]) => {
    setNewStatus('RESOLVED');
    setWorkNotes(item.notes);
    setRepairCost(item.cost);
    setImagePreview(item.img);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let evidenceUrl: string | undefined =
        imagePreview && imagePreview.startsWith('http') ? imagePreview : undefined;
      if (selectedFile) {
        const uploadRes = await api.uploadFile(selectedFile);
        evidenceUrl = uploadRes.url;
      }

      await api.updateComplaintStatus(complaint.id, {
        status: newStatus,
        workNotes: workNotes.trim() || undefined,
        repairCost: parseFloat(repairCost) || 0,
        evidenceImageUrl: evidenceUrl,
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update work status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-sky-500" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Update Work Status
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

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Resolution Presets */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
            <span className="text-[11px] font-bold text-sky-900 dark:text-sky-200 block mb-1.5">
              ⚡ 1-Click Common Repair Presets (Auto-fills notes &amp; parts cost):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {QUICK_RESOLUTIONS.map((qr) => (
                <button
                  key={qr.label}
                  type="button"
                  onClick={() => applyQuickResolution(qr)}
                  className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-[10px] font-semibold text-slate-800 dark:text-slate-200 transition hover:shadow-xs"
                >
                  <div className="font-bold truncate">{qr.label}</div>
                  <div className="text-sky-600 dark:text-sky-400 font-mono">Parts: ₹{qr.cost}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select New Stage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ACCEPTED', 'IN_PROGRESS', 'RESOLVED'] as ComplaintStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setNewStatus(st)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                    newStatus === st
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Notes &amp; Actions Taken
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Tightened terminal screws, replaced burnt capacitor, re-tested current draw..."
              value={workNotes}
              onChange={(e) => setWorkNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Repair &amp; Material Cost (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attach Proof of Repair Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-center gap-2 cursor-pointer hover:border-sky-500 transition text-xs text-slate-600 dark:text-slate-400">
                <Camera className="w-4 h-4 text-slate-400" />
                <span>{selectedFile ? selectedFile.name : 'Upload completion evidence photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              <span>Save Status Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
