import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, HardDrive, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import api from '@/api/client';
import { SystemHealth } from '@/types';

export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    api.get('/health/system/')
      .then(res => {
        setHealth(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return <div className="p-8 text-center text-gray-500">Connecting to System Health Monitoring...</div>;
  }

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">System Health & Observability</h1>
          <p className="text-xs text-gray-500">Production status monitoring: Database latency, Redis cache, Celery workers, Storage & Backups.</p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4 text-brand-600" /> Refresh Health
        </button>
      </div>

      {/* Health Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Database */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <Database className="w-6 h-6 text-brand-600" />
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
              {health.services.database.status}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">PostgreSQL Database</h3>
            <p className="text-xs text-gray-500">Latency: <b className="text-brand-600">{health.services.database.latency_ms} ms</b></p>
          </div>
        </div>

        {/* Redis */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <Server className="w-6 h-6 text-purple-600" />
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
              {health.services.redis.status}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Redis Cache & Broker</h3>
            <p className="text-xs text-gray-500">Session & Cache Status</p>
          </div>
        </div>

        {/* Storage */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <HardDrive className="w-6 h-6 text-amber-600" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{health.metrics.media_storage_mb} MB</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Media Storage Usage</h3>
            <p className="text-xs text-gray-500">Uploaded product images & assets</p>
          </div>
        </div>

        {/* Backups */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
              {health.backup.status}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Backup & Disaster Recovery</h3>
            <p className="text-xs text-gray-500">Automated PostgreSQL Dumps</p>
          </div>
        </div>

      </div>

    </div>
  );
};
