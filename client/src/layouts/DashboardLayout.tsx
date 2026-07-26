import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  BarChart3,
  QrCode,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UtensilsCrossed,
  ChefHat,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';

export const DashboardLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurant, logout } = useAuthStore();
  const { orders } = useOrderStore();

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders Queue', path: '/dashboard/orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { label: 'Menu Items', path: '/dashboard/menu', icon: Utensils },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'QR Poster', path: '/dashboard/qr', icon: QrCode },
    { label: 'Manage Chefs', path: '/dashboard/chefs', icon: ChefHat },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8]">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop & Tablet Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-white border-r border-[#E5E7EB] transition-all duration-300 z-30 ${
            isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-[72px] px-5 flex items-center justify-between border-b border-[#F3F4F6]">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="QRasoi Logo"
                  className="h-10 md:h-11 w-auto object-contain shrink-0"
                />
                <div className="truncate">
                  <h2 className="font-bold text-[#334155] text-base truncate">{restaurant.name}</h2>
                  <p className="text-xs text-[#6B7280]">Owner Dashboard</p>
                </div>
              </div>
            )}
            {isSidebarCollapsed && (
              <img
                src="/logo.png"
                alt="QRasoi Logo"
                className="h-10 w-auto mx-auto object-contain shrink-0"
              />
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-[#6B7280] transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F97316] text-white shadow-sm font-bold'
                      : 'text-[#334155] hover:bg-slate-50'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                  {!isSidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                  {!isSidebarCollapsed && item.badge ? (
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive ? 'bg-white text-[#F97316]' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Quick link to public menu */}
          <div className="p-4 border-t border-[#F3F4F6]">
            <button
              onClick={() => navigate(`/r/${restaurant.id.replace('rest-', '')}`)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-[#6B7280] hover:bg-orange-50 hover:text-[#F97316] transition-colors cursor-pointer ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-[#F97316]" />
              {!isSidebarCollapsed && <span>View Digital Menu</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Navigation Bar */}
          <header className="h-[72px] bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#334155]">
                {navItems.find((i) => i.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Outlet Online</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 rounded-xl transition-colors font-medium cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          {/* Page View Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation with Infinite Manual Touch Scroll */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] z-40 px-3 py-2.5 shadow-2xl overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  {item.badge ? (
                    <span className={`absolute -top-1.5 -right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-[#F97316]' : 'bg-amber-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
