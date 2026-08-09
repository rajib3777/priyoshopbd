import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '@/api/client';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics/dashboard/?period=${period}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-dark-800" />
        ))}
      </div>
    );
  }

  const summary = data.summary;

  const kpis = [
    {
      label: 'Gross Revenue',
      value: `৳${summary.revenue}`,
      sub: `Avg Order: ৳${summary.average_order_value}`,
      icon: DollarSign,
      color: 'emerald',
    },
    {
      label: 'Net Profit',
      value: `৳${summary.profit}`,
      sub: `Cost: ৳${summary.cost}`,
      icon: TrendingUp,
      color: 'brand',
    },
    {
      label: 'Total Orders',
      value: summary.total_orders,
      sub: `${data.alerts.pending_orders} pending`,
      icon: ShoppingBag,
      color: 'purple',
    },
    {
      label: 'Fraud Flags',
      value: data.alerts.flagged_orders,
      sub: 'Suspicious COD orders',
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50',
    brand:   'bg-brand-100 text-brand-600 dark:bg-brand-950/50',
    purple:  'bg-purple-100 text-purple-600 dark:bg-purple-950/50',
    red:     'bg-red-100 text-red-600 dark:bg-red-950/50',
  };

  const valueColorMap: Record<string, string> = {
    emerald: 'text-gray-900 dark:text-white',
    brand:   'text-brand-600',
    purple:  'text-gray-900 dark:text-white',
    red:     'text-red-600',
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">

      {/* Header + Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Real-time revenue, profit, and commerce KPIs.</p>
        </div>

        <div className="flex bg-white dark:bg-dark-800 p-1 rounded-xl border border-gray-200 dark:border-dark-700 text-xs font-semibold self-start sm:self-auto">
          {['7d', '30d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg transition ${period === p ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-[11px] sm:text-xs font-semibold leading-tight">{kpi.label}</span>
                <div className={`p-1.5 sm:p-2 rounded-xl ${colorMap[kpi.color]}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className={`text-lg sm:text-2xl font-black ${valueColorMap[kpi.color]}`}>
                {kpi.value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Top Products & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">

        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Top Selling Products</h3>
          <div className="space-y-2.5">
            {data.top_products.map((p: any) => (
              <div key={p.id} className="flex items-start justify-between gap-3 text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-dark-900">
                <span className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug flex-1">{p.name}</span>
                <div className="text-right shrink-0">
                  <span className="font-bold text-gray-900 dark:text-white block">{p.units_sold} sold</span>
                  <span className="text-[10px] text-emerald-600 font-medium">৳{p.profit_total} profit</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Most Valuable Customers (CLV)</h3>
          {data.top_customers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No customer data yet. Place orders to see CLV.</p>
          ) : (
            <div className="space-y-2.5">
              {data.top_customers.map((c: any, i: number) => (
                <div key={i} className="flex items-start justify-between gap-3 text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-dark-900">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">{c.user__first_name || c.user__email}</span>
                    <span className="text-[10px] text-gray-400 truncate block">{c.user__email}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-brand-600 block">৳{c.lifetime_value}</span>
                    <span className="text-[10px] text-gray-400">{c.total_orders} orders</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
