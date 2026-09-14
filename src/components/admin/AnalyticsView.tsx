import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  PieChart,
  BarChart3,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [heatmap, setHeatmap] = useState<{
    blocks: string[];
    categories: string[];
    matrix: Record<string, Record<string, number>>;
  } | null>(null);

  const [analytics, setAnalytics] = useState<{
    totalCost: number;
    costByCategory: Record<string, number>;
    countByCategory: Record<string, number>;
    costByBlock: Record<string, number>;
    countByBlock: Record<string, number>;
    monthlySpending: Array<{ month: string; cost: number; complaints: number }>;
    insights: string[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getHeatmap(), api.getAnalytics()])
      .then(([hm, an]) => {
        setHeatmap(hm);
        setAnalytics(an);
      })
      .catch((err) => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !heatmap || !analytics) {
    return (
      <div className="py-24 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
        <span className="text-xs">Computing hostel failure heatmap &amp; expenditure...</span>
      </div>
    );
  }

  // Get intensity color for matrix cell
  const getCellIntensity = (count: number) => {
    if (count === 0) return 'bg-slate-50 dark:bg-slate-800/40 text-slate-400';
    if (count === 1) return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold';
    if (count === 2) return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 font-bold';
    if (count >= 3) return 'bg-rose-500 text-white font-black shadow-sm animate-pulse';
    return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Hostel Problem Heatmap &amp; Cost Intelligence</span>
        </h1>
        <p className="text-xs text-slate-500">
          Spatial density analysis of breakdowns across blocks, floors, and component categories.
        </p>
      </div>

      {/* Heatmap Matrix Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Spatial Failure Heatmap Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">
              Breakdown frequency distribution: Block (Rows) vs Infrastructure Category (Columns)
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
            <span>Low</span>
            <span className="w-3 h-3 rounded bg-sky-100 dark:bg-sky-900" />
            <span className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-800" />
            <span className="w-3 h-3 rounded bg-amber-300 dark:bg-amber-700" />
            <span className="w-3 h-3 rounded bg-rose-500" />
            <span>Critical / High</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hostel Block
                </th>
                {heatmap.categories.map((cat) => (
                  <th
                    key={cat}
                    className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.blocks.map((b) => (
                <tr key={b} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3 text-left font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap">
                    {b}
                  </td>
                  {heatmap.categories.map((cat) => {
                    const count = heatmap.matrix[b]?.[cat] || 0;
                    return (
                      <td key={cat} className="p-2">
                        <div
                          className={`w-12 h-10 mx-auto rounded-xl flex items-center justify-center text-xs transition ${getCellIntensity(
                            count
                          )}`}
                        >
                          {count}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spend Breakdown & Monthly Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-sky-500" />
              Maintenance Cost by Category
            </h3>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Total ₹{analytics.totalCost.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.costByCategory).map(([cat, rawCost]) => {
              const cost = Number(rawCost) || 0;
              const count = analytics.countByCategory[cat] || 0;
              const pct = analytics.totalCost > 0 ? (cost / analytics.totalCost) * 100 : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat} ({count} tickets)
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{cost.toFixed(2)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost by Block */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Maintenance Cost by Hostel Block
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.costByBlock).map(([blk, rawCost]) => {
              const cost = Number(rawCost) || 0;
              const count = analytics.countByBlock[blk] || 0;
              const pct = analytics.totalCost > 0 ? (cost / analytics.totalCost) * 100 : 0;
              return (
                <div key={blk} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {blk} ({count} tickets)
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{cost.toFixed(2)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Cost Optimization Insights */}
      <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200">
            Predictive Maintenance Insights &amp; Savings Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {analytics.insights.map((ins, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 shadow-sm text-slate-700 dark:text-slate-300"
            >
              {ins}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
