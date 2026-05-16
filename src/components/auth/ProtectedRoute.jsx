import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import {
  ADMIN_SURFACE_ROLES,
  getDefaultRouteForRole,
  hasRequiredRole,
  userHasAllPermissions,
} from '../../utils/authRoles';
import {
  getAccountAccessRoute,
  isApprovedAccountStatus,
  normalizeAccountStatus,
} from '../../utils/accountStatus';

const ProtectedRoute = ({ children, roles = [], permissions = [] }) => {
  const { user, isAuthenticated, blockedStatus } = useAuthStore();
  const location = useLocation();
  const normalizedStatus = normalizeAccountStatus(user?.status || blockedStatus);
  const blockedRoute = getAccountAccessRoute(normalizedStatus);

  if (!isAuthenticated && blockedRoute) {
    return <Navigate to={blockedRoute} state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isApprovedAccountStatus(normalizedStatus) && blockedRoute) {
    return <Navigate to={blockedRoute} state={{ from: location }} replace />;
  }

  const fallbackPath = getDefaultRouteForRole(user?.role);

  if (roles.length > 0 && !hasRequiredRole(user?.role, roles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions].filter(Boolean);
  if (requiredPermissions.length > 0 && !userHasAllPermissions(user, requiredPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export const AdminRoute = ({ children, permissions = [] }) => (
  <ProtectedRoute roles={ADMIN_SURFACE_ROLES} permissions={permissions}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
