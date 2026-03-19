import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getDefaultRouteForRole, hasRequiredRole } from '../../utils/authRoles';
<<<<<<< HEAD
import {
  getAccountAccessRoute,
  isApprovedAccountStatus,
  normalizeAccountStatus,
} from '../../utils/accountStatus';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, blockedStatus } = useAuthStore();
  const location = useLocation();
  const normalizedStatus = normalizeAccountStatus(user?.status || blockedStatus);
  const blockedRoute = getAccountAccessRoute(normalizedStatus);

  if (!isAuthenticated && blockedRoute) {
    return <Navigate to={blockedRoute} state={{ from: location }} replace />;
  }
=======

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

<<<<<<< HEAD
  if (!isApprovedAccountStatus(normalizedStatus) && blockedRoute) {
    return <Navigate to={blockedRoute} state={{ from: location }} replace />;
=======
  const normalizedStatus = String(user?.status || '').trim().toLowerCase();
  if (user?.role === 'customer' && normalizedStatus !== 'active') {
    return <Navigate to="/auth" state={{ from: location, pendingApproval: true }} replace />;
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  }

  const fallbackPath = getDefaultRouteForRole(user?.role);

  if (roles.length > 0 && !hasRequiredRole(user?.role, roles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
