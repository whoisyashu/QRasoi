import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types';
import { Skeleton } from '../ui/Skeleton';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { isAuthenticated, currentRole, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6">
        <div className="space-y-4 text-center max-w-sm">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // Handle unauthenticated access to protected routes
  if (requireAuth && !isAuthenticated) {
    if (location.pathname.startsWith('/chef')) {
      return <Navigate to="/chef/login" state={{ from: location }} replace />;
    } else if (location.pathname.startsWith('/system/portal')) {
      return <Navigate to="/system/portal/auth" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based authorization check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    if (currentRole === 'chef') {
      return <Navigate to="/chef/dashboard" replace />;
    } else if (currentRole === 'owner') {
      return <Navigate to="/dashboard" replace />;
    } else if (currentRole === 'admin') {
      return <Navigate to="/system/portal/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
