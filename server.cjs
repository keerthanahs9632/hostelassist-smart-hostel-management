var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express9 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_url = require("url");
var import_multer = __toESM(require("multer"), 1);
var import_vite = require("vite");

// server/routes/authRoutes.ts
var import_express = require("express");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var DB_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DB_DIR, "hostelassist-db.json");
if (!import_fs.default.existsSync(DB_DIR)) {
  import_fs.default.mkdirSync(DB_DIR, { recursive: true });
}
var dbData = null;
function calculateSlaDeadline(createdAt, priority) {
  const created = new Date(createdAt).getTime();
  let hours = 24;
  if (priority === "CRITICAL") hours = 2;
  else if (priority === "HIGH") hours = 6;
  else if (priority === "MEDIUM") hours = 24;
  else if (priority === "LOW") hours = 72;
  return new Date(created + hours * 60 * 60 * 1e3).toISOString();
}
function seedDatabase() {
  const now = /* @__PURE__ */ new Date();
  const pastHours = (h) => new Date(now.getTime() - h * 3600 * 1e3).toISOString();
  const pastDays = (d) => new Date(now.getTime() - d * 86400 * 1e3).toISOString();
  const futureDays = (d) => new Date(now.getTime() + d * 86400 * 1e3).toISOString();
  const salt = import_bcryptjs.default.genSaltSync(10);
  const adminHash = import_bcryptjs.default.hashSync("Admin@123", salt);
  const techHash = import_bcryptjs.default.hashSync("Tech@123", salt);
  const studentHash = import_bcryptjs.default.hashSync("Student@123", salt);
  const users = [
    {
      id: "usr-admin-1",
      name: "Dr. Ramesh Sharma",
      email: "admin@hostelassist.edu",
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "+91 98765 43210",
      createdAt: pastDays(90),
      updatedAt: pastDays(90)
    },
    {
      id: "usr-tech-1",
      name: "Rahul Verma",
      email: "rahul.tech@hostelassist.edu",
      username: "rahul_tech",
      passwordHash: techHash,
      role: "TECHNICIAN",
      specialty: "Electrical",
      phone: "+91 98765 11223",
      createdAt: pastDays(60),
      updatedAt: pastDays(60)
    },
    {
      id: "usr-tech-2",
      name: "Suresh Patil",
      email: "suresh.tech@hostelassist.edu",
      username: "suresh_tech",
      passwordHash: techHash,
      role: "TECHNICIAN",
      specialty: "Plumbing",
      phone: "+91 98765 33445",
      createdAt: pastDays(60),
      updatedAt: pastDays(60)
    },
    {
      id: "usr-student-1",
      name: "Ananya Iyer",
      email: "ananya.student@hostelassist.edu",
      username: "ananya",
      passwordHash: studentHash,
      role: "STUDENT",
      roomNumber: "B-204",
      block: "Block B",
      phone: "+91 98765 99887",
      createdAt: pastDays(45),
      updatedAt: pastDays(45)
    },
    {
      id: "usr-student-2",
      name: "Rohit Deshmukh",
      email: "rohit.student@hostelassist.edu",
      username: "rohit",
      passwordHash: studentHash,
      role: "STUDENT",
      roomNumber: "A-102",
      block: "Block A",
      phone: "+91 98765 77665",
      createdAt: pastDays(30),
      updatedAt: pastDays(30)
    }
  ];
  const assets = [
    {
      id: "ast-1",
      name: "Crompton High-Speed Ceiling Fan",
      assetCode: "FAN-B204-01",
      category: "Electrical",
      block: "Block B",
      floor: 2,
      roomNumber: "B-204",
      condition: "NEEDS_ATTENTION",
      purchaseDate: pastDays(400),
      purchaseCost: 2400,
      totalRepairCost: 650,
      lastMaintenanceDate: pastDays(25),
      nextMaintenanceDate: futureDays(15),
      warrantyExpiryDate: pastDays(35),
      maintenanceHistoryCount: 3,
      status: "ACTIVE",
      createdAt: pastDays(400),
      updatedAt: pastDays(2)
    },
    {
      id: "ast-2",
      name: "Havells 25L Instant Geyser",
      assetCode: "GEYSER-A102-01",
      category: "Plumbing",
      block: "Block A",
      floor: 1,
      roomNumber: "A-102",
      condition: "GOOD",
      purchaseDate: pastDays(300),
      purchaseCost: 8500,
      totalRepairCost: 400,
      lastMaintenanceDate: pastDays(40),
      nextMaintenanceDate: futureDays(50),
      warrantyExpiryDate: futureDays(65),
      maintenanceHistoryCount: 1,
      status: "ACTIVE",
      createdAt: pastDays(300),
      updatedAt: pastDays(10)
    },
    {
      id: "ast-3",
      name: "Cisco Enterprise Wi-Fi 6 AP",
      assetCode: "WIFI-C302-01",
      category: "Internet",
      block: "Block C",
      floor: 3,
      roomNumber: "C-Corridor-3",
      condition: "EXCELLENT",
      purchaseDate: pastDays(180),
      purchaseCost: 14e3,
      totalRepairCost: 0,
      lastMaintenanceDate: pastDays(10),
      nextMaintenanceDate: futureDays(80),
      warrantyExpiryDate: futureDays(540),
      maintenanceHistoryCount: 0,
      status: "ACTIVE",
      createdAt: pastDays(180),
      updatedAt: pastDays(10)
    },
    {
      id: "ast-4",
      name: "Commercial Water Cooler & RO Purifier",
      assetCode: "RO-B-G01",
      category: "Water",
      block: "Block B",
      floor: 0,
      roomNumber: "Ground Lobby",
      condition: "GOOD",
      purchaseDate: pastDays(500),
      purchaseCost: 42e3,
      totalRepairCost: 1800,
      lastMaintenanceDate: pastDays(18),
      nextMaintenanceDate: futureDays(12),
      warrantyExpiryDate: pastDays(135),
      maintenanceHistoryCount: 4,
      status: "ACTIVE",
      createdAt: pastDays(500),
      updatedAt: pastDays(18)
    }
  ];
  const complaints = [
    {
      id: "cmp-1021",
      ticketNumber: "CMP-2026-1021",
      studentId: "usr-student-1",
      studentName: "Ananya Iyer",
      studentEmail: "ananya.student@hostelassist.edu",
      roomNumber: "B-204",
      block: "Block B",
      title: "Ceiling fan making loud grinding noise and wobbling violently",
      description: "The fan in room B-204 makes an unbearable metallic grinding sound and vibrates at speeds 3 and above. It stopped working twice yesterday.",
      category: "Electrical",
      priority: "HIGH",
      status: "IN_PROGRESS",
      assetId: "ast-1",
      assetName: "Crompton High-Speed Ceiling Fan (FAN-B204-01)",
      assignedTechnicianId: "usr-tech-1",
      assignedTechnicianName: "Rahul Verma",
      slaDeadline: calculateSlaDeadline(pastHours(4), "HIGH"),
      isOverdue: false,
      aiAnalysis: {
        category: "Electrical",
        suggestedPriority: "HIGH",
        confidence: 0.94,
        detectedKeywords: ["grinding noise", "wobbling violently", "stopped working", "vibrates"],
        safetyRiskDetected: true,
        possibleRootCause: "Worn-out ball bearing assembly or loose mounting down-rod clamp",
        recommendedAction: "Isolate power, inspect ceiling down-rod fastener, replace bearing cartridge or full fan head",
        estimatedResolutionHours: 4,
        provider: "gemini"
      },
      createdAt: pastHours(4),
      updatedAt: pastHours(1)
    },
    {
      id: "cmp-1018",
      ticketNumber: "CMP-2026-1018",
      studentId: "usr-student-2",
      studentName: "Rohit Deshmukh",
      studentEmail: "rohit.student@hostelassist.edu",
      roomNumber: "A-102",
      block: "Block A",
      title: "Bathroom tap leaking continuously onto the floor",
      description: "The cold water valve beneath the sink cannot be closed completely. Water is trickling continuously and seeping towards the doorway.",
      category: "Plumbing",
      priority: "MEDIUM",
      status: "RESOLVED",
      assetId: "ast-2",
      assetName: "Havells 25L Instant Geyser",
      assignedTechnicianId: "usr-tech-2",
      assignedTechnicianName: "Suresh Patil",
      slaDeadline: calculateSlaDeadline(pastHours(30), "MEDIUM"),
      isOverdue: false,
      totalRepairCost: 280,
      workNotes: "Replaced damaged brass spindle washer and tightened PTFE thread seal.",
      resolvedAt: pastHours(2),
      aiAnalysis: {
        category: "Plumbing",
        suggestedPriority: "MEDIUM",
        confidence: 0.91,
        detectedKeywords: ["leaking continuously", "cannot be closed", "seeping towards doorway"],
        safetyRiskDetected: false,
        possibleRootCause: "Perished rubber washer or degraded valve seat inside bibcock",
        recommendedAction: "Shut off angle valve, disassemble tap head, replace ceramic disc/washer",
        estimatedResolutionHours: 2,
        provider: "gemini"
      },
      createdAt: pastHours(28),
      updatedAt: pastHours(2)
    },
    {
      id: "cmp-1015",
      ticketNumber: "CMP-2026-1015",
      studentId: "usr-student-1",
      studentName: "Ananya Iyer",
      studentEmail: "ananya.student@hostelassist.edu",
      roomNumber: "B-204",
      block: "Block B",
      title: "Ceiling fan capacitor failure - running very slow",
      description: "Ceiling fan is running at very low speed even when regulator is set to maximum speed 5.",
      category: "Electrical",
      priority: "MEDIUM",
      status: "CLOSED",
      assetId: "ast-1",
      assetName: "Crompton High-Speed Ceiling Fan (FAN-B204-01)",
      assignedTechnicianId: "usr-tech-1",
      assignedTechnicianName: "Rahul Verma",
      slaDeadline: calculateSlaDeadline(pastDays(28), "MEDIUM"),
      isOverdue: false,
      totalRepairCost: 150,
      workNotes: "Replaced 2.5 MFD capacitor. Speed restored.",
      resolvedAt: pastDays(27),
      closedAt: pastDays(26),
      aiAnalysis: {
        category: "Electrical",
        suggestedPriority: "MEDIUM",
        confidence: 0.92,
        detectedKeywords: ["running very slow", "maximum speed 5"],
        safetyRiskDetected: false,
        possibleRootCause: "Degraded starter capacitor",
        recommendedAction: "Test microfarad rating with multimeter and replace capacitor",
        estimatedResolutionHours: 3,
        provider: "rule-based-fallback"
      },
      createdAt: pastDays(28),
      updatedAt: pastDays(26)
    },
    {
      id: "cmp-1009",
      ticketNumber: "CMP-2026-1009",
      studentId: "usr-student-1",
      studentName: "Ananya Iyer",
      studentEmail: "ananya.student@hostelassist.edu",
      roomNumber: "B-204",
      block: "Block B",
      title: "Ceiling fan burning smell and sparks from regulator",
      description: "Fan speed regulator was warm to touch and emitted light smoke when turned on.",
      category: "Electrical",
      priority: "CRITICAL",
      status: "CLOSED",
      assetId: "ast-1",
      assetName: "Crompton High-Speed Ceiling Fan (FAN-B204-01)",
      assignedTechnicianId: "usr-tech-1",
      assignedTechnicianName: "Rahul Verma",
      slaDeadline: calculateSlaDeadline(pastDays(65), "CRITICAL"),
      isOverdue: false,
      totalRepairCost: 320,
      workNotes: "Replaced step regulator and insulated charred wire ends with heat-shrink tubing.",
      resolvedAt: pastDays(64),
      closedAt: pastDays(63),
      aiAnalysis: {
        category: "Electrical",
        suggestedPriority: "CRITICAL",
        confidence: 0.98,
        detectedKeywords: ["burning smell", "sparks", "light smoke", "warm to touch"],
        safetyRiskDetected: true,
        possibleRootCause: "Thermal overload in rotary resistive regulator or shorted conductor",
        recommendedAction: "Immediate breaker trip, isolate switchplate, replace electronic regulator module",
        estimatedResolutionHours: 1,
        provider: "gemini"
      },
      createdAt: pastDays(65),
      updatedAt: pastDays(63)
    }
  ];
  const complaintHistory = [
    {
      id: "h-1",
      complaintId: "cmp-1021",
      action: "COMPLAINT_REPORTED",
      toStatus: "REPORTED",
      actorId: "usr-student-1",
      actorName: "Ananya Iyer",
      actorRole: "STUDENT",
      notes: "Initial issue reported through mobile student portal.",
      timestamp: pastHours(4)
    },
    {
      id: "h-2",
      complaintId: "cmp-1021",
      action: "AI_ANALYSIS_COMPLETED",
      toStatus: "REVIEWED",
      actorId: "system",
      actorName: "HostelAssist AI Engine",
      actorRole: "ADMIN",
      notes: "Categorized as Electrical. Identified High Priority due to mechanical instability risk.",
      timestamp: pastHours(3.8)
    },
    {
      id: "h-3",
      complaintId: "cmp-1021",
      action: "TECHNICIAN_ASSIGNED",
      fromStatus: "REVIEWED",
      toStatus: "ASSIGNED",
      actorId: "usr-admin-1",
      actorName: "Dr. Ramesh Sharma",
      actorRole: "ADMIN",
      notes: "Assigned to Rahul Verma (Senior Electrical Technician).",
      timestamp: pastHours(3.2)
    },
    {
      id: "h-4",
      complaintId: "cmp-1021",
      action: "ASSIGNMENT_ACCEPTED",
      fromStatus: "ASSIGNED",
      toStatus: "ACCEPTED",
      actorId: "usr-tech-1",
      actorName: "Rahul Verma",
      actorRole: "TECHNICIAN",
      notes: "Ticket acknowledged. Tools and spare parts prepared.",
      timestamp: pastHours(2.5)
    },
    {
      id: "h-5",
      complaintId: "cmp-1021",
      action: "REPAIR_STARTED",
      fromStatus: "ACCEPTED",
      toStatus: "IN_PROGRESS",
      actorId: "usr-tech-1",
      actorName: "Rahul Verma",
      actorRole: "TECHNICIAN",
      notes: "On site in Room B-204. Power disconnected. Disassembling housing.",
      timestamp: pastHours(1)
    }
  ];
  const feedbacks = [
    {
      id: "fb-1",
      complaintId: "cmp-1018",
      studentId: "usr-student-2",
      studentName: "Rohit Deshmukh",
      technicianId: "usr-tech-2",
      rating: 5,
      comment: "Suresh arrived quickly and fixed the tap cleanly within 20 minutes. Very polite!",
      timelinessScore: 5,
      createdAt: pastHours(1.5)
    },
    {
      id: "fb-2",
      complaintId: "cmp-1015",
      studentId: "usr-student-1",
      studentName: "Ananya Iyer",
      technicianId: "usr-tech-1",
      rating: 4,
      comment: "Fan works again at full speed. However, this is the second time this fan has had issues.",
      timelinessScore: 4,
      createdAt: pastDays(26)
    }
  ];
  const notifications = [
    {
      id: "notif-1",
      userId: "usr-student-1",
      title: "Technician on Site",
      message: "Technician Rahul Verma has started working on complaint CMP-2026-1021.",
      type: "STATUS_CHANGE",
      complaintId: "cmp-1021",
      isRead: false,
      createdAt: pastHours(1)
    },
    {
      id: "notif-2",
      userId: "usr-admin-1",
      title: "Recurring Issue Detected",
      message: "Room B-204 has logged 3 Electrical complaints for Ceiling Fan (FAN-B204-01) within 90 days. Recommend asset replacement.",
      type: "RECURRING_ALERT",
      complaintId: "cmp-1021",
      isRead: false,
      createdAt: pastHours(3.5)
    },
    {
      id: "notif-3",
      userId: "usr-student-2",
      title: "Complaint Resolved",
      message: "Bathroom tap leak (CMP-2026-1018) was marked resolved. Please verify and submit feedback.",
      type: "FEEDBACK_REQUEST",
      complaintId: "cmp-1018",
      isRead: false,
      createdAt: pastHours(2)
    },
    {
      id: "notif-4",
      userId: "usr-tech-1",
      title: "New High-Priority Assignment",
      message: "You have been assigned to High-Priority complaint CMP-2026-1021 in Room B-204.",
      type: "ASSIGNMENT",
      complaintId: "cmp-1021",
      isRead: true,
      createdAt: pastHours(3.2)
    }
  ];
  const auditLogs = [
    {
      id: "aud-1",
      action: "SYSTEM_BOOT",
      performedBy: "System Core",
      userRole: "ADMIN",
      entityType: "SYSTEM",
      entityId: "SYS-INIT",
      details: "HostelAssist initialized with production schemas and database consistency checks.",
      timestamp: pastDays(90)
    },
    {
      id: "aud-2",
      action: "USER_REGISTERED",
      performedBy: "Ananya Iyer",
      userRole: "STUDENT",
      entityType: "USER",
      entityId: "usr-student-1",
      details: "Student registration completed for Room B-204.",
      timestamp: pastDays(45)
    },
    {
      id: "aud-3",
      action: "COMPLAINT_CREATED",
      performedBy: "Ananya Iyer",
      userRole: "STUDENT",
      entityType: "COMPLAINT",
      entityId: "cmp-1021",
      details: "Reported High-Priority Electrical complaint for Room B-204 fan.",
      timestamp: pastHours(4)
    },
    {
      id: "aud-4",
      action: "TECHNICIAN_ASSIGNED",
      performedBy: "Dr. Ramesh Sharma",
      userRole: "ADMIN",
      entityType: "COMPLAINT",
      entityId: "cmp-1021",
      details: "Assigned ticket CMP-2026-1021 to Rahul Verma.",
      timestamp: pastHours(3.2)
    }
  ];
  const preventiveSchedules = [
    {
      id: "pm-1",
      title: "Block B Electrical Overhead Inspection",
      description: "Comprehensive inspection of ceiling fans, switchgear, and neutral connections in Block B following recurring motor faults.",
      targetCategory: "Electrical",
      targetBlock: "Block B",
      suggestedAction: "Inspect all ceiling fan down-rod safety pins, check capacitor ratings, and balance motor windings.",
      frequencyDays: 60,
      nextScheduledDate: futureDays(5),
      status: "SCHEDULED",
      createdReason: "AI_FAILURE_PATTERN_ALERT",
      createdAt: pastDays(2)
    },
    {
      id: "pm-2",
      title: "Hostel RO Filtration Membrane Flush",
      description: "Quarterly chemical sanitization and sediment cartridge replacement for all drinking water coolers.",
      targetCategory: "Water",
      targetBlock: "Block B",
      suggestedAction: "Replace 5-micron pre-filters and conduct TDS / chlorine residual water testing.",
      frequencyDays: 90,
      lastRunDate: pastDays(75),
      nextScheduledDate: futureDays(15),
      status: "SCHEDULED",
      createdReason: "MANUAL",
      createdAt: pastDays(75)
    }
  ];
  return {
    users,
    complaints,
    complaintHistory,
    assets,
    notifications,
    feedbacks,
    auditLogs,
    preventiveSchedules
  };
}
function getDb() {
  if (dbData) {
    return dbData;
  }
  if (import_fs.default.existsSync(DB_FILE)) {
    try {
      const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
      dbData = JSON.parse(raw);
      return dbData;
    } catch (err) {
      console.error("Failed reading existing db file, regenerating defaults:", err);
    }
  }
  dbData = seedDatabase();
  saveDb();
  return dbData;
}
function saveDb() {
  if (!dbData) return;
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing to database file:", err);
  }
}
function findUserByEmailOrUsername(identifier) {
  const db = getDb();
  const clean = identifier.trim().toLowerCase();
  return db.users.find(
    (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
  );
}
function findUserById(id) {
  return getDb().users.find((u) => u.id === id);
}
function getAllUsers() {
  return getDb().users;
}
function createUser(userData) {
  const db = getDb();
  const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newUser = {
    id,
    ...userData,
    createdAt: now,
    updatedAt: now
  };
  db.users.push(newUser);
  saveDb();
  createAuditLog({
    action: "USER_REGISTERED",
    performedBy: newUser.name,
    userRole: newUser.role,
    entityType: "USER",
    entityId: newUser.id,
    details: `User registered with role ${newUser.role} (${newUser.email}).`
  });
  return newUser;
}
function createAuditLog(item) {
  const db = getDb();
  const audit = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...item,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.auditLogs.unshift(audit);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDb();
  return audit;
}
function createNotification(notif) {
  const db = getDb();
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...notif,
    isRead: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.notifications.unshift(newNotif);
  saveDb();
  return newNotif;
}
function detectRecurringIssues() {
  const db = getDb();
  const ninetyDaysAgo = Date.now() - 90 * 86400 * 1e3;
  const roomCategoryMap = /* @__PURE__ */ new Map();
  for (const c of db.complaints) {
    const cTime = new Date(c.createdAt).getTime();
    if (cTime >= ninetyDaysAgo) {
      const key = `${c.block}|${c.roomNumber}|${c.category}`;
      const list = roomCategoryMap.get(key) || [];
      list.push(c);
      roomCategoryMap.set(key, list);
    }
  }
  const alerts = [];
  for (const [key, list] of roomCategoryMap.entries()) {
    if (list.length >= 2) {
      const [block, roomNumber, category] = key.split("|");
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const first = list[0];
      const last = list[list.length - 1];
      const isCritical = list.length >= 3;
      let recommendation = `Multiple ${category} faults logged in Room ${roomNumber}. Perform comprehensive root-cause diagnostic on wiring and connected appliances.`;
      if (category === "Electrical" && list.length >= 3) {
        recommendation = `High recurrence: Room ${roomNumber} has suffered 3+ electrical faults in 90 days. Replace full fixture/appliance instead of repeating component-level patches.`;
      } else if (category === "Plumbing" && list.length >= 2) {
        recommendation = `Recurring water/plumbing leaks in Room ${roomNumber}. Inspect pipe junctions behind wall tiles and replace degraded main valve assembly.`;
      }
      alerts.push({
        id: `rec-${block}-${roomNumber}-${category}`,
        block,
        roomNumber,
        category,
        count: list.length,
        descriptionSnippet: last.title,
        firstReportedAt: first.createdAt,
        lastReportedAt: last.createdAt,
        severity: isCritical ? "CRITICAL" : "WARNING",
        recommendation
      });
    }
  }
  return alerts;
}
function calculateHostelHealthScore() {
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
    const isClosedOrResolved = c.status === "RESOLVED" || c.status === "CLOSED";
    if (!isClosedOrResolved) {
      if (c.status === "REPORTED" || c.status === "REVIEWED" || c.status === "ASSIGNED") {
        openCount++;
      } else if (c.status === "ACCEPTED" || c.status === "IN_PROGRESS") {
        inProgressCount++;
      }
      if (c.priority === "CRITICAL") {
        criticalCount++;
      }
      const deadline = new Date(c.slaDeadline).getTime();
      if (now > deadline) {
        overdueCount++;
        c.isOverdue = true;
      }
    } else {
      if (c.status === "RESOLVED") resolvedCount++;
      if (c.status === "CLOSED") closedCount++;
      if (c.resolvedAt) {
        const diffHours = (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / 36e5;
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
  const unresolvedPenalty = Math.min(25, (openCount + inProgressCount) * 3);
  const criticalPenalty = Math.min(30, criticalCount * 12);
  const slaPenalty = Math.min(20, overdueCount * 7);
  const recurringPenalty = Math.min(25, recurringAlerts.length * 6);
  let assetScoreSum = 0;
  for (const a of db.assets) {
    if (a.condition === "EXCELLENT") assetScoreSum += 100;
    else if (a.condition === "GOOD") assetScoreSum += 80;
    else if (a.condition === "NEEDS_ATTENTION") assetScoreSum += 50;
    else if (a.condition === "CRITICAL") assetScoreSum += 20;
  }
  const assetConditionScore = db.assets.length > 0 ? Math.round(assetScoreSum / db.assets.length) : 85;
  let ratingSum = 0;
  for (const f of db.feedbacks) {
    ratingSum += f.rating;
  }
  const avgRating = db.feedbacks.length > 0 ? Number((ratingSum / db.feedbacks.length).toFixed(1)) : 4.5;
  const feedbackBonus = Math.round((avgRating - 3) * 5);
  let score = baseScore - unresolvedPenalty - criticalPenalty - slaPenalty - recurringPenalty + feedbackBonus;
  score = Math.round(score * 0.7 + assetConditionScore * 0.3);
  score = Math.max(10, Math.min(100, score));
  let grade = "Poor";
  if (score >= 88) grade = "Excellent";
  else if (score >= 70) grade = "Good";
  else if (score >= 50) grade = "Needs Attention";
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
      assetConditionScore
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
      totalMaintenanceCost: totalRepairCost
    }
  };
}

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "hostelassist_production_secret_key_998877";
var JWT_EXPIRATION = "7d";
function generateJwtToken(user) {
  return import_jsonwebtoken.default.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}
function hashPassword(plainText) {
  const salt = import_bcryptjs2.default.genSaltSync(10);
  return import_bcryptjs2.default.hashSync(plainText, salt);
}
function comparePassword(plainText, hash) {
  return import_bcryptjs2.default.compareSync(plainText, hash);
}
function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) {
    res.status(401).json({ error: "Authentication required. Missing Bearer token." });
    return;
  }
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired session token." });
      return;
    }
    const user = findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: "User account no longer exists." });
      return;
    }
    req.user = user;
    next();
  });
}
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized. Please login." });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' does not have permission for this resource. Required: [${allowedRoles.join(", ")}]`
      });
      return;
    }
    next();
  };
}

