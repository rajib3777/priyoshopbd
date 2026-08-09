import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, BarChart3, Calendar, Download, TrendingUp, Package, ShoppingCart, Users } from 'lucide-react';
import api from '@/api/client';

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    api.get('/admin/analytics/dashboard/?period=30d')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  const download = async (type: string, label: string) => {
    setDownloading(type);
    try {
      const url = type === 'orders'
        ? `/api/v1/admin/reports/excel/orders/?from=${dateFrom}&to=${dateTo}`
        : type === 'products'
        ? `/api/v1/admin/reports/excel/products/`
        : `/api/v1/admin/reports/excel/customers/`;
      window.open(url, '_blank');
    } finally {
      setTimeout(() => setDownloading(''), 1500);
    }
  };

  const reportCards = [
    {
      id: 'orders',
      icon: ShoppingCart,
      title: 'Orders Report',
      desc: 'All orders with status, revenue, COD details filtered by date range.',
      color: 'brand',
      formats: ['Excel'],
    },
    {
      id: 'products',
      icon: Package,
      title: 'Product & Profit Report',
      desc: 'SKU-level buying price, selling price, margin %, units sold, and profit.',
      color: 'emerald',
      formats: ['Excel'],
    },
    {
      id: 'customers',
      icon: Users,
      title: 'Customer CLV Report',
      desc: 'Customer lifetime values, loyalty tiers, total orders, and risk scores.',
      color: 'purple',
      formats: ['Excel'],
    },
  ];

  const colorMap: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-600 dark:bg-brand-950/50',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50',
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full overflow-x-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Reports & Export Center</h1>
        <p className="text-xs text-gray-500">Download Excel reports for orders, products, profits, and customers.</p>
      </div>

      {/* Date Range Picker */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-semibold">Report Date Range:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="p-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="p-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {reportCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${colorMap[card.color]} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{card.title}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{card.desc}</p>
                </div>
              </div>
              <button
                onClick={() => download(card.id, card.title)}
                disabled={downloading === card.id}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {downloading === card.id ? 'Preparing...' : 'Download Excel'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      {stats && (
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 space-y-4">
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" /> Last 30 Days At a Glance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Revenue', value: `৳${stats.summary.revenue}`, sub: 'Total sales' },
              { label: 'Net Profit', value: `৳${stats.summary.profit}`, sub: 'After cost' },
              { label: 'Total Orders', value: stats.summary.total_orders, sub: `${stats.alerts.pending_orders} pending` },
              { label: 'Avg Order', value: `৳${stats.summary.average_order_value}`, sub: 'Per order' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-gray-50 dark:bg-dark-900 text-center">
                <p className="text-[10px] text-gray-400 mb-1">{s.label}</p>
                <p className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
