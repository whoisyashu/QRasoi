import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from '../components/shared/PublicHeader';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8]">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
