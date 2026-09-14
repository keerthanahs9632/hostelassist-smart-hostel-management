import { Router, Response } from 'express';
import {
  getDb,
  saveDb,
  createAuditLog,
  createNotification,
  findUserById,
} from '../db.js';
import {
  authenticateToken,
  AuthenticatedRequest,
  requireRole,
} from '../auth.js';
import {
  Complaint,
  ComplaintHistoryItem,
  ComplaintStatus,
  PriorityLevel,
  ComplaintCategory,
  Feedback,
} from '../types.js';
import { analyzeComplaintWithAi } from '../gemini.js';

const router = Router();

function calculateSlaDeadline(createdAt: string, priority: PriorityLevel): string {
  const created = new Date(createdAt).getTime();
  let hours = 24;
  if (priority === 'CRITICAL') hours = 2;
  else if (priority === 'HIGH') hours = 6;
  else if (priority === 'MEDIUM') hours = 24;
  else if (priority === 'LOW') hours = 72;

  return new Date(created + hours * 3600 * 1000).toISOString();
}

// POST /api/complaints/analyze (Pre-submission AI classification & priority recommendation)
router.post('/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, roomNumber, block } = req.body;
    if (!title && !description) {
      res.status(400).json({ error: 'Title or description required for AI analysis.' });
      return;
    }

    const analysis = await analyzeComplaintWithAi(title || '', description || '', roomNumber, block);
    res.json({ analysis });
  } catch (err: any) {
    console.error('AI Analysis API error:', err);
    res.status(500).json({ error: 'Failed to analyze complaint.' });
  }
});

// POST /api/complaints (Report a new problem)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      title,
      description,
      category = 'Other',
      priority = 'MEDIUM',
      roomNumber,
      block,
      imageUrl,
      assetId,
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }

    const room = roomNumber || user.roomNumber || 'Common Area';
    const b = block || user.block || 'Block A';

    // Perform AI analysis if not provided
    const aiAnalysis = await analyzeComplaintWithAi(title, description, room, b);

    // Final priority: user selected or AI suggested if user picked default
    const finalCategory: ComplaintCategory = category || aiAnalysis.category;
    const finalPriority: PriorityLevel = priority || aiAnalysis.suggestedPriority;

    const db = getDb();
    const now = new Date().toISOString();
    const id = `cmp-${Date.now()}`;
    const nextTicketNum = `CMP-${new Date().getFullYear()}-${1000 + db.complaints.length + 1}`;

    let matchedAssetName: string | undefined;
    if (assetId) {
      const matchedAsset = db.assets.find((a) => a.id === assetId || a.assetCode === assetId);
      if (matchedAsset) {
        matchedAssetName = `${matchedAsset.name} (${matchedAsset.assetCode})`;
        matchedAsset.condition = finalPriority === 'CRITICAL' ? 'CRITICAL' : 'NEEDS_ATTENTION';
      }
    }

    const newComplaint: Complaint = {
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
      status: 'REPORTED',
      imageUrl: imageUrl || undefined,
      assetId,
      assetName: matchedAssetName,
      aiAnalysis,
      slaDeadline: calculateSlaDeadline(now, finalPriority),
      isOverdue: false,
      createdAt: now,
      updatedAt: now,
    };

    db.complaints.unshift(newComplaint);

    // Initial history event
    const historyItem: ComplaintHistoryItem = {
      id: `h-${Date.now()}`,
      complaintId: id,
      action: 'COMPLAINT_REPORTED',
      toStatus: 'REPORTED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      notes: `Reported by ${user.name}. AI evaluated as ${aiAnalysis.suggestedPriority} priority (${aiAnalysis.category}).`,
      timestamp: now,
    };
    db.complaintHistory.push(historyItem);

    // Notify admins
    const admins = db.users.filter((u) => u.role === 'ADMIN');
    for (const admin of admins) {
      createNotification({
        userId: admin.id,
        title: `New ${finalPriority} Complaint: ${nextTicketNum}`,
        message: `${user.name} reported: "${title}" in Room ${room} (${b}).`,
        type: finalPriority === 'CRITICAL' ? 'SLA_BREACH' : 'INFO',
        complaintId: id,
      });
    }

    createAuditLog({
      action: 'COMPLAINT_CREATED',
      performedBy: user.name,
      userRole: user.role,
      entityType: 'COMPLAINT',
      entityId: id,
      details: `Created ticket ${nextTicketNum} in Room ${room} (${finalPriority} - ${finalCategory}).`,
    });

    saveDb();

    res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaint: newComplaint,
    });
  } catch (err: any) {
    console.error('Create complaint error:', err);
    res.status(500).json({ error: 'Failed to create complaint.' });
  }
});

