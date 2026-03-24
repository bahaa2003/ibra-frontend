export const ADMIN_ROLES = ['admin', 'super_admin'];

export const isAdminRole = (role) => ADMIN_ROLES.includes(String(role || '').trim().toLowerCase());

export const hasRequiredRole = (userRole, allowedRoles = []) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true;
  }

  const normalizedRole = String(userRole || '').trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role || '').trim().toLowerCase());

  if (normalizedAllowedRoles.includes(normalizedRole)) {
    return true;
  }

  if (isAdminRole(normalizedRole) && normalizedAllowedRoles.includes('admin')) {
    return true;
  }

  return false;
};

export const getDefaultRouteForRole = (role) => {
  if (isAdminRole(role)) {
    return '/dashboard';
  }

  if (String(role || '').trim().toLowerCase() === 'manager') {
    return '/manager/dashboard';
  }

  return '/dashboard';
};
