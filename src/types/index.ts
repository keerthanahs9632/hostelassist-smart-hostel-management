export type UserRole = 'STUDENT' | 'TECHNICIAN' | 'ADMIN';

export type ComplaintCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Furniture'
  | 'Water'
  | 'Internet'
  | 'Cleaning'
  | 'Bathroom'
  | 'Room'
  | 'Safety'
  | 'Other';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'REPORTED'
  | 'REVIEWED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED';

export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  roomNumber?: string;
  block?: string;
  phone?: string;
  specialty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiAnalysis {
  category: ComplaintCategory;
  suggestedPriority: PriorityLevel;
  confidence: number;
  detectedKeywords: string[];
  safetyRiskDetected: boolean;
  possibleRootCause: string;
  recommendedAction: string;
  estimatedResolutionHours: number;
  provider: 'gemini' | 'rule-based-fallback';
}

export interface ComplaintHistoryItem {
  id: string;
  complaintId: string;
  action: string;
  fromStatus?: ComplaintStatus;
  toStatus?: ComplaintStatus;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  notes?: string;
  repairCost?: number;
  evidenceImageUrl?: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomNumber: string;
  block: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: PriorityLevel;
  status: ComplaintStatus;
  imageUrl?: string;
  repairEvidenceUrl?: string;
  assetId?: string;
  assetName?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  aiAnalysis?: AiAnalysis;
  slaDeadline: string;
  isOverdue: boolean;
  overdueHours?: number;
  totalRepairCost?: number;
  workNotes?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  assetCode: string;
  category: ComplaintCategory;
  block: string;
  floor: number;
  roomNumber: string;
  condition: AssetCondition;
  purchaseDate: string;
  purchaseCost: number;
  totalRepairCost: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate: string;
  warrantyExpiryDate: string;
  maintenanceHistoryCount: number;
  status: 'ACTIVE' | 'UNDER_REPAIR' | 'REPLACED' | 'DECOMMISSIONED';
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ASSIGNMENT' | 'STATUS_CHANGE' | 'SLA_BREACH' | 'RECURRING_ALERT' | 'FEEDBACK_REQUEST';
  complaintId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  complaintId: string;
  studentId: string;
  studentName: string;
  technicianId?: string;
  rating: number;
  comment: string;
  timelinessScore?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  userRole: UserRole;
  entityType: 'USER' | 'COMPLAINT' | 'ASSET' | 'MAINTENANCE' | 'SYSTEM';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface PreventiveMaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  targetCategory: ComplaintCategory;
  targetBlock: string;
  suggestedAction: string;
  frequencyDays: number;
  lastRunDate?: string;
  nextScheduledDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdReason: 'MANUAL' | 'AI_FAILURE_PATTERN_ALERT';
  createdAt: string;
}

export interface RecurringIssueAlert {
  id: string;
  block: string;
  roomNumber: string;
  category: ComplaintCategory;
  count: number;
  descriptionSnippet: string;
  firstReportedAt: string;
  lastReportedAt: string;
  severity: 'WARNING' | 'CRITICAL';
  recommendation: string;
}

export interface HealthScoreData {
  score: number;
  grade: 'Excellent' | 'Good' | 'Needs Attention' | 'Poor';
  breakdown: {
    unresolvedPenalty: number;
    criticalPenalty: number;
    slaPenalty: number;
    recurringPenalty: number;
    feedbackBonus: number;
    assetConditionScore: number;
  };
  metrics: {
    totalComplaints: number;
    openCount: number;
    inProgressCount: number;
    resolvedCount: number;
    closedCount: number;
    overdueCount: number;
    avgResolutionHours: number;
    avgRating: number;
    totalMaintenanceCost: number;
  };
}

export interface TechnicianMetric {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  totalAssigned: number;
  totalResolved: number;
  openWorkload: number;
  avgResolutionHours: number;
  avgRating: number;
  slaComplianceRate: number;
}
