import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, RotateCcw, Tag, ShieldAlert,
  Activity, Users, BarChart3, Store, Menu, X, Boxes, Zap,
  FolderOpen, Star, Settings, Award, ChevronRight, Bell, Globe
} from 'lucide-react';

interface AdminLayoutProps {
  user: any;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Reports & Export', path: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes },
        { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
        { label: 'Brands', path: '/admin/brands', icon: Award },
      ],
    },
    {
      label: 'Commerce',
      items: [
        { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { label: 'Returns & Refunds', path: '/admin/returns', icon: RotateCcw },
        { label: 'Promotions & Sales', path: '/admin/promotions', icon: Zap },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { label: 'Coupons & Targeting', path: '/admin/coupons', icon: Tag },
      ],
    },
    {
      label: 'Customers',
      items: [
        { label: 'Customers (CLV)', path: '/admin/customers', icon: Users },
        { label: 'Reviews', path: '/admin/reviews', icon: Star },
        { label: 'Fraud & Risk', path: '/admin/fraud', icon: ShieldAlert },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'System Health', path: '/admin/health', icon: Activity },
        { label: 'Site Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const currentPage = navGroups.flatMap(g => g.items).find(i => isActive(i.path));

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 p-3 space-y-4 overflow-y-auto text-[11px] font-semibold">
      {navGroups.map(group => (
        <div key={group.label}>
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 select-none">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active
                    ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-900/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Sidebar = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-lg shrink-0">P</div>
        <div className="min-w-0">
          <p className="font-extrabold text-white text-sm tracking-tight leading-none truncate">PriyoShop</p>
          <p className="text-[10px] text-gray-500 font-medium">Admin Portal</p>
        </div>
        {onItemClick && (
          <button onClick={onItemClick} className="ml-auto text-gray-400 p-1 shrink-0">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <NavContent onItemClick={onItemClick} />

      <div className="p-3 border-t border-gray-800 space-y-1 text-[11px] shrink-0">
        <div className="px-3 py-2 rounded-xl bg-gray-800/50">
          <p className="text-gray-500 text-[10px]">Signed in as</p>
          <p className="text-white font-bold truncate">{user?.email}</p>
        </div>
        <Link to="/" onClick={onItemClick} className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition">
          <Store className="w-3.5 h-3.5" /> Back to Storefront
        </Link>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-gray-800 transition">
          <X className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex font-sans w-full max-w-full overflow-x-hidden">

      {/* Desktop Sidebar */}
      <aside className="w-56 xl:w-64 bg-gray-900 text-gray-300 hidden md:flex flex-col shrink-0 border-r border-gray-800 sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 max-w-[85vw] bg-gray-900 text-gray-300 flex flex-col h-full z-10 shadow-2xl">
            <Sidebar onItemClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Sticky Top Bar */}
        <header className="h-14 sm:h-16 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 md:hidden hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white leading-none">
                {currentPage?.label || 'Admin Dashboard'}
              </p>
              <p className="text-[10px] text-gray-400 hidden sm:block">PriyoShop Enterprise Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Live
            </span>
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-gray-700 dark:text-gray-200 text-[11px] truncate max-w-[150px]">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