// GET /api/complaints (Search & Filter)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const {
    status,
    category,
    priority,
    block,
    room,
    search,
    technicianId,
    studentId,
  } = req.query as Record<string, string>;

  const now = Date.now();
  let results = db.complaints.map((c) => {
    // Dynamically evaluate overdue status
    const isClosedOrResolved = c.status === 'RESOLVED' || c.status === 'CLOSED';
    const deadline = new Date(c.slaDeadline).getTime();
    return {
      ...c,
      isOverdue: !isClosedOrResolved && now > deadline,
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
      (c) =>
        c.ticketNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.roomNumber.toLowerCase().includes(q) ||
        c.block.toLowerCase().includes(q) ||
        (c.assignedTechnicianName && c.assignedTechnicianName.toLowerCase().includes(q))
    );
  }

  res.json({
    total: results.length,
    complaints: results,
  });
});

// GET /api/complaints/student (Student's own complaints)
router.get('/student', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const db = getDb();
  const now = Date.now();

  const userComplaints = db.complaints
    .filter((c) => c.studentId === user.id)
    .map((c) => ({
      ...c,
      isOverdue: c.status !== 'RESOLVED' && c.status !== 'CLOSED' && now > new Date(c.slaDeadline).getTime(),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ complaints: userComplaints });
});

// GET /api/complaints/technician (Technician's assigned complaints)
router.get('/technician', authenticateToken, requireRole('TECHNICIAN', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const db = getDb();
  const now = Date.now();

  let techComplaints = db.complaints;
  if (user.role === 'TECHNICIAN') {
    techComplaints = techComplaints.filter((c) => c.assignedTechnicianId === user.id);
  }

  const mapped = techComplaints
    .map((c) => ({
      ...c,
      isOverdue: c.status !== 'RESOLVED' && c.status !== 'CLOSED' && now > new Date(c.slaDeadline).getTime(),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ complaints: mapped });
});

// GET /api/complaints/:id (Full details with timeline & feedback)
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === req.params.id || c.ticketNumber === req.params.id);

  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  const history = db.complaintHistory
    .filter((h) => h.complaintId === complaint.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const feedback = db.feedbacks.find((f) => f.complaintId === complaint.id);

  res.json({
    complaint,
    history,
    feedback,
  });
});

// POST /api/complaints/:id/assign (Admin assigns technician)
router.post('/:id/assign', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const { technicianId } = req.body;

  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  const technician = findUserById(technicianId);
  if (!technician || technician.role !== 'TECHNICIAN') {
    res.status(400).json({ error: 'Valid technician ID required.' });
    return;
  }

  const previousStatus = complaint.status;
  complaint.assignedTechnicianId = technician.id;
  complaint.assignedTechnicianName = technician.name;
  complaint.status = 'ASSIGNED';
  complaint.updatedAt = new Date().toISOString();

  // History entry
  db.complaintHistory.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    action: 'TECHNICIAN_ASSIGNED',
    fromStatus: previousStatus,
    toStatus: 'ASSIGNED',
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: 'ADMIN',
    notes: `Assigned to ${technician.name} (${technician.specialty || 'General'}).`,
    timestamp: new Date().toISOString(),
  });

  // Notify technician
  createNotification({
    userId: technician.id,
    title: `New Assignment: ${complaint.ticketNumber}`,
    message: `You have been assigned to: "${complaint.title}" in Room ${complaint.roomNumber} (${complaint.priority} priority).`,
    type: 'ASSIGNMENT',
    complaintId: complaint.id,
  });

  // Notify student
  createNotification({
    userId: complaint.studentId,
    title: `Technician Assigned`,
    message: `Technician ${technician.name} has been assigned to your complaint ${complaint.ticketNumber}.`,
    type: 'STATUS_CHANGE',
    complaintId: complaint.id,
  });

  createAuditLog({
    action: 'COMPLAINT_ASSIGNED',
    performedBy: req.user!.name,
    userRole: 'ADMIN',
    entityType: 'COMPLAINT',
    entityId: complaint.id,
    details: `Assigned ${complaint.ticketNumber} to ${technician.name}.`,
  });

  saveDb();

  res.json({
    message: 'Technician assigned successfully.',
    complaint,
  });
});

