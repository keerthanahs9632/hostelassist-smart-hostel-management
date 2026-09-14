import { Router, Response } from 'express';
import { getDb, saveDb, createAuditLog } from '../db.js';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.js';
import { PreventiveMaintenanceSchedule, ComplaintCategory } from '../types.js';

const router = Router();

// GET /api/preventive-maintenance
router.get('/', authenticateToken, requireRole('ADMIN', 'TECHNICIAN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  res.json({
    schedules: db.preventiveSchedules,
  });
});

// POST /api/preventive-maintenance (Admin creates schedule)
router.post('/', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const db = getDb();
    const {
      title,
      description,
      targetCategory = 'Electrical',
      targetBlock = 'Block B',
      suggestedAction,
      frequencyDays = 60,
      nextScheduledDate,
    } = req.body;

    if (!title || !suggestedAction) {
      res.status(400).json({ error: 'Title and suggested action are required.' });
      return;
    }

    const now = new Date();
    const scheduled = nextScheduledDate || new Date(now.getTime() + (frequencyDays || 30) * 86400 * 1000).toISOString();

    const newSchedule: PreventiveMaintenanceSchedule = {
      id: `pm-${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : `Scheduled check for ${targetCategory} in ${targetBlock}`,
      targetCategory: targetCategory as ComplaintCategory,
      targetBlock,
      suggestedAction: suggestedAction.trim(),
      frequencyDays: Number(frequencyDays) || 60,
      nextScheduledDate: scheduled,
      status: 'SCHEDULED',
      createdReason: 'MANUAL',
      createdAt: now.toISOString(),
    };

    db.preventiveSchedules.push(newSchedule);

    createAuditLog({
      action: 'PREVENTIVE_SCHEDULE_CREATED',
      performedBy: req.user!.name,
      userRole: 'ADMIN',
      entityType: 'MAINTENANCE',
      entityId: newSchedule.id,
      details: `Created preventive schedule: "${newSchedule.title}" for ${targetBlock}.`,
    });

    saveDb();

    res.status(201).json({
      message: 'Preventive maintenance schedule created.',
      schedule: newSchedule,
    });
  } catch (err: any) {
    console.error('Error creating preventive schedule:', err);
    res.status(500).json({ error: 'Failed to create preventive maintenance schedule.' });
  }
});

// PUT /api/preventive-maintenance/:id/status
router.put('/:id/status', authenticateToken, requireRole('ADMIN', 'TECHNICIAN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const schedule = db.preventiveSchedules.find((s) => s.id === req.params.id);

  if (!schedule) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  const { status } = req.body;
  const valid = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!valid.includes(status)) {
    res.status(400).json({ error: `Invalid status. Allowed: [${valid.join(', ')}]` });
    return;
  }

  schedule.status = status;
  if (status === 'COMPLETED') {
    const now = new Date();
    schedule.lastRunDate = now.toISOString();
    schedule.nextScheduledDate = new Date(now.getTime() + schedule.frequencyDays * 86400 * 1000).toISOString();
  }

  createAuditLog({
    action: 'PREVENTIVE_STATUS_UPDATED',
    performedBy: req.user!.name,
    userRole: req.user!.role,
    entityType: 'MAINTENANCE',
    entityId: schedule.id,
    details: `Updated preventive schedule ${schedule.id} status to ${status}.`,
  });

  saveDb();

  res.json({
    message: `Schedule status updated to ${status}.`,
    schedule,
  });
});

export default router;
