import { Router, Response } from 'express';
import {
  getDb,
  calculateHostelHealthScore,
  detectRecurringIssues,
} from '../db.js';
import {
  authenticateToken,
  AuthenticatedRequest,
  requireRole,
} from '../auth.js';

const router = Router();

// GET /api/dashboard/student
router.get('/student', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const db = getDb();
  const now = Date.now();

  const myComplaints = db.complaints.filter((c) => c.studentId === user.id);

  let openCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;

  for (const c of myComplaints) {
    if (c.status === 'REPORTED' || c.status === 'REVIEWED' || c.status === 'ASSIGNED') {
      openCount++;
    } else if (c.status === 'ACCEPTED' || c.status === 'IN_PROGRESS') {
      inProgressCount++;
    } else if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
      resolvedCount++;
    }
  }

  const notifications = db.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const health = calculateHostelHealthScore();

  res.json({
    metrics: {
      total: myComplaints.length,
      open: openCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    },
    recentComplaints: myComplaints
      .map((c) => ({
        ...c,
        isOverdue: c.status !== 'RESOLVED' && c.status !== 'CLOSED' && now > new Date(c.slaDeadline).getTime(),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    notifications,
    hostelHealth: {
      score: health.score,
      grade: health.grade,
    },
  });
});

// GET /api/dashboard/technician
router.get('/technician', authenticateToken, requireRole('TECHNICIAN', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const db = getDb();
  const now = Date.now();

  const myTasks = user.role === 'TECHNICIAN'
    ? db.complaints.filter((c) => c.assignedTechnicianId === user.id)
    : db.complaints.filter((c) => c.assignedTechnicianId);

  let criticalCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let totalResolutionTime = 0;
  let resolvedCount = 0;

  for (const t of myTasks) {
    if (t.status === 'ASSIGNED' || t.status === 'ACCEPTED') {
      pendingCount++;
    } else if (t.status === 'IN_PROGRESS') {
      inProgressCount++;
    } else if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
      completedCount++;
      if (t.resolvedAt) {
        const diff = (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / 3600000;
        if (diff > 0) {
          totalResolutionTime += diff;
          resolvedCount++;
        }
      }
    }

    if (t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED') {
      criticalCount++;
    }
  }

  const avgHours = resolvedCount > 0 ? Number((totalResolutionTime / resolvedCount).toFixed(1)) : 2.5;

  const urgentTasks = myTasks
    .filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED')
    .map((t) => ({
      ...t,
      isOverdue: now > new Date(t.slaDeadline).getTime(),
    }))
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
    });

  const myFeedbacks = db.feedbacks.filter((f) => f.technicianId === user.id);
  const avgRating = myFeedbacks.length > 0
    ? Number((myFeedbacks.reduce((sum, f) => sum + f.rating, 0) / myFeedbacks.length).toFixed(1))
    : 4.8;

  res.json({
    metrics: {
      totalAssigned: myTasks.length,
      critical: criticalCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
      averageResolutionHours: avgHours,
      averageRating: avgRating,
    },
    tasks: urgentTasks,
    recentFeedbacks: myFeedbacks.slice(0, 5),
  });
});

// GET /api/dashboard/admin
router.get('/admin', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const now = Date.now();
  const health = calculateHostelHealthScore();
  const recurringIssues = detectRecurringIssues();

  // Technician performance calculation
  const technicians = db.users.filter((u) => u.role === 'TECHNICIAN');
  const technicianLeaderboard = technicians.map((tech) => {
    const assignedComplaints = db.complaints.filter((c) => c.assignedTechnicianId === tech.id);
    const resolvedComplaints = assignedComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');
    const openWorkload = assignedComplaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;

    let totalHours = 0;
    let countedResolved = 0;
    for (const r of resolvedComplaints) {
      if (r.resolvedAt) {
        const diff = (new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime()) / 3600000;
        if (diff > 0) {
          totalHours += diff;
          countedResolved++;
        }
      }
    }

    const feedbacks = db.feedbacks.filter((f) => f.technicianId === tech.id);
    const avgRating = feedbacks.length > 0
      ? Number((feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1))
      : 4.8;

    // SLA compliance
    const slaCompliantCount = resolvedComplaints.filter((c) => !c.isOverdue).length;
    const slaComplianceRate = resolvedComplaints.length > 0
      ? Math.round((slaCompliantCount / resolvedComplaints.length) * 100)
      : 100;

    return {
      id: tech.id,
      name: tech.name,
      specialty: tech.specialty || 'General',
      phone: tech.phone,
      totalAssigned: assignedComplaints.length,
      totalResolved: resolvedComplaints.length,
      openWorkload,
      avgResolutionHours: countedResolved > 0 ? Number((totalHours / countedResolved).toFixed(1)) : 2.5,
      avgRating,
      slaComplianceRate,
    };
  });

  // Recent SLA Escalations
  const overdueComplaints = db.complaints
    .filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && now > new Date(c.slaDeadline).getTime())
    .map((c) => ({
      ...c,
      isOverdue: true,
      overdueHours: Number(((now - new Date(c.slaDeadline).getTime()) / 3600000).toFixed(1)),
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
      avgRating: health.metrics.avgRating,
    },
    recurringIssues,
    overdueComplaints,
    technicianLeaderboard,
    recentAuditLogs: db.auditLogs.slice(0, 8),
  });
});

export default router;
