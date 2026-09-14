import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/audit-logs (Admin only)
router.get('/', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const { entityType, action, search } = req.query as Record<string, string>;

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
      (l) =>
        l.performedBy.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
    );
  }

  res.json({
    total: logs.length,
    logs: logs.slice(0, 100),
  });
});

export default router;
