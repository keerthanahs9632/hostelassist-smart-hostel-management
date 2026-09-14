import { Router, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const db = getDb();

  const userNotifs = db.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  res.json({
    unreadCount,
    notifications: userNotifs,
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const db = getDb();

  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === user.id);
  if (!notif) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  notif.isRead = true;
  saveDb();

  res.json({ message: 'Marked as read.', notification: notif });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const db = getDb();

  for (const n of db.notifications) {
    if (n.userId === user.id) {
      n.isRead = true;
    }
  }
  saveDb();

  res.json({ message: 'All notifications marked as read.' });
});

export default router;