// POST /api/complaints/:id/status (Technician updates status: ACCEPTED, IN_PROGRESS, RESOLVED)
router.post('/:id/status', authenticateToken, requireRole('TECHNICIAN', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const { status, workNotes, repairCost, evidenceImageUrl } = req.body;

  const validStatuses: ComplaintStatus[] = ['ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Allowed: [${validStatuses.join(', ')}]` });
    return;
  }

  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  const previousStatus = complaint.status;
  const now = new Date().toISOString();

  complaint.status = status;
  complaint.updatedAt = now;

  if (workNotes) complaint.workNotes = workNotes;
  if (repairCost !== undefined) {
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

  if (status === 'RESOLVED') {
    complaint.resolvedAt = now;
  } else if (status === 'CLOSED') {
    complaint.closedAt = now;
  }

  // Record history
  db.complaintHistory.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    action: `STATUS_CHANGED_TO_${status}`,
    fromStatus: previousStatus,
    toStatus: status,
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: req.user!.role,
    notes: workNotes || `Status advanced to ${status}.`,
    repairCost: repairCost !== undefined ? Number(repairCost) : undefined,
    evidenceImageUrl: evidenceImageUrl || undefined,
    timestamp: now,
  });

  // Notify student
  let notifMsg = `Complaint ${complaint.ticketNumber} updated to ${status}.`;
  if (status === 'ACCEPTED') notifMsg = `Technician has accepted your ticket ${complaint.ticketNumber} and scheduled repair.`;
  if (status === 'IN_PROGRESS') notifMsg = `Work has begun on your ticket ${complaint.ticketNumber}.`;
  if (status === 'RESOLVED') notifMsg = `Your complaint ${complaint.ticketNumber} is marked RESOLVED. Please verify and leave feedback.`;

  createNotification({
    userId: complaint.studentId,
    title: `Complaint Status: ${status}`,
    message: notifMsg,
    type: status === 'RESOLVED' ? 'FEEDBACK_REQUEST' : 'STATUS_CHANGE',
    complaintId: complaint.id,
  });

  createAuditLog({
    action: 'STATUS_UPDATED',
    performedBy: req.user!.name,
    userRole: req.user!.role,
    entityType: 'COMPLAINT',
    entityId: complaint.id,
    details: `Changed ${complaint.ticketNumber} status from ${previousStatus} to ${status}. Notes: ${workNotes || 'none'}.`,
  });

  saveDb();

  res.json({
    message: `Status updated to ${status}.`,
    complaint,
  });
});

// POST /api/complaints/:id/verify (Student verifies resolution)
router.post('/:id/verify', authenticateToken, requireRole('STUDENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const complaint = db.complaints.find((c) => c.id === req.params.id);

  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  const now = new Date().toISOString();
  complaint.status = 'CLOSED';
  complaint.closedAt = now;
  complaint.updatedAt = now;

  db.complaintHistory.push({
    id: `h-${Date.now()}`,
    complaintId: complaint.id,
    action: 'VERIFIED_AND_CLOSED',
    fromStatus: 'RESOLVED',
    toStatus: 'CLOSED',
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: req.user!.role,
    notes: 'Resolution verified by student. Ticket officially closed.',
    timestamp: now,
  });

  createAuditLog({
    action: 'COMPLAINT_CLOSED',
    performedBy: req.user!.name,
    userRole: req.user!.role,
    entityType: 'COMPLAINT',
    entityId: complaint.id,
    details: `Ticket ${complaint.ticketNumber} verified and closed.`,
  });

  saveDb();

  res.json({
    message: 'Complaint verified and closed.',
    complaint,
  });
});

// POST /api/complaints/:id/feedback (Student submits rating and review)
router.post('/:id/feedback', authenticateToken, requireRole('STUDENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const { rating, comment } = req.body;

  const complaint = db.complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    return;
  }

  const existingFeedbackIndex = db.feedbacks.findIndex((f) => f.complaintId === complaint.id);
  const now = new Date().toISOString();

  const feedbackItem: Feedback = {
    id: `fb-${Date.now()}`,
    complaintId: complaint.id,
    studentId: req.user!.id,
    studentName: req.user!.name,
    technicianId: complaint.assignedTechnicianId,
    rating: numericRating,
    comment: comment ? comment.trim() : 'Satisfied with resolution.',
    timelinessScore: complaint.isOverdue ? 2 : 5,
    createdAt: now,
  };

  if (existingFeedbackIndex >= 0) {
    db.feedbacks[existingFeedbackIndex] = feedbackItem;
  } else {
    db.feedbacks.push(feedbackItem);
  }

  // Notify technician of positive/constructive feedback
  if (complaint.assignedTechnicianId) {
    createNotification({
      userId: complaint.assignedTechnicianId,
      title: `Student Feedback: ${numericRating} Stars`,
      message: `${req.user!.name} rated your work on ${complaint.ticketNumber}: "${feedbackItem.comment}"`,
      type: 'INFO',
      complaintId: complaint.id,
    });
  }

  createAuditLog({
    action: 'FEEDBACK_SUBMITTED',
    performedBy: req.user!.name,
    userRole: req.user!.role,
    entityType: 'COMPLAINT',
    entityId: complaint.id,
    details: `Rated ${numericRating}/5 stars for ticket ${complaint.ticketNumber}.`,
  });

  saveDb();

  res.status(201).json({
    message: 'Feedback submitted successfully.',
    feedback: feedbackItem,
  });
});

export default router;
