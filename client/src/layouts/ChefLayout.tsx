import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, Store } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const ChefLayout: React.FC = () => {
  const navigate = useNavigate();
  const { restaurant, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Ultra-Minimal Production Chef Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white rounded-2xl shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Kitchen KDS — {restaurant.name}</h1>
            <p className="text-xs text-slate-400">Verified Paid Orders Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Owner Dashboard</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Kitchen View */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
