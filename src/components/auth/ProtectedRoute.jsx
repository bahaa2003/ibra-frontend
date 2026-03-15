import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const normalizedStatus = String(user?.status || '').trim().toLowerCase();
  if (user?.role === 'customer' && normalizedStatus !== 'active') {
    return <Navigate to="/auth" state={{ from: location, pendingApproval: true }} replace />;
  }

  const fallbackPath = user?.role === 'admin'
    ? '/admin/payments'
    : user?.role === 'manager'
      ? '/manager/dashboard'
      : '/dashboard';

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
