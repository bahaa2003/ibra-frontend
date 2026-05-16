export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  CUSTOMER: 'CUSTOMER',
});

export const ADMIN_ROLES = [ROLES.ADMIN];
export const SUPERVISOR_ROLES = [ROLES.SUPERVISOR];
export const ADMIN_SURFACE_ROLES = [ROLES.ADMIN, ROLES.SUPERVISOR];

const ROLE_ALIASES = Object.freeze({
  admin: ROLES.ADMIN,
  super_admin: ROLES.ADMIN,
  supervisor: ROLES.SUPERVISOR,
  manager: ROLES.SUPERVISOR,
  moderator: ROLES.SUPERVISOR,
  customer: ROLES.CUSTOMER,
  user: ROLES.CUSTOMER,
});

export const normalizeRole = (role) => {
  const token = String(role || '').trim();
  if (!token) return ROLES.CUSTOMER;

  const lower = token.toLowerCase();
  return ROLE_ALIASES[lower] || token.toUpperCase();
};

export const normalizePermissions = (permissions) => {
  if (Array.isArray(permissions)) {
    return [...new Set(
      permissions
        .map((permission) => String(permission || '').trim())
        .filter(Boolean)
    )];
  }

  if (permissions && typeof permissions === 'object') {
    return Object.entries(permissions)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => String(key).trim())
      .filter(Boolean);
  }

  return [];
};

export const normalizeAuthUser = (user) => {
  if (!user) return null;

  const permissions = normalizePermissions(user.permissions || user.supervisorPermissions);

  return {
    ...user,
    role: normalizeRole(user.role),
    permissions,
    supervisorPermissions: permissions,
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled ?? user.twoFactorEnabled),
    twoFactorEnabled: Boolean(user.twoFactorEnabled ?? user.isTwoFactorEnabled),
    isApiEnabled: Boolean(user.isApiEnabled),
    apiToken: user.apiToken || '',
  };
};

export const isAdminRole = (role) => normalizeRole(role) === ROLES.ADMIN;

export const isSupervisorRole = (role) => normalizeRole(role) === ROLES.SUPERVISOR;

export const userHasPermission = (user, permission) => {
  if (!permission) return true;
  const normalizedUser = normalizeAuthUser(user);
  if (!normalizedUser) return false;
  if (isAdminRole(normalizedUser.role)) return true;
  if (!isSupervisorRole(normalizedUser.role)) return false;

  return normalizePermissions(normalizedUser.permissions).includes(permission);
};

export const userHasAnyPermission = (user, permissions = []) => {
  const requiredPermissions = Array.isArray(permissions) ? permissions.filter(Boolean) : [permissions].filter(Boolean);
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.some((permission) => userHasPermission(user, permission));
};

export const userHasAllPermissions = (user, permissions = []) => {
  const requiredPermissions = Array.isArray(permissions) ? permissions.filter(Boolean) : [permissions].filter(Boolean);
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.every((permission) => userHasPermission(user, permission));
};

export const hasRequiredRole = (userRole, allowedRoles = []) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true;
  }

  const normalizedRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (normalizedAllowedRoles.includes(normalizedRole)) {
    return true;
  }

  if (isAdminRole(normalizedRole) && normalizedAllowedRoles.includes(ROLES.ADMIN)) {
    return true;
  }

  return false;
};

export const getDefaultRouteForRole = (role) => {
  if (isAdminRole(role) || isSupervisorRole(role)) {
    return '/admin/dashboard';
  }

  return '/dashboard';
};