// server/routes/authRoutes.ts
var router = (0, import_express.Router)();
router.post("/register", (req, res) => {
  try {
    const { name, username, email, password, role = "STUDENT", roomNumber, block, phone, specialty } = req.body;
    if (!name || !username || !email || !password) {
      res.status(400).json({ error: "Name, username, email, and password are required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }
    const existingUser = findUserByEmailOrUsername(email) || findUserByEmailOrUsername(username);
    if (existingUser) {
      res.status(409).json({ error: "An account with that email or username already exists." });
      return;
    }
    const validRoles = ["STUDENT", "TECHNICIAN", "ADMIN"];
    const chosenRole = validRoles.includes(role) ? role : "STUDENT";
    const passwordHash = hashPassword(password);
    const newUser = createUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: chosenRole,
      roomNumber: roomNumber ? roomNumber.trim() : void 0,
      block: block ? block.trim() : void 0,
      phone: phone ? phone.trim() : void 0,
      specialty: chosenRole === "TECHNICIAN" ? specialty || "General" : void 0
    });
    const token = generateJwtToken(newUser);
    res.status(201).json({
      message: "Registration successful.",
      user: sanitizeUser(newUser),
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to complete registration." });
  }
});
router.post("/login", (req, res) => {
  try {
    const identifier = req.body.usernameOrEmail || req.body.email || req.body.username;
    const { password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: "Please provide your username/email and password." });
      return;
    }
    const user = findUserByEmailOrUsername(identifier);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials. User not found." });
      return;
    }
    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials. Incorrect password." });
      return;
    }
    const token = generateJwtToken(user);
    createAuditLog({
      action: "USER_LOGIN",
      performedBy: user.name,
      userRole: user.role,
      entityType: "USER",
      entityId: user.id,
      details: `${user.name} logged into ${user.role} workspace.`
    });
    res.json({
      message: "Login successful.",
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login." });
  }
});
router.post("/demo-switch", (req, res) => {
  try {
    const { role } = req.body;
    const targetRole = role?.toUpperCase();
    if (!["STUDENT", "TECHNICIAN", "ADMIN"].includes(targetRole)) {
      res.status(400).json({ error: "Invalid role. Must be STUDENT, TECHNICIAN, or ADMIN." });
      return;
    }
    const all = getAllUsers();
    let demoUser = all.find((u) => u.role === targetRole);
    if (!demoUser) {
      res.status(404).json({ error: `No user found for role ${targetRole}` });
      return;
    }
    const token = generateJwtToken(demoUser);
    createAuditLog({
      action: "DEMO_ROLE_SWITCH",
      performedBy: demoUser.name,
      userRole: demoUser.role,
      entityType: "USER",
      entityId: demoUser.id,
      details: `Switched session to ${demoUser.role} workspace as ${demoUser.name}.`
    });
    res.json({
      message: `Switched to demo ${targetRole} mode.`,
      user: sanitizeUser(demoUser),
      token
    });
  } catch (error) {
    console.error("Demo switch error:", error);
    res.status(500).json({ error: "Failed to switch demo role." });
  }
});
router.get("/me", authenticateToken, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  res.json({ user: sanitizeUser(req.user) });
});
router.get("/", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const users = getAllUsers().map(sanitizeUser);
  res.json({ users });
});
router.get("/technicians", authenticateToken, (req, res) => {
  const technicians = getAllUsers().filter((u) => u.role === "TECHNICIAN").map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    specialty: u.specialty || "General",
    phone: u.phone
  }));
  res.json({ technicians });
});
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully." });
});
var authRoutes_default = router;

