import React, { useState, useEffect } from 'react';
import {
  DollarSign, ShoppingBag, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Package, Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import api from '@/api/client';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}`;
};

const fmtTaka = (v: number) =>
  v >= 1000 ? `৳${(v / 1000).toFixed(1)}k` : `৳${v}`;

const STATUS_COLORS: Record<string, string> = {
  delivered:        '#10b981',
  pending:          '#f59e0b',
  processing:       '#6366f1',
  confirmed:        '#8b5cf6',
  packed:           '#3b82f6',
  shipped:          '#06b6d4',
  out_for_delivery: '#0ea5e9',
  cancelled:        '#ef4444',
  returned:         '#f97316',
};

const PIE_PALETTE = ['#10b981','#6366f1','#f59e0b','#ef4444','#3b82f6','#06b6d4','#8b5cf6','#f97316'];

// ── Custom Tooltip ──────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 font-medium" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span>{typeof p.value === 'number' && p.name !== 'delivered' && p.name !== 'cancelled'
            ? fmtTaka(p.value)
            : p.value
          }</span>
        </div>
      ))}
    </div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/analytics/dashboard/?period=${period}`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-dark-800" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-dark-800" />)}
        </div>
      </div>
    );
  }

  const summary = data.summary;
  const daily: any[] = (data.daily_stats || []).map((d: any) => ({
    ...d,
    date: fmtDate(d.date),
  }));
  const statusBreakdown: any[] = data.status_breakdown || [];

  const kpis = [
    {
      label: 'Gross Revenue',
      value: `৳${Number(summary.revenue).toLocaleString()}`,
      sub: `Avg Order: ৳${summary.average_order_value}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600',
      valueColor: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Net Profit',
      value: `৳${Number(summary.profit).toLocaleString()}`,
      sub: `Cost: ৳${Number(summary.cost).toLocaleString()}`,
      icon: TrendingUp,
      iconBg: 'bg-brand-100 dark:bg-brand-950/50 text-brand-600',
      valueColor: 'text-brand-600',
    },
    {
      label: 'Total Orders',
      value: summary.total_orders,
      sub: `${data.alerts.pending_orders} pending`,
      icon: ShoppingBag,
      iconBg: 'bg-violet-100 dark:bg-violet-950/50 text-violet-600',
      valueColor: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Fraud Flags',
      value: data.alerts.flagged_orders,
      sub: 'Suspicious orders',
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-950/50 text-red-600',
      valueColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">

      {/* ── Header + Period Switcher ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Revenue, profit, cost and order performance analytics.</p>
        </div>
        <div className="flex bg-white dark:bg-dark-800 p-1 rounded-xl border border-gray-200 dark:border-dark-700 text-xs font-semibold self-start">
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

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-xl sm:text-2xl font-black ${kpi.valueColor}`}>{kpi.value}</div>
              <div className="text-[11px] text-gray-500 font-medium">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row 1: Revenue+Profit+Cost & Delivered+Cancelled ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Revenue vs Profit vs Cost — Area Chart */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Revenue · Profit · Cost</h3>
            <p className="text-[11px] text-gray-400">Daily financial performance (৳)</p>
          </div>
          {daily.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tickFormatter={(v) => fmtTaka(v)} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#e11d48" strokeWidth={2} fill="url(#profitGrad)" dot={false} />
                <Area type="monotone" dataKey="cost" name="Cost" stroke="#f59e0b" strokeWidth={2} fill="url(#costGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Delivered vs Cancelled — Bar Chart */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Delivered vs Cancelled Orders</h3>
            <p className="text-[11px] text-gray-400">Daily order completion rate</p>
          </div>
          {daily.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="delivered" name="Delivered" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Charts Row 2: Profit Line & Status Pie ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Daily Profit Line Chart */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Daily Net Profit Trend</h3>
            <p className="text-[11px] text-gray-400">How much profit is generated each day</p>
          </div>
          {daily.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tickFormatter={(v) => fmtTaka(v)} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3, fill: '#e11d48' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Breakdown Pie */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Order Status Breakdown</h3>
            <p className="text-[11px] text-gray-400">Distribution of all orders by status</p>
          </div>
          {statusBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-gray-400">No order data</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusBreakdown.map((entry: any, index: number) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] || PIE_PALETTE[index % PIE_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [value + ' orders', name]}
                    contentStyle={{ fontSize: 11, borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-col gap-1.5 text-xs shrink-0">
                {statusBreakdown.map((entry: any, i: number) => (
                  <div key={entry.status} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[entry.status] || PIE_PALETTE[i % PIE_PALETTE.length] }} />
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{entry.status.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-gray-900 dark:text-white ml-auto pl-2">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Products & Customers ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-600" /> Top Selling Products
          </h3>
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
          <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" /> Top Customers by Lifetime Value
          </h3>
          {data.top_customers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No customer data yet.</p>
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
