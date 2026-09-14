import { Router, Response } from 'express';
import QRCode from 'qrcode';
import { getDb, saveDb, createAuditLog } from '../db.js';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../auth.js';
import { Asset, AssetCondition, ComplaintCategory } from '../types.js';

const router = Router();

// GET /api/assets
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const db = getDb();
  const { category, block, condition, search, code } = req.query as Record<string, string>;

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
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.assetCode.toLowerCase().includes(q) ||
        a.roomNumber.toLowerCase().includes(q)
    );
  }

  res.json({ total: list.length, assets: list });
});

// GET /api/assets/:id (Single asset with QR and past complaints)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const db = getDb();
  const idOrCode = req.params.id;
  const asset = db.assets.find((a) => a.id === idOrCode || a.assetCode === idOrCode);

  if (!asset) {
    res.status(404).json({ error: 'Asset not found.' });
    return;
  }

  // Generate QR code data URL containing asset details payload
  const qrPayload = JSON.stringify({
    app: 'HostelAssist',
    id: asset.id,
    code: asset.assetCode,
    name: asset.name,
    location: `${asset.block} - Room ${asset.roomNumber}`,
    condition: asset.condition,
  });

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed generating QR code:', err);
  }

  // Linked complaints
  const pastComplaints = db.complaints.filter((c) => c.assetId === asset.id || c.assetName?.includes(asset.assetCode));

  res.json({
    asset: {
      ...asset,
      qrCodeUrl: qrDataUrl,
    },
    pastComplaints,
  });
});

// POST /api/assets (Admin creates asset)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const {
      name,
      assetCode,
      category = 'Electrical',
      block = 'Block A',
      floor = 1,
      roomNumber,
      purchaseDate,
      purchaseCost = 0,
      condition = 'GOOD',
      warrantyExpiryDate,
      nextMaintenanceDays = 90,
    } = req.body;

    if (!name || !roomNumber) {
      res.status(400).json({ error: 'Asset name and room number are required.' });
      return;
    }

    const code = assetCode || `${name.substring(0, 3).toUpperCase()}-${block.replace(/\s+/g, '')}-${roomNumber}`;
    const now = new Date();
    const nextMaintenance = new Date(now.getTime() + (nextMaintenanceDays || 90) * 86400 * 1000).toISOString();
    const warranty = warrantyExpiryDate || new Date(now.getTime() + 365 * 86400 * 1000).toISOString();

    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      name: name.trim(),
      assetCode: code.toUpperCase(),
      category: category as ComplaintCategory,
      block,
      floor: Number(floor) || 1,
      roomNumber: roomNumber.trim(),
      condition: condition as AssetCondition,
      purchaseDate: purchaseDate || now.toISOString(),
      purchaseCost: Number(purchaseCost) || 0,
      totalRepairCost: 0,
      nextMaintenanceDate: nextMaintenance,
      warrantyExpiryDate: warranty,
      maintenanceHistoryCount: 0,
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.assets.push(newAsset);

    createAuditLog({
      action: 'ASSET_CREATED',
      performedBy: req.user!.name,
      userRole: 'ADMIN',
      entityType: 'ASSET',
      entityId: newAsset.id,
      details: `Created asset ${newAsset.name} (${newAsset.assetCode}) in Room ${newAsset.roomNumber}.`,
    });

    saveDb();

    res.status(201).json({
      message: 'Asset registered successfully.',
      asset: newAsset,
    });
  } catch (err: any) {
    console.error('Error creating asset:', err);
    res.status(500).json({ error: 'Failed to register asset.' });
  }
});

// PUT /api/assets/:id
router.put('/:id', authenticateToken, requireRole('ADMIN', 'TECHNICIAN'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDb();
  const asset = db.assets.find((a) => a.id === req.params.id);

  if (!asset) {
    res.status(404).json({ error: 'Asset not found.' });
    return;
  }

  const { condition, status, nextMaintenanceDate } = req.body;
  if (condition) asset.condition = condition;
  if (status) asset.status = status;
  if (nextMaintenanceDate) asset.nextMaintenanceDate = nextMaintenanceDate;
  asset.updatedAt = new Date().toISOString();

  createAuditLog({
    action: 'ASSET_UPDATED',
    performedBy: req.user!.name,
    userRole: req.user!.role,
    entityType: 'ASSET',
    entityId: asset.id,
    details: `Updated asset condition=${asset.condition}, status=${asset.status}.`,
  });

  saveDb();

  res.json({
    message: 'Asset updated successfully.',
    asset,
  });
});

export default router;