// server/routes/complaintRoutes.ts
var import_express2 = require("express");

// server/gemini.ts
var import_genai = require("@google/genai");
var geminiClient = null;
function getGeminiClient() {
  if (!geminiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      geminiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
      geminiClient = null;
    }
  }
  return geminiClient;
}
function fallbackRuleBasedAnalysis(title, description, _roomNumber, _block) {
  const combined = `${title} ${description}`.toLowerCase();
  const safetyKeywords = [
    "spark",
    "sparks",
    "smoke",
    "fire",
    "burning",
    "shock",
    "electric shock",
    "short circuit",
    "gas leak",
    "flooding",
    "burst pipe",
    "ceiling collapse",
    "exposed wire",
    "explosion"
  ];
  const hasSafetyRisk = safetyKeywords.some((kw) => combined.includes(kw));
  let category = "Room";
  let matchedKeywords = [];
  const electricalPatterns = [
    "fan",
    "light",
    "bulb",
    "switch",
    "socket",
    "plug",
    "wiring",
    "power",
    "voltage",
    "spark",
    "short circuit",
    "mcb",
    "tripped",
    "regulator",
    "fuse",
    "tube light",
    "air conditioner",
    "ac"
  ];
  const plumbingPatterns = [
    "tap",
    "pipe",
    "leak",
    "leaking",
    "geyser",
    "drain",
    "clogged",
    "overflow",
    "flush",
    "sink",
    "faucet",
    "seepage",
    "valve"
  ];
  const waterPatterns = [
    "water cooler",
    "ro purifier",
    "drinking water",
    "no water",
    "dirty water",
    "tank",
    "pump"
  ];
  const internetPatterns = [
    "wifi",
    "wi-fi",
    "internet",
    "router",
    "lan",
    "network",
    "slow speed",
    "ethernet",
    "dns"
  ];
  const furniturePatterns = [
    "bed",
    "chair",
    "table",
    "desk",
    "cupboard",
    "wardrobe",
    "hinge",
    "almirah",
    "mattress",
    "door lock",
    "latch",
    "handle"
  ];
  const cleaningPatterns = [
    "dust",
    "garbage",
    "trash",
    "clean",
    "cleaning",
    "sweep",
    "mop",
    "dirty corridor",
    "stain"
  ];
  const bathroomPatterns = [
    "toilet",
    "commode",
    "shower",
    "mirror",
    "bathroom door",
    "exhaust fan"
  ];
  if (hasSafetyRisk && (combined.includes("wire") || combined.includes("spark") || combined.includes("shock"))) {
    category = "Electrical";
  } else if (electricalPatterns.some((k) => combined.includes(k))) {
    category = "Electrical";
    matchedKeywords = electricalPatterns.filter((k) => combined.includes(k));
  } else if (waterPatterns.some((k) => combined.includes(k))) {
    category = "Water";
    matchedKeywords = waterPatterns.filter((k) => combined.includes(k));
  } else if (plumbingPatterns.some((k) => combined.includes(k))) {
    category = "Plumbing";
    matchedKeywords = plumbingPatterns.filter((k) => combined.includes(k));
  } else if (internetPatterns.some((k) => combined.includes(k))) {
    category = "Internet";
    matchedKeywords = internetPatterns.filter((k) => combined.includes(k));
  } else if (furniturePatterns.some((k) => combined.includes(k))) {
    category = "Furniture";
    matchedKeywords = furniturePatterns.filter((k) => combined.includes(k));
  } else if (cleaningPatterns.some((k) => combined.includes(k))) {
    category = "Cleaning";
    matchedKeywords = cleaningPatterns.filter((k) => combined.includes(k));
  } else if (bathroomPatterns.some((k) => combined.includes(k))) {
    category = "Bathroom";
    matchedKeywords = bathroomPatterns.filter((k) => combined.includes(k));
  }
  let priority = "MEDIUM";
  let estimatedHours = 24;
  if (hasSafetyRisk || combined.includes("emergency") || combined.includes("hazard") || combined.includes("burst")) {
    priority = "CRITICAL";
    estimatedHours = 2;
  } else if (combined.includes("urgent") || combined.includes("immediately") || combined.includes("flooding") || combined.includes("no water") || combined.includes("cannot sleep") || combined.includes("exam") || category === "Water") {
    priority = "HIGH";
    estimatedHours = 6;
  } else if (combined.includes("minor") || combined.includes("creak") || combined.includes("loose screw") || category === "Furniture" || category === "Cleaning") {
    priority = "LOW";
    estimatedHours = 72;
  }
  let possibleRootCause = "General component wear and tear or operational degradation";
  let recommendedAction = "Technician on-site inspection and corrective maintenance";
  if (category === "Electrical") {
    if (combined.includes("fan")) {
      possibleRootCause = "Defective capacitor, worn motor bearing, or loose suspension bracket";
      recommendedAction = "Test capacitor capacitance, inspect ceiling anchor pin, lubricate bearing housing";
    } else if (combined.includes("light") || combined.includes("bulb")) {
      possibleRootCause = "Burnt LED driver or faulty lamp choke";
      recommendedAction = "Test circuit voltage and replace lamp/fixture";
    } else if (combined.includes("switch") || combined.includes("socket")) {
      possibleRootCause = "Arcing contacts or loose terminal screw behind switchboard";
      recommendedAction = "De-energize circuit breaker, replace switch mechanism with ISI-rated unit";
    }
  } else if (category === "Plumbing") {
    if (combined.includes("leak") || combined.includes("tap")) {
      possibleRootCause = "Degraded internal rubber washer or corroded spindle cartridge";
      recommendedAction = "Shut isolation valve, disassemble tap spindle, replace washer and Teflon seal";
    } else if (combined.includes("clog") || combined.includes("drain")) {
      possibleRootCause = "Hair/debris accumulation in P-trap or waste outlet line";
      recommendedAction = "Deploy mechanical drain auger and clear trap residue";
    }
  } else if (category === "Internet") {
    possibleRootCause = "Access point DHCP exhaustion or degraded PoE patch cord";
    recommendedAction = "Reboot PoE switch port and verify ping latency and packet drop rates";
  }
  return {
    category,
    suggestedPriority: priority,
    confidence: 0.89,
    detectedKeywords: matchedKeywords.length > 0 ? matchedKeywords.slice(0, 5) : [category.toLowerCase()],
    safetyRiskDetected: hasSafetyRisk,
    possibleRootCause,
    recommendedAction,
    estimatedResolutionHours: estimatedHours,
    provider: "rule-based-fallback"
  };
}
async function analyzeComplaintWithAi(title, description, roomNumber, block) {
  const client = getGeminiClient();
  if (!client) {
    return fallbackRuleBasedAnalysis(title, description, roomNumber, block);
  }
  try {
    const prompt = `You are the lead engineering diagnostician for HostelAssist, an enterprise smart hostel maintenance and operations platform.
Analyze the following student maintenance complaint:
Title: "${title}"
Description: "${description}"
Room / Location: "${roomNumber || "Unknown"}", Block: "${block || "Unknown"}"

Perform structured engineering triage:
1. Category must be one of: ["Electrical", "Plumbing", "Furniture", "Water", "Internet", "Cleaning", "Bathroom", "Room", "Safety", "Other"].
2. Priority must be one of: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].
   - CRITICAL: Life safety risks (fire, electrical sparks, gas leak, building structural issues, severe flooding). SLA: 2 hrs.
   - HIGH: Major daily disruption (total water outage, no fan in hot weather, geyser failure in winter). SLA: 6 hrs.
   - MEDIUM: Moderate disruption (leaking tap, flickering light, slow Wi-Fi). SLA: 24 hrs.
   - LOW: Minor cosmetic or minor inconvenience (creaky door hinge, minor paint scratch). SLA: 72 hrs.
3. List 2 to 5 detected technical keywords.
4. Flag boolean safetyRiskDetected (true if danger of electrocution, fire, slippage, structural hazard).
5. State the most probable technical root cause.
6. Provide specific step-by-step recommended technician actions.
7. Estimate reasonable resolution hours.`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            category: {
              type: import_genai.Type.STRING,
              enum: [
                "Electrical",
                "Plumbing",
                "Furniture",
                "Water",
                "Internet",
                "Cleaning",
                "Bathroom",
                "Room",
                "Safety",
                "Other"
              ]
            },
            suggestedPriority: {
              type: import_genai.Type.STRING,
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
            },
            confidence: { type: import_genai.Type.NUMBER },
            detectedKeywords: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            safetyRiskDetected: { type: import_genai.Type.BOOLEAN },
            possibleRootCause: { type: import_genai.Type.STRING },
            recommendedAction: { type: import_genai.Type.STRING },
            estimatedResolutionHours: { type: import_genai.Type.INTEGER }
          },
          required: [
            "category",
            "suggestedPriority",
            "detectedKeywords",
            "safetyRiskDetected",
            "possibleRootCause",
            "recommendedAction",
            "estimatedResolutionHours"
          ]
        }
      }
    });
    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        category: parsed.category,
        suggestedPriority: parsed.suggestedPriority,
        confidence: parsed.confidence || 0.96,
        detectedKeywords: parsed.detectedKeywords || [],
        safetyRiskDetected: Boolean(parsed.safetyRiskDetected),
        possibleRootCause: parsed.possibleRootCause,
        recommendedAction: parsed.recommendedAction,
        estimatedResolutionHours: parsed.estimatedResolutionHours || 4,
        provider: "gemini"
      };
    }
  } catch (err) {
    console.warn("Gemini AI call failed, falling back to rule-based engine:", err);
  }
  return fallbackRuleBasedAnalysis(title, description, roomNumber, block);
}

