import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Complaint,
  ComplaintHistoryItem,
  Asset,
  Notification,
  Feedback,
  AuditLog,
  PreventiveMaintenanceSchedule,
  RecurringIssueAlert,
  ComplaintCategory,
  PriorityLevel,
  ComplaintStatus,
} from './types.js';

interface DatabaseSchema {
  users: User[];
  complaints: Complaint[];
  complaintHistory: ComplaintHistoryItem[];
  assets: Asset[];
  notifications: Notification[];
  feedbacks: Feedback[];
  auditLogs: AuditLog[];
  preventiveSchedules: PreventiveMaintenanceSchedule[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'hostelassist-db.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// In-memory cache synced to disk
let dbData: DatabaseSchema | null = null;

function calculateSlaDeadline(createdAt: string, priority: PriorityLevel): string {
  const created = new Date(createdAt).getTime();
  let hours = 24;
  if (priority === 'CRITICAL') hours = 2;
  else if (priority === 'HIGH') hours = 6;
  else if (priority === 'MEDIUM') hours = 24;
  else if (priority === 'LOW') hours = 72;

  return new Date(created + hours * 60 * 60 * 1000).toISOString();
}

function seedDatabase(): DatabaseSchema {
  const now = new Date();
  const pastHours = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const pastDays = (d: number) => new Date(now.getTime() - d * 86400 * 1000).toISOString();
  const futureDays = (d: number) => new Date(now.getTime() + d * 86400 * 1000).toISOString();

  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@123', salt);
  const techHash = bcrypt.hashSync('Tech@123', salt);
  const studentHash = bcrypt.hashSync('Student@123', salt);

  const users: User[] = [
    {
      id: 'usr-admin-1',
      name: 'Dr. Ramesh Sharma',
      email: 'admin@hostelassist.edu',
      username: 'admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      createdAt: pastDays(90),
      updatedAt: pastDays(90),
    },
    {
      id: 'usr-tech-1',
      name: 'Rahul Verma',
      email: 'rahul.tech@hostelassist.edu',
      username: 'rahul_tech',
      passwordHash: techHash,
      role: 'TECHNICIAN',
      specialty: 'Electrical',
      phone: '+91 98765 11223',
      createdAt: pastDays(60),
      updatedAt: pastDays(60),
    },
    {
      id: 'usr-tech-2',
      name: 'Suresh Patil',
      email: 'suresh.tech@hostelassist.edu',
      username: 'suresh_tech',
      passwordHash: techHash,
      role: 'TECHNICIAN',
      specialty: 'Plumbing',
      phone: '+91 98765 33445',
      createdAt: pastDays(60),
      updatedAt: pastDays(60),
    },
    {
      id: 'usr-student-1',
      name: 'Ananya Iyer',
      email: 'ananya.student@hostelassist.edu',
      username: 'ananya',
      passwordHash: studentHash,
      role: 'STUDENT',
      roomNumber: 'B-204',
      block: 'Block B',
      phone: '+91 98765 99887',
      createdAt: pastDays(45),
      updatedAt: pastDays(45),
    },
    {
      id: 'usr-student-2',
      name: 'Rohit Deshmukh',
      email: 'rohit.student@hostelassist.edu',
      username: 'rohit',
      passwordHash: studentHash,
      role: 'STUDENT',
      roomNumber: 'A-102',
      block: 'Block A',
      phone: '+91 98765 77665',
      createdAt: pastDays(30),
      updatedAt: pastDays(30),
    },
  ];

  const assets: Asset[] = [
    {
      id: 'ast-1',
      name: 'Crompton High-Speed Ceiling Fan',
      assetCode: 'FAN-B204-01',
      category: 'Electrical',
      block: 'Block B',
      floor: 2,
      roomNumber: 'B-204',
      condition: 'NEEDS_ATTENTION',
      purchaseDate: pastDays(400),
      purchaseCost: 2400,
      totalRepairCost: 650,
      lastMaintenanceDate: pastDays(25),
      nextMaintenanceDate: futureDays(15),
      warrantyExpiryDate: pastDays(35),
      maintenanceHistoryCount: 3,
      status: 'ACTIVE',
      createdAt: pastDays(400),
      updatedAt: pastDays(2),
    },
    {
      id: 'ast-2',
      name: 'Havells 25L Instant Geyser',
      assetCode: 'GEYSER-A102-01',
      category: 'Plumbing',
      block: 'Block A',
      floor: 1,
      roomNumber: 'A-102',
      condition: 'GOOD',
      purchaseDate: pastDays(300),
      purchaseCost: 8500,
      totalRepairCost: 400,
      lastMaintenanceDate: pastDays(40),
      nextMaintenanceDate: futureDays(50),
      warrantyExpiryDate: futureDays(65),
      maintenanceHistoryCount: 1,
      status: 'ACTIVE',
      createdAt: pastDays(300),
      updatedAt: pastDays(10),
    },
    {
      id: 'ast-3',
      name: 'Cisco Enterprise Wi-Fi 6 AP',
      assetCode: 'WIFI-C302-01',
      category: 'Internet',
      block: 'Block C',
      floor: 3,
      roomNumber: 'C-Corridor-3',
      condition: 'EXCELLENT',
      purchaseDate: pastDays(180),
      purchaseCost: 14000,
      totalRepairCost: 0,
      lastMaintenanceDate: pastDays(10),
      nextMaintenanceDate: futureDays(80),
      warrantyExpiryDate: futureDays(540),
      maintenanceHistoryCount: 0,
      status: 'ACTIVE',
      createdAt: pastDays(180),
      updatedAt: pastDays(10),
    },
    {
      id: 'ast-4',
      name: 'Commercial Water Cooler & RO Purifier',
      assetCode: 'RO-B-G01',
      category: 'Water',
      block: 'Block B',
      floor: 0,
      roomNumber: 'Ground Lobby',
      condition: 'GOOD',
      purchaseDate: pastDays(500),
      purchaseCost: 42000,
      totalRepairCost: 1800,
      lastMaintenanceDate: pastDays(18),
      nextMaintenanceDate: futureDays(12),
      warrantyExpiryDate: pastDays(135),
      maintenanceHistoryCount: 4,
      status: 'ACTIVE',
      createdAt: pastDays(500),
      updatedAt: pastDays(18),
    },
  ];

  const complaints: Complaint[] = [
    {
      id: 'cmp-1021',
      ticketNumber: 'CMP-2026-1021',
      studentId: 'usr-student-1',
      studentName: 'Ananya Iyer',
      studentEmail: 'ananya.student@hostelassist.edu',
      roomNumber: 'B-204',
      block: 'Block B',
      title: 'Ceiling fan making loud grinding noise and wobbling violently',
      description: 'The fan in room B-204 makes an unbearable metallic grinding sound and vibrates at speeds 3 and above. It stopped working twice yesterday.',
      category: 'Electrical',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assetId: 'ast-1',
      assetName: 'Crompton High-Speed Ceiling Fan (FAN-B204-01)',
      assignedTechnicianId: 'usr-tech-1',
      assignedTechnicianName: 'Rahul Verma',
      slaDeadline: calculateSlaDeadline(pastHours(4), 'HIGH'),
      isOverdue: false,
      aiAnalysis: {
        category: 'Electrical',
        suggestedPriority: 'HIGH',
        confidence: 0.94,
        detectedKeywords: ['grinding noise', 'wobbling violently', 'stopped working', 'vibrates'],
        safetyRiskDetected: true,
        possibleRootCause: 'Worn-out ball bearing assembly or loose mounting down-rod clamp',
        recommendedAction: 'Isolate power, inspect ceiling down-rod fastener, replace bearing cartridge or full fan head',
        estimatedResolutionHours: 4,
        provider: 'gemini',
      },
      createdAt: pastHours(4),
      updatedAt: pastHours(1),
    },
    {
      id: 'cmp-1018',
      ticketNumber: 'CMP-2026-1018',
      studentId: 'usr-student-2',
      studentName: 'Rohit Deshmukh',
      studentEmail: 'rohit.student@hostelassist.edu',
      roomNumber: 'A-102',
      block: 'Block A',
      title: 'Bathroom tap leaking continuously onto the floor',
      description: 'The cold water valve beneath the sink cannot be closed completely. Water is trickling continuously and seeping towards the doorway.',
      category: 'Plumbing',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assetId: 'ast-2',
      assetName: 'Havells 25L Instant Geyser',
      assignedTechnicianId: 'usr-tech-2',
      assignedTechnicianName: 'Suresh Patil',
      slaDeadline: calculateSlaDeadline(pastHours(30), 'MEDIUM'),
      isOverdue: false,
      totalRepairCost: 280,
      workNotes: 'Replaced damaged brass spindle washer and tightened PTFE thread seal.',
      resolvedAt: pastHours(2),
      aiAnalysis: {
        category: 'Plumbing',
        suggestedPriority: 'MEDIUM',
        confidence: 0.91,
        detectedKeywords: ['leaking continuously', 'cannot be closed', 'seeping towards doorway'],
        safetyRiskDetected: false,
        possibleRootCause: 'Perished rubber washer or degraded valve seat inside bibcock',
        recommendedAction: 'Shut off angle valve, disassemble tap head, replace ceramic disc/washer',
        estimatedResolutionHours: 2,
        provider: 'gemini',
      },
      createdAt: pastHours(28),
      updatedAt: pastHours(2),
    },
    {
      id: 'cmp-1015',
      ticketNumber: 'CMP-2026-1015',
      studentId: 'usr-student-1',
      studentName: 'Ananya Iyer',
      studentEmail: 'ananya.student@hostelassist.edu',
      roomNumber: 'B-204',
      block: 'Block B',
      title: 'Ceiling fan capacitor failure - running very slow',
      description: 'Ceiling fan is running at very low speed even when regulator is set to maximum speed 5.',
      category: 'Electrical',
      priority: 'MEDIUM',
      status: 'CLOSED',
      assetId: 'ast-1',
      assetName: 'Crompton High-Speed Ceiling Fan (FAN-B204-01)',
      assignedTechnicianId: 'usr-tech-1',
      assignedTechnicianName: 'Rahul Verma',
      slaDeadline: calculateSlaDeadline(pastDays(28), 'MEDIUM'),
      isOverdue: false,
      totalRepairCost: 150,
      workNotes: 'Replaced 2.5 MFD capacitor. Speed restored.',
      resolvedAt: pastDays(27),
      closedAt: pastDays(26),
      aiAnalysis: {
        category: 'Electrical',
        suggestedPriority: 'MEDIUM',
        confidence: 0.92,
        detectedKeywords: ['running very slow', 'maximum speed 5'],
        safetyRiskDetected: false,
        possibleRootCause: 'Degraded starter capacitor',
        recommendedAction: 'Test microfarad rating with multimeter and replace capacitor',
        estimatedResolutionHours: 3,
        provider: 'rule-based-fallback',
      },
      createdAt: pastDays(28),
      updatedAt: pastDays(26),
    },
    {
      id: 'cmp-1009',
      ticketNumber: 'CMP-2026-1009',
      studentId: 'usr-student-1',
      studentName: 'Ananya Iyer',
      studentEmail: 'ananya.student@hostelassist.edu',
      roomNumber: 'B-204',
      block: 'Block B',
      title: 'Ceiling fan burning smell and sparks from regulator',
      description: 'Fan speed regulator was warm to touch and emitted light smoke when turned on.',
      category: 'Electrical',
      priority: 'CRITICAL',
      status: 'CLOSED',
      assetId: 'ast-1',
      assetName: 'Crompton High-Speed Ceiling Fan (FAN-B204-01)',
      assignedTechnicianId: 'usr-tech-1',
      assignedTechnicianName: 'Rahul Verma',
      slaDeadline: calculateSlaDeadline(pastDays(65), 'CRITICAL'),
      isOverdue: false,
      totalRepairCost: 320,
      workNotes: 'Replaced step regulator and insulated charred wire ends with heat-shrink tubing.',
      resolvedAt: pastDays(64),
      closedAt: pastDays(63),
      aiAnalysis: {
        category: 'Electrical',
        suggestedPriority: 'CRITICAL',
        confidence: 0.98,
        detectedKeywords: ['burning smell', 'sparks', 'light smoke', 'warm to touch'],
        safetyRiskDetected: true,
        possibleRootCause: 'Thermal overload in rotary resistive regulator or shorted conductor',
        recommendedAction: 'Immediate breaker trip, isolate switchplate, replace electronic regulator module',
        estimatedResolutionHours: 1,
        provider: 'gemini',
      },
      createdAt: pastDays(65),
      updatedAt: pastDays(63),
    },
  ];

  const complaintHistory: ComplaintHistoryItem[] = [
    {
      id: 'h-1',
      complaintId: 'cmp-1021',
      action: 'COMPLAINT_REPORTED',
      toStatus: 'REPORTED',
      actorId: 'usr-student-1',
      actorName: 'Ananya Iyer',
      actorRole: 'STUDENT',
      notes: 'Initial issue reported through mobile student portal.',
      timestamp: pastHours(4),
    },
    {
      id: 'h-2',
      complaintId: 'cmp-1021',
      action: 'AI_ANALYSIS_COMPLETED',
      toStatus: 'REVIEWED',
      actorId: 'system',
      actorName: 'HostelAssist AI Engine',
      actorRole: 'ADMIN',
      notes: 'Categorized as Electrical. Identified High Priority due to mechanical instability risk.',
      timestamp: pastHours(3.8),
    },
    {
      id: 'h-3',
      complaintId: 'cmp-1021',
      action: 'TECHNICIAN_ASSIGNED',
      fromStatus: 'REVIEWED',
      toStatus: 'ASSIGNED',
      actorId: 'usr-admin-1',
      actorName: 'Dr. Ramesh Sharma',
      actorRole: 'ADMIN',
      notes: 'Assigned to Rahul Verma (Senior Electrical Technician).',
      timestamp: pastHours(3.2),
    },
    {
      id: 'h-4',
      complaintId: 'cmp-1021',
      action: 'ASSIGNMENT_ACCEPTED',
      fromStatus: 'ASSIGNED',
      toStatus: 'ACCEPTED',
      actorId: 'usr-tech-1',
      actorName: 'Rahul Verma',
      actorRole: 'TECHNICIAN',
      notes: 'Ticket acknowledged. Tools and spare parts prepared.',
      timestamp: pastHours(2.5),
    },
    {
      id: 'h-5',
      complaintId: 'cmp-1021',
      action: 'REPAIR_STARTED',
      fromStatus: 'ACCEPTED',
      toStatus: 'IN_PROGRESS',
      actorId: 'usr-tech-1',
      actorName: 'Rahul Verma',
      actorRole: 'TECHNICIAN',
      notes: 'On site in Room B-204. Power disconnected. Disassembling housing.',
      timestamp: pastHours(1),
    },
  ];

  const feedbacks: Feedback[] = [
    {
      id: 'fb-1',
      complaintId: 'cmp-1018',
      studentId: 'usr-student-2',
      studentName: 'Rohit Deshmukh',
      technicianId: 'usr-tech-2',
      rating: 5,
      comment: 'Suresh arrived quickly and fixed the tap cleanly within 20 minutes. Very polite!',
      timelinessScore: 5,
      createdAt: pastHours(1.5),
    },
    {
      id: 'fb-2',
      complaintId: 'cmp-1015',
      studentId: 'usr-student-1',
      studentName: 'Ananya Iyer',
      technicianId: 'usr-tech-1',
      rating: 4,
      comment: 'Fan works again at full speed. However, this is the second time this fan has had issues.',
      timelinessScore: 4,
      createdAt: pastDays(26),
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'usr-student-1',
      title: 'Technician on Site',
      message: 'Technician Rahul Verma has started working on complaint CMP-2026-1021.',
      type: 'STATUS_CHANGE',
      complaintId: 'cmp-1021',
      isRead: false,
      createdAt: pastHours(1),
    },
    {
      id: 'notif-2',
      userId: 'usr-admin-1',
      title: 'Recurring Issue Detected',
      message: 'Room B-204 has logged 3 Electrical complaints for Ceiling Fan (FAN-B204-01) within 90 days. Recommend asset replacement.',
      type: 'RECURRING_ALERT',
      complaintId: 'cmp-1021',
      isRead: false,
      createdAt: pastHours(3.5),
    },
    {
      id: 'notif-3',
      userId: 'usr-student-2',
      title: 'Complaint Resolved',
      message: 'Bathroom tap leak (CMP-2026-1018) was marked resolved. Please verify and submit feedback.',
      type: 'FEEDBACK_REQUEST',
      complaintId: 'cmp-1018',
      isRead: false,
      createdAt: pastHours(2),
    },
    {
      id: 'notif-4',
      userId: 'usr-tech-1',
      title: 'New High-Priority Assignment',
      message: 'You have been assigned to High-Priority complaint CMP-2026-1021 in Room B-204.',
      type: 'ASSIGNMENT',
      complaintId: 'cmp-1021',
      isRead: true,
      createdAt: pastHours(3.2),
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      action: 'SYSTEM_BOOT',
      performedBy: 'System Core',
      userRole: 'ADMIN',
      entityType: 'SYSTEM',
      entityId: 'SYS-INIT',
      details: 'HostelAssist initialized with production schemas and database consistency checks.',
      timestamp: pastDays(90),
    },
    {
      id: 'aud-2',
      action: 'USER_REGISTERED',
      performedBy: 'Ananya Iyer',
      userRole: 'STUDENT',
      entityType: 'USER',
      entityId: 'usr-student-1',
      details: 'Student registration completed for Room B-204.',
      timestamp: pastDays(45),
    },
    {
      id: 'aud-3',
      action: 'COMPLAINT_CREATED',
      performedBy: 'Ananya Iyer',
      userRole: 'STUDENT',
      entityType: 'COMPLAINT',
      entityId: 'cmp-1021',
      details: 'Reported High-Priority Electrical complaint for Room B-204 fan.',
      timestamp: pastHours(4),
    },
    {
      id: 'aud-4',
      action: 'TECHNICIAN_ASSIGNED',
      performedBy: 'Dr. Ramesh Sharma',
      userRole: 'ADMIN',
      entityType: 'COMPLAINT',
      entityId: 'cmp-1021',
      details: 'Assigned ticket CMP-2026-1021 to Rahul Verma.',
      timestamp: pastHours(3.2),
    },
  ];

  const preventiveSchedules: PreventiveMaintenanceSchedule[] = [
    {
      id: 'pm-1',
      title: 'Block B Electrical Overhead Inspection',
      description: 'Comprehensive inspection of ceiling fans, switchgear, and neutral connections in Block B following recurring motor faults.',
      targetCategory: 'Electrical',
      targetBlock: 'Block B',
      suggestedAction: 'Inspect all ceiling fan down-rod safety pins, check capacitor ratings, and balance motor windings.',
      frequencyDays: 60,
      nextScheduledDate: futureDays(5),
      status: 'SCHEDULED',
      createdReason: 'AI_FAILURE_PATTERN_ALERT',
      createdAt: pastDays(2),
    },
    {
      id: 'pm-2',
      title: 'Hostel RO Filtration Membrane Flush',
      description: 'Quarterly chemical sanitization and sediment cartridge replacement for all drinking water coolers.',
      targetCategory: 'Water',
      targetBlock: 'Block B',
      suggestedAction: 'Replace 5-micron pre-filters and conduct TDS / chlorine residual water testing.',
      frequencyDays: 90,
      lastRunDate: pastDays(75),
      nextScheduledDate: futureDays(15),
      status: 'SCHEDULED',
      createdReason: 'MANUAL',
      createdAt: pastDays(75),
    },
  ];

  return {
    users,
    complaints,
    complaintHistory,
    assets,
    notifications,
    feedbacks,
    auditLogs,
    preventiveSchedules,
  };
}

export function getDb(): DatabaseSchema {
  if (dbData) {
    return dbData;
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(raw);
      return dbData!;
    } catch (err) {
      console.error('Failed reading existing db file, regenerating defaults:', err);
    }
  }

  dbData = seedDatabase();
  saveDb();
  return dbData;
}

export function saveDb(): void {
  if (!dbData) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing to database file:', err);
  }
}

