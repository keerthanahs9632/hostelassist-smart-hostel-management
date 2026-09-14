import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Asset, AssetCondition, ComplaintCategory } from '../../types';
import { ConditionBadge } from '../common/Badge';
import { AssetQrTagModal } from './AssetQrTagModal';
import {
  QrCode,
  Plus,
  Search,
  Download,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Tag,
} from 'lucide-react';

export const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [viewingQrAsset, setViewingQrAsset] = useState<Asset | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New asset form
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<ComplaintCategory>('Electrical');
  const [newBlock, setNewBlock] = useState('Block B');
  const [newRoom, setNewRoom] = useState('B-204');
  const [newCondition, setNewCondition] = useState<AssetCondition>('GOOD');
  const [newCost, setNewCost] = useState('2500');
  const [submitting, setSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.getAssets(params);
      setAssets(res.assets || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [categoryFilter]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;
    setRegError(null);
    setSubmitting(true);
    try {
      await api.createAsset({
        name: newName,
        assetCode: newCode.toUpperCase(),
        category: newCategory,
        block: newBlock,
        roomNumber: newRoom,
        condition: newCondition,
        purchaseCost: parseFloat(newCost) || 0,
        warrantyExpiryDate: new Date(Date.now() + 365 * 24 * 3600000).toISOString().split('T')[0],
      });
      setIsRegisterOpen(false);
      // reset form
      setNewName('');
      setNewCode('');
      fetchAssets();
    } catch (err: any) {
      setRegError(err.message || 'Failed to register asset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-sky-500" />
            <span>Hostel Asset Registry &amp; QR Tracking</span>
          </h1>
          <p className="text-xs text-slate-500">
            Track equipment life-cycle, maintenance expenditures, and generate field QR code inspection tags.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset name, code, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Categories</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Water">Water</option>
          <option value="Internet">Internet</option>
          <option value="Furniture">Furniture</option>
        </select>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-500 mb-2" />
          <span className="text-xs">Loading equipment inventory...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          No registered assets found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      {item.assetCode}
                    </span>
                    <ConditionBadge condition={item.condition} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                    {item.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.block} · Room {item.roomNumber}
                  </div>
                </div>

                <button
                  onClick={() => setViewingQrAsset(item)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-600 transition"
                  title="View & Download QR tag"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Purchase Cost</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ₹{item.purchaseCost.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Repair Cost</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    ₹{item.totalRepairCost.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Next Maintenance</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {item.nextMaintenanceDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Past Tickets</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.maintenanceHistoryCount} repairs
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Tag Modal */}
      {viewingQrAsset && (
        <AssetQrTagModal
          asset={viewingQrAsset}
          onClose={() => setViewingQrAsset(null)}
        />
      )}

      {/* Register Asset Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Register New Equipment Asset
              </h2>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regError && (
              <div className="mx-6 mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crompton High-Flow Exhaust Fan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Tag Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AST-EXH-009"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ComplaintCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Water">Water</option>
                    <option value="Internet">Internet</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hostel Block
                  </label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Block D">Block D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room / Corridor
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Condition
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as AssetCondition)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                  >
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="NEEDS_ATTENTION">Needs Attention</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  {submitting ? 'Saving...' : 'Register & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
