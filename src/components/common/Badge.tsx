import React from 'react';
import { ComplaintStatus, PriorityLevel, AssetCondition } from '../../types';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ComplaintStatus; className?: string }> = ({ status, className = '' }) => {
  const configs: Record<ComplaintStatus, { label: string; bg: string; text: string; dot: string }> = {
    REPORTED: {
      label: 'Reported',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    REVIEWED: {
      label: 'Reviewed',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-500',
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500 animate-pulse',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    VERIFIED: {
      label: 'Verified',
      bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
      text: 'text-teal-700 dark:text-teal-300',
      dot: 'bg-teal-500',
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const c = configs[status] || configs.REPORTED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; className?: string }> = ({ priority, className = '' }) => {
  const configs: Record<PriorityLevel, { label: string; bg: string; text: string; icon: any }> = {
    LOW: {
      label: 'Low',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      icon: Clock,
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Clock,
    },
    HIGH: {
      label: 'High',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: AlertTriangle,
    },
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300 animate-pulse',
      icon: ShieldAlert,
    },
  };

  const c = configs[priority] || configs.MEDIUM;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
};

export const SlaBadge: React.FC<{ deadline: string; isOverdue?: boolean; status: ComplaintStatus }> = ({
  deadline,
  isOverdue,
  status,
}) => {
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <CheckCircle2 className="w-3 h-3" />
        SLA Met
      </span>
    );
  }

  const now = Date.now();
  const target = new Date(deadline).getTime();
  const diffMs = target - now;
  const diffHours = Math.round(diffMs / 3600000);

  if (isOverdue || diffMs <= 0) {
    const overdueHrs = Math.abs(diffHours) || 1;
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
        <AlertTriangle className="w-3 h-3" />
        Overdue by {overdueHrs}h
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
      <Clock className="w-3 h-3 text-slate-400" />
      {diffHours}h left
    </span>
  );
};

export const ConditionBadge: React.FC<{ condition: AssetCondition }> = ({ condition }) => {
  const configs: Record<AssetCondition, { label: string; color: string }> = {
    EXCELLENT: { label: 'Excellent', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    GOOD: { label: 'Good', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    NEEDS_ATTENTION: {
      label: 'Needs Attention',
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    CRITICAL: { label: 'Critical', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  };

  const c = configs[condition] || configs.GOOD;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${c.color}`}>
      {c.label}
    </span>
  );
};