// server/routes/complaintRoutes.ts
var router2 = (0, import_express2.Router)();
function calculateSlaDeadline2(createdAt, priority) {
  const created = new Date(createdAt).getTime();
  let hours = 24;
  if (priority === "CRITICAL") hours = 2;
  else if (priority === "HIGH") hours = 6;
  else if (priority === "MEDIUM") hours = 24;
  else if (priority === "LOW") hours = 72;
  return new Date(created + hours * 3600 * 1e3).toISOString();
}
router2.post("/analyze", authenticateToken, async (req, res) => {
  try {
    const { title, description, roomNumber, block } = req.body;
    if (!title && !description) {
      res.status(400).json({ error: "Title or description required for AI analysis." });
      return;
    }
    const analysis = await analyzeComplaintWithAi(title || "", description || "", roomNumber, block);
    res.json({ analysis });
  } catch (err) {
    console.error("AI Analysis API error:", err);
    res.status(500).json({ error: "Failed to analyze complaint." });
  }
});
router2.post("/", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const {
      title,
      description,
      category = "Other",
      priority = "MEDIUM",
      roomNumber,
      block,
      imageUrl,
      assetId
    } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: "Title and description are required." });
      return;
    }
    const room = roomNumber || user.roomNumber || "Common Area";
    const b = block || user.block || "Block A";
    const aiAnalysis = await analyzeComplaintWithAi(title, description, room, b);
    const finalCategory = category || aiAnalysis.category;
    const finalPriority = priority || aiAnalysis.suggestedPriority;
    const db = getDb();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const id = `cmp-${Date.now()}`;
    const nextTicketNum = `CMP-${(/* @__PURE__ */ new Date()).getFullYear()}-${1e3 + db.complaints.length + 1}`;
    let matchedAssetName;
    if (assetId) {
      const matchedAsset = db.assets.find((a) => a.id === assetId || a.assetCode === assetId);
      if (matchedAsset) {
        matchedAssetName = `${matchedAsset.name} (${matchedAsset.assetCode})`;
        matchedAsset.condition = finalPriority === "CRITICAL" ? "CRITICAL" : "NEEDS_ATTENTION";
      }
    }
    const newComplaint = {
      id,
      ticketNumber: nextTicketNum,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      roomNumber: room,
      block: b,
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      priority: finalPriority,
      status: "REPORTED",
      imageUrl: imageUrl || void 0,
      assetId,
      assetName: matchedAssetName,
      aiAnalysis,
      slaDeadline: calculateSlaDeadline2(now, finalPriority),
      isOverdue: false,
      createdAt: now,
      updatedAt: now
    };
    db.complaints.unshift(newComplaint);
    const historyItem = {
      id: `h-${Date.now()}`,
      complaintId: id,
      action: "COMPLAINT_REPORTED",
      toStatus: "REPORTED",
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      notes: `Reported by ${user.name}. AI evaluated as ${aiAnalysis.suggestedPriority} priority (${aiAnalysis.category}).`,
      timestamp: now
    };
    db.complaintHistory.push(historyItem);
    const admins = db.users.filter((u) => u.role === "ADMIN");
    for (const admin of admins) {
      createNotification({
        userId: admin.id,
        title: `New ${finalPriority} Complaint: ${nextTicketNum}`,
        message: `${user.name} reported: "${title}" in Room ${room} (${b}).`,
        type: finalPriority === "CRITICAL" ? "SLA_BREACH" : "INFO",
        complaintId: id
      });
    }
    createAuditLog({
      action: "COMPLAINT_CREATED",
      performedBy: user.name,
      userRole: user.role,
      entityType: "COMPLAINT",
      entityId: id,
      details: `Created ticket ${nextTicketNum} in Room ${room} (${finalPriority} - ${finalCategory}).`
    });
    saveDb();
    res.status(201).json({
      message: "Complaint submitted successfully.",
      complaint: newComplaint
    });
  } catch (err) {
    console.error("Create complaint error:", err);
    res.status(500).json({ error: "Failed to create complaint." });
  }
});
router2.get("/", authenticateToken, (req, res) => {
  const db = getDb();
  const {
    status,
    category,
    priority,
    block,
    room,
    search,
    technicianId,
    studentId
  } = req.query;
  const now = Date.now();
  let results = db.complaints.map((c) => {
    const isClosedOrResolved = c.status === "RESOLVED" || c.status === "CLOSED";
    const deadline = new Date(c.slaDeadline).getTime();
    return {
      ...c,
      isOverdue: !isClosedOrResolved && now > deadline
    };
  });
  if (status) {
    results = results.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }
  if (category) {
    results = results.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  if (priority) {
    results = results.filter((c) => c.priority.toLowerCase() === priority.toLowerCase());
  }
  if (block) {
    results = results.filter((c) => c.block.toLowerCase().includes(block.toLowerCase()));
  }
  if (room) {
    results = results.filter((c) => c.roomNumber.toLowerCase().includes(room.toLowerCase()));
  }
  if (technicianId) {
    results = results.filter((c) => c.assignedTechnicianId === technicianId);
  }
  if (studentId) {
    results = results.filter((c) => c.studentId === studentId);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (c) => c.ticketNumber.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.roomNumber.toLowerCase().includes(q) || c.block.toLowerCase().includes(q) || c.assignedTechnicianName && c.assignedTechnicianName.toLowerCase().includes(q)
    );
  }
  res.json({
    total: results.length,
    complaints: results
  });
});
router2.get("/student", authenticateToken, (req, res) => {
  const user = req.user;
  const db = getDb();
  const now = Date.now();
  const userComplaints = db.complaints.filter((c) => c.studentId === user.id).map((c) => ({
    ...c,
    isOverdue: c.status !== "RESOLVED" && c.status !== "CLOSED" && now > new Date(c.slaDeadline).getTime()
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ complaints: userComplaints });
});
router2.get("/technician", authenticateToken, requireRole("TECHNICIAN", "ADMIN"), (req, res) => {
  const user = req.user;
  const db = getDb();
  const now = Date.now();
  let techComplaints = db.complaints;
  if (user.role === "TECHNICIAN") {
    techComplaints = techComplaints.filter((c) => c.assignedTechnicianId === user.id);
  }
  const mapped = techComplaints.map((c) => ({
    ...c,
    isOverdue: c.status !== "RESOLVED" && c.status !== "CLOSED" && now > new Date(c.slaDeadline).getTime()
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ complaints: mapped });
});
router2.get("/:id", authenticateToken, (req, res) => {
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === req.params.id || c.ticketNumber === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: "Complaint not found." });
    return;
  }
  const history = db.complaintHistory.filter((h) => h.complaintId === complaint.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const feedback = db.feedbacks.find((f) => f.complaintId === complaint.id);
  res.json({
    complaint,
    history,
    feedback
  });
});
router2.post("/:id/assign", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const { technicianId } = req.body;
  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: "Complaint not found." });
    return;
  }
  const technician = findUserById(technicianId);
  if (!technician || technician.role !== "TECHNICIAN") {
    res.status(400).json({ error: "Valid technician ID required." });
    return;
  }
  const previousStatus = complaint.status;
  complaint.assignedTechnicianId = technician.id;
  complaint.assignedTechnicianName = technician.name;
  complaint.status = "ASSIGNED";
  complaint.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  db.complaintHistory.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    action: "TECHNICIAN_ASSIGNED",
    fromStatus: previousStatus,
    toStatus: "ASSIGNED",
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: "ADMIN",
    notes: `Assigned to ${technician.name} (${technician.specialty || "General"}).`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  createNotification({
    userId: technician.id,
    title: `New Assignment: ${complaint.ticketNumber}`,
    message: `You have been assigned to: "${complaint.title}" in Room ${complaint.roomNumber} (${complaint.priority} priority).`,
    type: "ASSIGNMENT",
    complaintId: complaint.id
  });
  createNotification({
    userId: complaint.studentId,
    title: `Technician Assigned`,
    message: `Technician ${technician.name} has been assigned to your complaint ${complaint.ticketNumber}.`,
    type: "STATUS_CHANGE",
    complaintId: complaint.id
  });
  createAuditLog({
    action: "COMPLAINT_ASSIGNED",
    performedBy: req.user.name,
    userRole: "ADMIN",
    entityType: "COMPLAINT",
    entityId: complaint.id,
    details: `Assigned ${complaint.ticketNumber} to ${technician.name}.`
  });
  saveDb();
  res.json({
    message: "Technician assigned successfully.",
    complaint
  });
});
router2.post("/:id/status", authenticateToken, requireRole("TECHNICIAN", "ADMIN"), (req, res) => {
  const db = getDb();
  const { status, workNotes, repairCost, evidenceImageUrl } = req.body;
  const validStatuses = ["ACCEPTED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Allowed: [${validStatuses.join(", ")}]` });
    return;
  }
  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: "Complaint not found." });
    return;
  }
  const previousStatus = complaint.status;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  complaint.status = status;
  complaint.updatedAt = now;
  if (workNotes) complaint.workNotes = workNotes;
  if (repairCost !== void 0) {
    complaint.totalRepairCost = Number(repairCost);
    if (complaint.assetId) {
      const asset = db.assets.find((a) => a.id === complaint.assetId);
      if (asset) {
        asset.totalRepairCost = (asset.totalRepairCost || 0) + Number(repairCost);
        asset.lastMaintenanceDate = now;
      }
    }
  }
  if (evidenceImageUrl) complaint.repairEvidenceUrl = evidenceImageUrl;
  if (status === "RESOLVED") {
    complaint.resolvedAt = now;
  } else if (status === "CLOSED") {
    complaint.closedAt = now;
  }
  db.complaintHistory.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    action: `STATUS_CHANGED_TO_${status}`,
    fromStatus: previousStatus,
    toStatus: status,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: req.user.role,
    notes: workNotes || `Status advanced to ${status}.`,
    repairCost: repairCost !== void 0 ? Number(repairCost) : void 0,
    evidenceImageUrl: evidenceImageUrl || void 0,
    timestamp: now
  });
  let notifMsg = `Complaint ${complaint.ticketNumber} updated to ${status}.`;
  if (status === "ACCEPTED") notifMsg = `Technician has accepted your ticket ${complaint.ticketNumber} and scheduled repair.`;
  if (status === "IN_PROGRESS") notifMsg = `Work has begun on your ticket ${complaint.ticketNumber}.`;
  if (status === "RESOLVED") notifMsg = `Your complaint ${complaint.ticketNumber} is marked RESOLVED. Please verify and leave feedback.`;
  createNotification({
    userId: complaint.studentId,
    title: `Complaint Status: ${status}`,
    message: notifMsg,
    type: status === "RESOLVED" ? "FEEDBACK_REQUEST" : "STATUS_CHANGE",
    complaintId: complaint.id
  });
  createAuditLog({
    action: "STATUS_UPDATED",
    performedBy: req.user.name,
    userRole: req.user.role,
    entityType: "COMPLAINT",
    entityId: complaint.id,
    details: `Changed ${complaint.ticketNumber} status from ${previousStatus} to ${status}. Notes: ${workNotes || "none"}.`
  });
  saveDb();
  res.json({
    message: `Status updated to ${status}.`,
    complaint
  });
});
router2.post("/:id/verify", authenticateToken, requireRole("STUDENT", "ADMIN"), (req, res) => {
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: "Complaint not found." });
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  complaint.status = "CLOSED";
  complaint.closedAt = now;
  complaint.updatedAt = now;
  db.complaintHistory.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    action: "VERIFIED_AND_CLOSED",
    fromStatus: "RESOLVED",
    toStatus: "CLOSED",
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: req.user.role,
    notes: "Resolution verified by student. Ticket officially closed.",
    timestamp: now
  });
  createAuditLog({
    action: "COMPLAINT_CLOSED",
    performedBy: req.user.name,
    userRole: req.user.role,
    entityType: "COMPLAINT",
    entityId: complaint.id,
    details: `Ticket ${complaint.ticketNumber} verified and closed.`
  });
  saveDb();
  res.json({
    message: "Complaint verified and closed.",
    complaint
  });
});
router2.post("/:id/feedback", authenticateToken, requireRole("STUDENT", "ADMIN"), (req, res) => {
  const db = getDb();
  const { rating, comment } = req.body;
  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: "Complaint not found." });
    return;
  }
  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    return;
  }
  const existingFeedbackIndex = db.feedbacks.findIndex((f) => f.complaintId === complaint.id);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const feedbackItem = {
    id: `fb-${Date.now()}`,
    complaintId: complaint.id,
    studentId: req.user.id,
    studentName: req.user.name,
    technicianId: complaint.assignedTechnicianId,
    rating: numericRating,
    comment: comment ? comment.trim() : "Satisfied with resolution.",
    timelinessScore: complaint.isOverdue ? 2 : 5,
    createdAt: now
  };
  if (existingFeedbackIndex >= 0) {
    db.feedbacks[existingFeedbackIndex] = feedbackItem;
  } else {
    db.feedbacks.push(feedbackItem);
  }
  if (complaint.assignedTechnicianId) {
    createNotification({
      userId: complaint.assignedTechnicianId,
      title: `Student Feedback: ${numericRating} Stars`,
      message: `${req.user.name} rated your work on ${complaint.ticketNumber}: "${feedbackItem.comment}"`,
      type: "INFO",
      complaintId: complaint.id
    });
  }
  createAuditLog({
    action: "FEEDBACK_SUBMITTED",
    performedBy: req.user.name,
    userRole: req.user.role,
    entityType: "COMPLAINT",
    entityId: complaint.id,
    details: `Rated ${numericRating}/5 stars for ticket ${complaint.ticketNumber}.`
  });
  saveDb();
  res.status(201).json({
    message: "Feedback submitted successfully.",
    feedback: feedbackItem
  });
});
var complaintRoutes_default = router2;

