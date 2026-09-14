import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint, ComplaintHistoryItem, Feedback, ComplaintStatus } from '../../types';
import { StatusBadge, PriorityBadge, SlaBadge } from '../common/Badge';
import {
  X,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  Calendar,
  DollarSign,
  Star,
  MessageSquare,
  Shield,
  Send,
  Loader2,
  HardHat,
  Cpu,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const LIFECYCLE_STEPS: { status: ComplaintStatus; label: string }[] = [
  { status: 'REPORTED', label: 'Reported' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
  { status: 'CLOSED', label: 'Verified & Closed' },
];

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistoryItem[]>([]);
  const [feedback, setFeedback] = useState<Feedback | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Student verification feedback state
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  const fetchDetails = async () => {
    if (!complaintId) return;
    setLoading(true);
    try {
      const res = await api.getComplaintById(complaintId);
      setComplaint(res.complaint);
      setHistory(res.history);
      setFeedback(res.feedback);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && complaintId) {
      fetchDetails();
    }
  }, [isOpen, complaintId]);

  if (!isOpen || !complaintId) return null;

  const handleVerifyAndSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(complaint.id, {
        rating,
        comment: feedbackComment,
      });
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
      await fetchDetails();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStepStatus = (stepStatus: ComplaintStatus) => {
    if (!complaint) return 'upcoming';
    const statusOrder: ComplaintStatus[] = [
      'REPORTED',
      'REVIEWED',
      'ASSIGNED',
      'ACCEPTED',
      'IN_PROGRESS',
      'RESOLVED',
      'VERIFIED',
      'CLOSED',
    ];
    const currentIndex = statusOrder.indexOf(complaint.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepStatus === complaint.status) return 'current';
    if (stepIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {complaint?.ticketNumber || 'TICKET'}
                </span>
                {complaint && <StatusBadge status={complaint.status} />}
                {complaint && <PriorityBadge priority={complaint.priority} />}
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {complaint?.title || 'Loading Ticket Details...'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs">Fetching audit trail from database...</span>
          </div>
        ) : complaint ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* SLA countdown & lifecycle bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  SLA Timeline &amp; Progress
                </span>
                <SlaBadge
                  deadline={complaint.slaDeadline}
                  isOverdue={complaint.isOverdue}
                  status={complaint.status}
                />
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const state = getStepStatus(step.status);
                  return (
                    <div key={step.status} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          state === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : state === 'current'
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {state === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Problem Description
                  </h3>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </div>
                </div>

                {/* AI Analysis Box */}
                {complaint.aiAnalysis && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                      <Cpu className="w-3.5 h-3.5" />
                      AI Root Cause Intelligence
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      <strong>Probable Root Cause:</strong> {complaint.aiAnalysis.possibleRootCause}
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                      <strong>Recommended Fix:</strong> {complaint.aiAnalysis.recommendedAction}
                    </div>
                  </div>
                )}

                {/* Images Before / After */}
                <div className="grid grid-cols-2 gap-3">
                  {complaint.imageUrl && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Reported Photo
                      </span>
                      <img
                        src={complaint.imageUrl}
                        alt="Reported Issue"
                        className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  )}
                  {complaint.repairEvidenceUrl && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                        Technician Repair Evidence
                      </span>
                      <img
                        src={complaint.repairEvidenceUrl}
                        alt="Repair Evidence"
                        className="w-full h-32 object-cover rounded-xl border border-emerald-300 dark:border-emerald-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Card */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {complaint.block} · Room {complaint.roomNumber}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {complaint.category}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Engineer</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <HardHat className="w-3.5 h-3.5 text-sky-500" />
                      {complaint.assignedTechnicianName || 'Pending Dispatch'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported At</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(complaint.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {complaint.totalRepairCost && complaint.totalRepairCost > 0 ? (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Repair Cost</span>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₹{complaint.totalRepairCost.toFixed(2)}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Student Verification & Feedback Box (If RESOLVED and user is Student or Admin) */}
            {complaint.status === 'RESOLVED' && !feedback && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Student Verification Required
                  </h4>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
                  The technician has reported this issue as resolved. Please inspect the work and provide your 1-5 star verification rating to formally close the ticket.
                </p>

                <form onSubmit={handleVerifyAndSubmitFeedback} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Work Quality Rating:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Feedback notes (e.g. Fixed cleanly, on time, very courteous)..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition flex items-center gap-1.5"
                  >
                    {submittingFeedback ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Confirm Verification &amp; Close Ticket</span>
                  </button>
                </form>
              </div>
            )}

            {/* Completed Feedback Display */}
            {feedback && (
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Student Verified Feedback
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= feedback.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{feedback.comment || 'Verified and confirmed fixed by student.'}"
                </p>
              </div>
            )}

            {/* Audit History Timeline */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Lifecycle Audit Trail ({history.length} events)
              </h3>
              <div className="space-y-2.5 border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2">
                {history.map((item) => (
                  <div key={item.id} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      by {item.actorName} ({item.actorRole})
                    </div>
                    {item.notes && (
                      <div className="mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                        {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