// Helper query utilities
export function findUserByEmailOrUsername(identifier: string): User | undefined {
  const db = getDb();
  const clean = identifier.trim().toLowerCase();
  return db.users.find(
    (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
  );
}

export function findUserById(id: string): User | undefined {
  return getDb().users.find((u) => u.id === id);
}

export function getAllUsers(): User[] {
  return getDb().users;
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const db = getDb();
  const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const newUser: User = {
    id,
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
  db.users.push(newUser);
  saveDb();

  createAuditLog({
    action: 'USER_REGISTERED',
    performedBy: newUser.name,
    userRole: newUser.role,
    entityType: 'USER',
    entityId: newUser.id,
    details: `User registered with role ${newUser.role} (${newUser.email}).`,
  });

  return newUser;
}

export function createAuditLog(item: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const db = getDb();
  const audit: AuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...item,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDb();
  return audit;
}

export const addAuditLog = createAuditLog;

export function createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
  const db = getDb();
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...notif,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(newNotif);
  saveDb();
  return newNotif;
}

export function detectRecurringIssues(): RecurringIssueAlert[] {
  const db = getDb();
  const ninetyDaysAgo = Date.now() - 90 * 86400 * 1000;

  // Group complaints by room + category
  const roomCategoryMap = new Map<string, Complaint[]>();

  for (const c of db.complaints) {
    const cTime = new Date(c.createdAt).getTime();
    if (cTime >= ninetyDaysAgo) {
      const key = `${c.block}|${c.roomNumber}|${c.category}`;
      const list = roomCategoryMap.get(key) || [];
      list.push(c);
      roomCategoryMap.set(key, list);
    }
  }

  const alerts: RecurringIssueAlert[] = [];

  for (const [key, list] of roomCategoryMap.entries()) {
    if (list.length >= 2) {
      const [block, roomNumber, category] = key.split('|');
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const first = list[0];
      const last = list[list.length - 1];

      const isCritical = list.length >= 3;
      let recommendation = `Multiple ${category} faults logged in Room ${roomNumber}. Perform comprehensive root-cause diagnostic on wiring and connected appliances.`;

      if (category === 'Electrical' && list.length >= 3) {
        recommendation = `High recurrence: Room ${roomNumber} has suffered 3+ electrical faults in 90 days. Replace full fixture/appliance instead of repeating component-level patches.`;
      } else if (category === 'Plumbing' && list.length >= 2) {
        recommendation = `Recurring water/plumbing leaks in Room ${roomNumber}. Inspect pipe junctions behind wall tiles and replace degraded main valve assembly.`;
      }

      alerts.push({
        id: `rec-${block}-${roomNumber}-${category}`,
        block,
        roomNumber,
        category: category as ComplaintCategory,
        count: list.length,
        descriptionSnippet: last.title,
        firstReportedAt: first.createdAt,
        lastReportedAt: last.createdAt,
        severity: isCritical ? 'CRITICAL' : 'WARNING',
        recommendation,
      });
    }
  }

  return alerts;
}

export function calculateHostelHealthScore(): {
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
} {
  const db = getDb();
  const now = Date.now();

  let baseScore = 100;
  let openCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let closedCount = 0;
  let overdueCount = 0;
  let criticalCount = 0;
  let totalResolutionTimeHours = 0;
  let resolvedWithTimeCount = 0;
  let totalRepairCost = 0;

  for (const c of db.complaints) {
    const isClosedOrResolved = c.status === 'RESOLVED' || c.status === 'CLOSED';
    if (!isClosedOrResolved) {
      if (c.status === 'REPORTED' || c.status === 'REVIEWED' || c.status === 'ASSIGNED') {
        openCount++;
      } else if (c.status === 'ACCEPTED' || c.status === 'IN_PROGRESS') {
        inProgressCount++;
      }

      if (c.priority === 'CRITICAL') {
        criticalCount++;
      }

      const deadline = new Date(c.slaDeadline).getTime();
      if (now > deadline) {
        overdueCount++;
        c.isOverdue = true;
      }
    } else {
      if (c.status === 'RESOLVED') resolvedCount++;
      if (c.status === 'CLOSED') closedCount++;

      if (c.resolvedAt) {
        const diffHours = (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / 3600000;
        if (diffHours > 0) {
          totalResolutionTimeHours += diffHours;
          resolvedWithTimeCount++;
        }
      }
    }

    if (c.totalRepairCost) {
      totalRepairCost += c.totalRepairCost;
    }
  }

  const recurringAlerts = detectRecurringIssues();

  // Penalties
  const unresolvedPenalty = Math.min(25, (openCount + inProgressCount) * 3);
  const criticalPenalty = Math.min(30, criticalCount * 12);
  const slaPenalty = Math.min(20, overdueCount * 7);
  const recurringPenalty = Math.min(25, recurringAlerts.length * 6);

  // Asset condition factor
  let assetScoreSum = 0;
  for (const a of db.assets) {
    if (a.condition === 'EXCELLENT') assetScoreSum += 100;
    else if (a.condition === 'GOOD') assetScoreSum += 80;
    else if (a.condition === 'NEEDS_ATTENTION') assetScoreSum += 50;
    else if (a.condition === 'CRITICAL') assetScoreSum += 20;
  }
  const assetConditionScore = db.assets.length > 0 ? Math.round(assetScoreSum / db.assets.length) : 85;

  // Feedback bonus / penalty
  let ratingSum = 0;
  for (const f of db.feedbacks) {
    ratingSum += f.rating;
  }
  const avgRating = db.feedbacks.length > 0 ? Number((ratingSum / db.feedbacks.length).toFixed(1)) : 4.5;
  const feedbackBonus = Math.round((avgRating - 3) * 5); // can be positive or negative

  let score = baseScore - unresolvedPenalty - criticalPenalty - slaPenalty - recurringPenalty + feedbackBonus;
  // Blend with asset score
  score = Math.round(score * 0.7 + assetConditionScore * 0.3);
  score = Math.max(10, Math.min(100, score));

  let grade: 'Excellent' | 'Good' | 'Needs Attention' | 'Poor' = 'Poor';
  if (score >= 88) grade = 'Excellent';
  else if (score >= 70) grade = 'Good';
  else if (score >= 50) grade = 'Needs Attention';

  const avgResolutionHours = resolvedWithTimeCount > 0 ? Number((totalResolutionTimeHours / resolvedWithTimeCount).toFixed(1)) : 3.5;

  return {
    score,
    grade,
    breakdown: {
      unresolvedPenalty,
      criticalPenalty,
      slaPenalty,
      recurringPenalty,
      feedbackBonus,
      assetConditionScore,
    },
    metrics: {
      totalComplaints: db.complaints.length,
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      overdueCount,
      avgResolutionHours,
      avgRating,
      totalMaintenanceCost: totalRepairCost,
    },
  };
}