// server/routes/assetRoutes.ts
var import_express3 = require("express");
var import_qrcode = __toESM(require("qrcode"), 1);
var router3 = (0, import_express3.Router)();
router3.get("/", authenticateToken, async (req, res) => {
  const db = getDb();
  const { category, block, condition, search, code } = req.query;
  let list = db.assets;
  if (code) {
    const c = code.trim().toLowerCase();
    list = list.filter((a) => a.assetCode.toLowerCase() === c || a.id.toLowerCase() === c);
  }
  if (category) {
    list = list.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }
  if (block) {
    list = list.filter((a) => a.block.toLowerCase().includes(block.toLowerCase()));
  }
  if (condition) {
    list = list.filter((a) => a.condition.toLowerCase() === condition.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (a) => a.name.toLowerCase().includes(q) || a.assetCode.toLowerCase().includes(q) || a.roomNumber.toLowerCase().includes(q)
    );
  }
  res.json({ total: list.length, assets: list });
});
router3.get("/:id", authenticateToken, async (req, res) => {
  const db = getDb();
  const idOrCode = req.params.id;
  const asset = db.assets.find((a) => a.id === idOrCode || a.assetCode === idOrCode);
  if (!asset) {
    res.status(404).json({ error: "Asset not found." });
    return;
  }
  const qrPayload = JSON.stringify({
    app: "HostelAssist",
    id: asset.id,
    code: asset.assetCode,
    name: asset.name,
    location: `${asset.block} - Room ${asset.roomNumber}`,
    condition: asset.condition
  });
  let qrDataUrl = "";
  try {
    qrDataUrl = await import_qrcode.default.toDataURL(qrPayload, {
      width: 256,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });
  } catch (err) {
    console.error("Failed generating QR code:", err);
  }
  const pastComplaints = db.complaints.filter((c) => c.assetId === asset.id || c.assetName?.includes(asset.assetCode));
  res.json({
    asset: {
      ...asset,
      qrCodeUrl: qrDataUrl
    },
    pastComplaints
  });
});
router3.post("/", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const db = getDb();
    const {
      name,
      assetCode,
      category = "Electrical",
      block = "Block A",
      floor = 1,
      roomNumber,
      purchaseDate,
      purchaseCost = 0,
      condition = "GOOD",
      warrantyExpiryDate,
      nextMaintenanceDays = 90
    } = req.body;
    if (!name || !roomNumber) {
      res.status(400).json({ error: "Asset name and room number are required." });
      return;
    }
    const code = assetCode || `${name.substring(0, 3).toUpperCase()}-${block.replace(/\s+/g, "")}-${roomNumber}`;
    const now = /* @__PURE__ */ new Date();
    const nextMaintenance = new Date(now.getTime() + (nextMaintenanceDays || 90) * 86400 * 1e3).toISOString();
    const warranty = warrantyExpiryDate || new Date(now.getTime() + 365 * 86400 * 1e3).toISOString();
    const newAsset = {
      id: `ast-${Date.now()}`,
      name: name.trim(),
      assetCode: code.toUpperCase(),
      category,
      block,
      floor: Number(floor) || 1,
      roomNumber: roomNumber.trim(),
      condition,
      purchaseDate: purchaseDate || now.toISOString(),
      purchaseCost: Number(purchaseCost) || 0,
      totalRepairCost: 0,
      nextMaintenanceDate: nextMaintenance,
      warrantyExpiryDate: warranty,
      maintenanceHistoryCount: 0,
      status: "ACTIVE",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    db.assets.push(newAsset);
    createAuditLog({
      action: "ASSET_CREATED",
      performedBy: req.user.name,
      userRole: "ADMIN",
      entityType: "ASSET",
      entityId: newAsset.id,
      details: `Created asset ${newAsset.name} (${newAsset.assetCode}) in Room ${newAsset.roomNumber}.`
    });
    saveDb();
    res.status(201).json({
      message: "Asset registered successfully.",
      asset: newAsset
    });
  } catch (err) {
    console.error("Error creating asset:", err);
    res.status(500).json({ error: "Failed to register asset." });
  }
});
router3.put("/:id", authenticateToken, requireRole("ADMIN", "TECHNICIAN"), (req, res) => {
  const db = getDb();
  const asset = db.assets.find((a) => a.id === req.params.id);
  if (!asset) {
    res.status(404).json({ error: "Asset not found." });
    return;
  }
  const { condition, status, nextMaintenanceDate } = req.body;
  if (condition) asset.condition = condition;
  if (status) asset.status = status;
  if (nextMaintenanceDate) asset.nextMaintenanceDate = nextMaintenanceDate;
  asset.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  createAuditLog({
    action: "ASSET_UPDATED",
    performedBy: req.user.name,
    userRole: req.user.role,
    entityType: "ASSET",
    entityId: asset.id,
    details: `Updated asset condition=${asset.condition}, status=${asset.status}.`
  });
  saveDb();
  res.json({
    message: "Asset updated successfully.",
    asset
  });
});
var assetRoutes_default = router3;

