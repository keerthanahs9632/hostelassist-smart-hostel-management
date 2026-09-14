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
import { ComplaintCategory } from '../types.js';

const router = Router();

// GET /api/health-score
router.get('/health-score', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const result = calculateHostelHealthScore();
  res.json(result);
});

// GET /api/recurring-problems
router.get('/recurring-problems', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const recurring = detectRecurringIssues();
  res.json({ count: recurring.length, recurringIssues: recurring });
});

// GET /api/analytics (Cost & Trends)
router.get('/', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();

  // Cost by category
  const costByCategory: Record<string, number> = {};
  const countByCategory: Record<string, number> = {};

  // Cost by block
  const costByBlock: Record<string, number> = {};
  const countByBlock: Record<string, number> = {};

  let totalCost = 0;

  for (const c of db.complaints) {
    const cost = c.totalRepairCost || 0;
    totalCost += cost;

    costByCategory[c.category] = (costByCategory[c.category] || 0) + cost;
    countByCategory[c.category] = (countByCategory[c.category] || 0) + 1;

    costByBlock[c.block] = (costByBlock[c.block] || 0) + cost;
    countByBlock[c.block] = (countByBlock[c.block] || 0) + 1;
  }

  // Monthly trends (last 6 months synthetic/actual)
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthlySpending = [
    { month: 'Apr', cost: 1200, complaints: 8 },
    { month: 'May', cost: 1850, complaints: 11 },
    { month: 'Jun', cost: 950, complaints: 6 },
    { month: 'Jul', cost: 2300, complaints: 14 },
    { month: 'Aug', cost: 1600, complaints: 9 },
    { month: 'Sep', cost: totalCost || 1350, complaints: db.complaints.length },
  ];

  // Derive automated intelligent insights
  const insights: string[] = [];

  // Top spending block
  let maxBlock = '';
  let maxBlockCost = 0;
  for (const [b, c] of Object.entries(costByBlock)) {
    if (c > maxBlockCost) {
      maxBlockCost = c;
      maxBlock = b;
    }
  }

  if (totalCost > 0 && maxBlock) {
    const pct = Math.round((maxBlockCost / totalCost) * 100);
    insights.push(`${maxBlock} consumed ${pct}% of total maintenance expenditure.`);
  }

  // Top category
  let maxCat = '';
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
    insights.push('No critical recurring failure clusters detected across hostel blocks this month.');
  }

  res.json({
    totalCost,
    costByCategory,
    countByCategory,
    costByBlock,
    countByBlock,
    monthlySpending,
    insights,
  });
});

// GET /api/analytics/heatmap (Matrix: Block vs Category / Floor)
router.get('/heatmap', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const blocks = ['Block A', 'Block B', 'Block C', 'Block D'];
  const categories: ComplaintCategory[] = [
    'Electrical',
    'Plumbing',
    'Water',
    'Internet',
    'Furniture',
    'Cleaning',
    'Bathroom',
    'Room',
    'Safety',
  ];

  const matrix: Record<string, Record<string, number>> = {};

  for (const b of blocks) {
    matrix[b] = {};
    for (const cat of categories) {
      matrix[b][cat] = 0;
    }
  }

  for (const c of db.complaints) {
    const b = blocks.find((blk) => c.block.toLowerCase().includes(blk.toLowerCase())) || 'Block A';
    if (!matrix[b]) matrix[b] = {};
    matrix[b][c.category] = (matrix[b][c.category] || 0) + 1;
  }

  res.json({
    blocks,
    categories,
    matrix,
  });
});

export default router;
