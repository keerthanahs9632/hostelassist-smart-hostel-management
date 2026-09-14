import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ComplaintCategory, PriorityLevel, AiAnalysis } from '../../types';
import {
  X,
  Sparkles,
  UploadCloud,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Cpu,
  Image as ImageIcon,
} from 'lucide-react';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated: () => void;
}

interface QuickScenario {
  label: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  block: string;
  roomNumber: string;
  imageUrl: string;
}

const QUICK_PRESETS: QuickScenario[] = [
  {
    label: '⚡ Sparks & Smoke',
    badge: 'Critical Electrical',
    badgeColor: 'bg-rose-500 text-white',
    title: 'Switchboard sparking with burning smell near study desk',
    description: 'Visible blue sparks and burning smell coming from the wall socket when plugging in charger. Breaker did not trip immediately, urgent fire hazard.',
    block: 'Block A',
    roomNumber: 'A-203',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: '🚰 Geyser Boiling Leak',
    badge: 'High Plumbing',
    badgeColor: 'bg-amber-500 text-white',
    title: 'Geyser pressure valve hissing and leaking boiling water',
    description: 'The 25L water heater in 2nd floor common bathroom is hissing loudly with boiling scalding water leaking continuously from the pressure relief valve. Pool of hot water on bathroom floor.',
    block: 'Block B',
    roomNumber: 'B-204',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: '📶 Wi-Fi Router Dead',
    badge: 'High Internet',
    badgeColor: 'bg-sky-500 text-white',
    title: 'Ceiling Access Point blinking red, no network connectivity',
    description: 'Aruba AP on 3rd floor corridor ceiling is blinking solid red. Students in rooms C-301 to C-316 cannot connect to campus portal. Exam tomorrow morning.',
    block: 'Block C',
    roomNumber: 'C-308',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: '💧 RO Purifier Turbid',
    badge: 'Critical Water',
    badgeColor: 'bg-blue-600 text-white',
    title: 'Mess drinking water dispenser cloudy with chlorine odor',
    description: 'The commercial 50L drinking water cooler in the Mess Hall is dispensing brownish cloudy water with unpleasant taste. Students cannot drink.',
    block: 'Block B',
    roomNumber: 'Mess Hall',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
  },
];

const CATEGORIES: ComplaintCategory[] = [
  'Electrical',
  'Plumbing',
  'Furniture',
  'Water',
  'Internet',
  'Cleaning',
  'Bathroom',
  'Room',
  'Safety',
  'Other',
];

const PRIORITIES: PriorityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  onComplaintCreated,
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Electrical');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || 'B-204');
  const [block, setBlock] = useState(user?.block || 'Block B');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!title && !description) {
      setError('Please provide a title or description first to run AI triage.');
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeComplaint({
        title,
        description,
        roomNumber,
        block,
      });
      setAiAnalysis(res.analysis);
      // Auto-update suggestions
      setCategory(res.analysis.category);
      setPriority(res.analysis.suggestedPriority);
    } catch (err: any) {
      setError(err.message || 'AI analysis temporarily unavailable.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyPreset = async (preset: QuickScenario) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setBlock(preset.block);
    setRoomNumber(preset.roomNumber);
    setImagePreview(preset.imageUrl);
    setSelectedFile(null);
    setError(null);
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeComplaint({
        title: preset.title,
        description: preset.description,
        roomNumber: preset.roomNumber,
        block: preset.block,
      });
      setAiAnalysis(res.analysis);
      setCategory(res.analysis.category);
      setPriority(res.analysis.suggestedPriority);
    } catch {
      // rule-based fallback will have answered or handled
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      let uploadedUrl: string | undefined =
        imagePreview && imagePreview.startsWith('http') ? imagePreview : undefined;
      if (selectedFile) {
        const uploadRes = await api.uploadFile(selectedFile);
        uploadedUrl = uploadRes.url;
      }

      await api.createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        roomNumber: roomNumber.trim(),
        block: block.trim(),
        imageUrl: uploadedUrl,
      });

      onComplaintCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Report Infrastructure Problem</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                AI Assisted
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit an issue for maintenance technician dispatch and SLA tracking.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick 1-Click Real-World Scenarios */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Quick Test Scenarios (1-Click Fill &amp; AI Triage)</span>
              </span>
              <span className="text-[10px] text-slate-400">Select to test AI</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition hover:scale-[1.02] shadow-xs cursor-pointer group"
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {p.label}
                  </div>
                  <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {p.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hostel Block
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Block A">Block A (North Wing)</option>
                <option value="Block B">Block B (South Wing)</option>
                <option value="Block C">Block C (East Wing)</option>
                <option value="Block D">Block D (West Wing)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room Number / Spot
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. B-204"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Problem Title
              </label>
              <span className="text-[11px] text-slate-400">Brief summary</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Ceiling fan grinding noise and sparking from switchboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detailed Description
              </label>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing || (!title && !description)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Run Smart AI Triage</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Describe what happened, how long it has been occurring, and if there are safety risks (sparks, water leaking onto wires, etc.)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* AI Analysis Card if generated */}
          {aiAnalysis && (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/70 to-sky-50/70 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-200 dark:border-indigo-800/80 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    AI Diagnostic &amp; Classification
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                    {aiAnalysis.provider}
                  </span>
                </div>
                {aiAnalysis.safetyRiskDetected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Hazard Detected
                  </span>
                )}
              </div>

              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{aiAnalysis.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Suggested Priority</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{aiAnalysis.suggestedPriority}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SLA Target</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {aiAnalysis.suggestedPriority === 'CRITICAL'
                      ? '2 Hours'
                      : aiAnalysis.suggestedPriority === 'HIGH'
                      ? '6 Hours'
                      : '24 Hours'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Confidence</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {Math.round(aiAnalysis.confidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs">
                <div className="text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Probable Root Cause:</strong>{' '}
                  {aiAnalysis.possibleRootCause}
                </div>
                <div className="text-slate-600 dark:text-slate-400 mt-1">
                  <strong className="text-slate-800 dark:text-slate-200">Action:</strong>{' '}
                  {aiAnalysis.recommendedAction}
                </div>
              </div>
            </div>
          )}

          {/* Category & Priority selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} {p === 'CRITICAL' ? '(2h SLA)' : p === 'HIGH' ? '(6h SLA)' : '(24-72h SLA)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo attachment upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attach Issue Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition bg-slate-50/50 dark:bg-slate-800/30">
                <UploadCloud className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {selectedFile ? selectedFile.name : 'Click to select photo (JPG, PNG, max 5MB)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-0 right-0 p-0.5 bg-black/70 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