// server/routes/dashboardRoutes.ts
var import_express4 = require("express");
var router4 = (0, import_express4.Router)();
router4.get("/student", authenticateToken, (req, res) => {
  const user = req.user;
  const db = getDb();
  const now = Date.now();
  const myComplaints = db.complaints.filter((c) => c.studentId === user.id);
  let openCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  for (const c of myComplaints) {
    if (c.status === "REPORTED" || c.status === "REVIEWED" || c.status === "ASSIGNED") {
      openCount++;
    } else if (c.status === "ACCEPTED" || c.status === "IN_PROGRESS") {
      inProgressCount++;
    } else if (c.status === "RESOLVED" || c.status === "CLOSED") {
      resolvedCount++;
    }
  }
  const notifications = db.notifications.filter((n) => n.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const health = calculateHostelHealthScore();
  res.json({
    metrics: {
      total: myComplaints.length,
      open: openCount,
      inProgress: inProgressCount,
      resolved: resolvedCount
    },
    recentComplaints: myComplaints.map((c) => ({
      ...c,
      isOverdue: c.status !== "RESOLVED" && c.status !== "CLOSED" && now > new Date(c.slaDeadline).getTime()
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    notifications,
    hostelHealth: {
      score: health.score,
      grade: health.grade
    }
  });
});
router4.get("/technician", authenticateToken, requireRole("TECHNICIAN", "ADMIN"), (req, res) => {
  const user = req.user;
  const db = getDb();
  const now = Date.now();
  const myTasks = user.role === "TECHNICIAN" ? db.complaints.filter((c) => c.assignedTechnicianId === user.id) : db.complaints.filter((c) => c.assignedTechnicianId);
  let criticalCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let totalResolutionTime = 0;
  let resolvedCount = 0;
  for (const t of myTasks) {
    if (t.status === "ASSIGNED" || t.status === "ACCEPTED") {
      pendingCount++;
    } else if (t.status === "IN_PROGRESS") {
      inProgressCount++;
    } else if (t.status === "RESOLVED" || t.status === "CLOSED") {
      completedCount++;
      if (t.resolvedAt) {
        const diff = (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / 36e5;
        if (diff > 0) {
          totalResolutionTime += diff;
          resolvedCount++;
        }
      }
    }
    if (t.priority === "CRITICAL" && t.status !== "RESOLVED" && t.status !== "CLOSED") {
      criticalCount++;
    }
  }
  const avgHours = resolvedCount > 0 ? Number((totalResolutionTime / resolvedCount).toFixed(1)) : 2.5;
  const urgentTasks = myTasks.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").map((t) => ({
    ...t,
    isOverdue: now > new Date(t.slaDeadline).getTime()
  })).sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
  });
  const myFeedbacks = db.feedbacks.filter((f) => f.technicianId === user.id);
  const avgRating = myFeedbacks.length > 0 ? Number((myFeedbacks.reduce((sum, f) => sum + f.rating, 0) / myFeedbacks.length).toFixed(1)) : 4.8;
  res.json({
    metrics: {
      totalAssigned: myTasks.length,
      critical: criticalCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
      averageResolutionHours: avgHours,
      averageRating: avgRating
    },
    tasks: urgentTasks,
    recentFeedbacks: myFeedbacks.slice(0, 5)
  });
});
router4.get("/admin", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const now = Date.now();
  const health = calculateHostelHealthScore();
  const recurringIssues = detectRecurringIssues();
  const technicians = db.users.filter((u) => u.role === "TECHNICIAN");
  const technicianLeaderboard = technicians.map((tech) => {
    const assignedComplaints = db.complaints.filter((c) => c.assignedTechnicianId === tech.id);
    const resolvedComplaints = assignedComplaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
    const openWorkload = assignedComplaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;
    let totalHours = 0;
    let countedResolved = 0;
    for (const r of resolvedComplaints) {
      if (r.resolvedAt) {
        const diff = (new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime()) / 36e5;
        if (diff > 0) {
          totalHours += diff;
          countedResolved++;
        }
      }
    }
    const feedbacks = db.feedbacks.filter((f) => f.technicianId === tech.id);
    const avgRating = feedbacks.length > 0 ? Number((feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)) : 4.8;
    const slaCompliantCount = resolvedComplaints.filter((c) => !c.isOverdue).length;
    const slaComplianceRate = resolvedComplaints.length > 0 ? Math.round(slaCompliantCount / resolvedComplaints.length * 100) : 100;
    return {
      id: tech.id,
      name: tech.name,
      specialty: tech.specialty || "General",
      phone: tech.phone,
      totalAssigned: assignedComplaints.length,
      totalResolved: resolvedComplaints.length,
      openWorkload,
      avgResolutionHours: countedResolved > 0 ? Number((totalHours / countedResolved).toFixed(1)) : 2.5,
      avgRating,
      slaComplianceRate
    };
  });
  const overdueComplaints = db.complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED" && now > new Date(c.slaDeadline).getTime()).map((c) => ({
    ...c,
    isOverdue: true,
    overdueHours: Number(((now - new Date(c.slaDeadline).getTime()) / 36e5).toFixed(1))
  }));
  res.json({
    healthScore: health,
    metrics: {
      totalUsers: db.users.length,
      totalComplaints: db.complaints.length,
      openCount: health.metrics.openCount,
      inProgressCount: health.metrics.inProgressCount,
      resolvedCount: health.metrics.resolvedCount,
      overdueCount: overdueComplaints.length,
      totalMaintenanceCost: health.metrics.totalMaintenanceCost,
      assetCount: db.assets.length,
      avgResolutionHours: health.metrics.avgResolutionHours,
      avgRating: health.metrics.avgRating
    },
    recurringIssues,
    overdueComplaints,
    technicianLeaderboard,
    recentAuditLogs: db.auditLogs.slice(0, 8)
  });
});
var dashboardRoutes_default = router4;

// server/routes/analyticsRoutes.ts
var import_express5 = require("express");
var router5 = (0, import_express5.Router)();
router5.get("/health-score", authenticateToken, (req, res) => {
  const result = calculateHostelHealthScore();
  res.json(result);
});
router5.get("/recurring-problems", authenticateToken, (req, res) => {
  const recurring = detectRecurringIssues();
  res.json({ count: recurring.length, recurringIssues: recurring });
});
router5.get("/", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const costByCategory = {};
  const countByCategory = {};
  const costByBlock = {};
  const countByBlock = {};
  let totalCost = 0;
  for (const c of db.complaints) {
    const cost = c.totalRepairCost || 0;
    totalCost += cost;
    costByCategory[c.category] = (costByCategory[c.category] || 0) + cost;
    countByCategory[c.category] = (countByCategory[c.category] || 0) + 1;
    costByBlock[c.block] = (costByBlock[c.block] || 0) + cost;
    countByBlock[c.block] = (countByBlock[c.block] || 0) + 1;
  }
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const monthlySpending = [
    { month: "Apr", cost: 1200, complaints: 8 },
    { month: "May", cost: 1850, complaints: 11 },
    { month: "Jun", cost: 950, complaints: 6 },
    { month: "Jul", cost: 2300, complaints: 14 },
    { month: "Aug", cost: 1600, complaints: 9 },
    { month: "Sep", cost: totalCost || 1350, complaints: db.complaints.length }
  ];
  const insights = [];
  let maxBlock = "";
  let maxBlockCost = 0;
  for (const [b, c] of Object.entries(costByBlock)) {
    if (c > maxBlockCost) {
      maxBlockCost = c;
      maxBlock = b;
    }
  }
  if (totalCost > 0 && maxBlock) {
    const pct = Math.round(maxBlockCost / totalCost * 100);
    insights.push(`${maxBlock} consumed ${pct}% of total maintenance expenditure.`);
  }
  let maxCat = "";
  let maxCatCount = 0;
  for (const [cat, cnt] of Object.entries(countByCategory)) {
    if (cnt > maxCatCount) {
      maxCatCount = cnt;
      maxCat = cat;
    }
  }
  if (maxCat) {
    insights.push(`${maxCat} is the primary failure source with ${maxCatCount} complaints logged.`);
  }
  const recurring = detectRecurringIssues();
  if (recurring.length > 0) {
    insights.push(`${recurring.length} recurring failure cluster(s) detected across rooms, indicating component fatigue.`);
  } else {
    insights.push("No critical recurring failure clusters detected across hostel blocks this month.");
  }
  res.json({
    totalCost,
    costByCategory,
    countByCategory,
    costByBlock,
    countByBlock,
    monthlySpending,
    insights
  });
});
router5.get("/heatmap", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const blocks = ["Block A", "Block B", "Block C", "Block D"];
  const categories = [
    "Electrical",
    "Plumbing",
    "Water",
    "Internet",
    "Furniture",
    "Cleaning",
    "Bathroom",
    "Room",
    "Safety"
  ];
  const matrix = {};
  for (const b of blocks) {
    matrix[b] = {};
    for (const cat of categories) {
      matrix[b][cat] = 0;
    }
  }
  for (const c of db.complaints) {
    const b = blocks.find((blk) => c.block.toLowerCase().includes(blk.toLowerCase())) || "Block A";
    if (!matrix[b]) matrix[b] = {};
    matrix[b][c.category] = (matrix[b][c.category] || 0) + 1;
  }
  res.json({
    blocks,
    categories,
    matrix
  });
});
var analyticsRoutes_default = router5;

// server/routes/notificationRoutes.ts
var import_express6 = require("express");
var router6 = (0, import_express6.Router)();
router6.get("/", authenticateToken, (req, res) => {
  const user = req.user;
  const db = getDb();
  const userNotifs = db.notifications.filter((n) => n.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;
  res.json({
    unreadCount,
    notifications: userNotifs
  });
});
router6.put("/:id/read", authenticateToken, (req, res) => {
  const user = req.user;
  const db = getDb();
  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === user.id);
  if (!notif) {
    res.status(404).json({ error: "Notification not found." });
    return;
  }
  notif.isRead = true;
  saveDb();
  res.json({ message: "Marked as read.", notification: notif });
});
router6.put("/read-all", authenticateToken, (req, res) => {
  const user = req.user;
  const db = getDb();
  for (const n of db.notifications) {
    if (n.userId === user.id) {
      n.isRead = true;
    }
  }
  saveDb();
  res.json({ message: "All notifications marked as read." });
});
var notificationRoutes_default = router6;

// server/routes/auditRoutes.ts
var import_express7 = require("express");
var router7 = (0, import_express7.Router)();
router7.get("/", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const { entityType, action, search } = req.query;
  let logs = db.auditLogs;
  if (entityType) {
    logs = logs.filter((l) => l.entityType.toLowerCase() === entityType.toLowerCase());
  }
  if (action) {
    logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) => l.performedBy.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.action.toLowerCase().includes(q)
    );
  }
  res.json({
    total: logs.length,
    logs: logs.slice(0, 100)
  });
});
var auditRoutes_default = router7;

// server/routes/preventiveRoutes.ts
var import_express8 = require("express");
var router8 = (0, import_express8.Router)();
router8.get("/", authenticateToken, requireRole("ADMIN", "TECHNICIAN"), (req, res) => {
  const db = getDb();
  res.json({
    schedules: db.preventiveSchedules
  });
});
router8.post("/", authenticateToken, requireRole("ADMIN"), (req, res) => {
  try {
    const db = getDb();
    const {
      title,
      description,
      targetCategory = "Electrical",
      targetBlock = "Block B",
      suggestedAction,
      frequencyDays = 60,
      nextScheduledDate
    } = req.body;
    if (!title || !suggestedAction) {
      res.status(400).json({ error: "Title and suggested action are required." });
      return;
    }
    const now = /* @__PURE__ */ new Date();
    const scheduled = nextScheduledDate || new Date(now.getTime() + (frequencyDays || 30) * 86400 * 1e3).toISOString();
    const newSchedule = {
      id: `pm-${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : `Scheduled check for ${targetCategory} in ${targetBlock}`,
      targetCategory,
      targetBlock,
      suggestedAction: suggestedAction.trim(),
      frequencyDays: Number(frequencyDays) || 60,
      nextScheduledDate: scheduled,
      status: "SCHEDULED",
      createdReason: "MANUAL",
      createdAt: now.toISOString()
    };
    db.preventiveSchedules.push(newSchedule);
    createAuditLog({
      action: "PREVENTIVE_SCHEDULE_CREATED",
      performedBy: req.user.name,
      userRole: "ADMIN",
      entityType: "MAINTENANCE",
      entityId: newSchedule.id,
      details: `Created preventive schedule: "${newSchedule.title}" for ${targetBlock}.`
    });
    saveDb();
    res.status(201).json({
      message: "Preventive maintenance schedule created.",
      schedule: newSchedule
    });
  } catch (err) {
    console.error("Error creating preventive schedule:", err);
    res.status(500).json({ error: "Failed to create preventive maintenance schedule." });
  }
});
router8.put("/:id/status", authenticateToken, requireRole("ADMIN", "TECHNICIAN"), (req, res) => {
  const db = getDb();
  const schedule = db.preventiveSchedules.find((s) => s.id === req.params.id);
  if (!schedule) {
    res.status(404).json({ error: "Schedule not found." });
    return;
  }
  const { status } = req.body;
  const valid = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (!valid.includes(status)) {
    res.status(400).json({ error: `Invalid status. Allowed: [${valid.join(", ")}]` });
    return;
  }
  schedule.status = status;
  if (status === "COMPLETED") {
    const now = /* @__PURE__ */ new Date();
    schedule.lastRunDate = now.toISOString();
    schedule.nextScheduledDate = new Date(now.getTime() + schedule.frequencyDays * 86400 * 1e3).toISOString();
  }
  createAuditLog({
    action: "PREVENTIVE_STATUS_UPDATED",
    performedBy: req.user.name,
    userRole: req.user.role,
    entityType: "MAINTENANCE",
    entityId: schedule.id,
    details: `Updated preventive schedule ${schedule.id} status to ${status}.`
  });
  saveDb();
  res.json({
    message: `Schedule status updated to ${status}.`,
    schedule
  });
});
var preventiveRoutes_default = router8;

// server.ts
var import_meta = {};
var currentFilename = typeof __filename !== "undefined" ? __filename : typeof import_meta !== "undefined" && import_meta.url ? (0, import_url.fileURLToPath)(import_meta.url) : process.cwd();
var currentDirname = typeof __dirname !== "undefined" ? __dirname : import_path2.default.dirname(currentFilename);
var uploadDir = import_path2.default.join(process.cwd(), "public", "uploads");
if (!import_fs2.default.existsSync(uploadDir)) {
  import_fs2.default.mkdirSync(uploadDir, { recursive: true });
}
var storage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = import_path2.default.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  }
});
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(import_path2.default.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WEBP, GIF) under 5MB are allowed."));
    }
  }
});
async function startServer() {
  const app = (0, import_express9.default)();
  const PORT = 3e3;
  app.use(import_express9.default.json({ limit: "10mb" }));
  app.use(import_express9.default.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/uploads", import_express9.default.static(uploadDir));
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      app: "HOSTELASSIST",
      version: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: "File uploaded successfully.",
      url: publicUrl,
      fileName: req.file.filename,
      size: req.file.size
    });
  });
  app.use("/api/auth", authRoutes_default);
  app.use("/api/users", authRoutes_default);
  app.use("/api/complaints", complaintRoutes_default);
  app.use("/api/assets", assetRoutes_default);
  app.use("/api/dashboard", dashboardRoutes_default);
  app.use("/api/analytics", analyticsRoutes_default);
  app.use("/api/notifications", notificationRoutes_default);
  app.use("/api/audit-logs", auditRoutes_default);
  app.use("/api/preventive-maintenance", preventiveRoutes_default);
  app.use((err, _req, res, next) => {
    if (err instanceof import_multer.default.MulterError) {
      res.status(400).json({ error: `Upload error: ${err.message}` });
      return;
    }
    if (err) {
      console.error("Unhandled API Error:", err);
      res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
      return;
    }
    next();
  });
  const distPath = import_path2.default.join(process.cwd(), "dist");
  const distIndex = import_path2.default.join(distPath, "index.html");
  if (import_fs2.default.existsSync(distIndex)) {
    app.use(import_express9.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
======================================================`);
    console.log(` HOSTELASSIST Operations & Predictive Maintenance`);
    console.log(` Server active on: http://localhost:${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`======================================================
`);
  });
}
startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
