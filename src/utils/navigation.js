import { isAdminRole } from './authRoles';

const ADMIN_SIDEBAR_PATHS = new Set([
  '/admin/wallet',
  '/admin/users',
  '/admin/supervisors',
  '/admin/groups',
  '/admin/products',
  '/admin/orders',
  '/admin/payments',
  '/admin/payment-methods',
  '/admin/currencies',
  '/admin/suppliers',
  '/account',
  '/account-security',
  '/settings',
]);

const CUSTOMER_SIDEBAR_PATHS = new Set([
  '/wallet',
  '/orders',
  '/account',
  '/account-security',
  '/created-by',
  '/settings',
]);

const MANAGER_SIDEBAR_PATHS = new Set([
  '/manager/dashboard',
  '/account',
  '/account-security',
  '/created-by',
  '/settings',
]);

const pathnameHistory = [];

export const getDashboardPathForRole = (role) => {
  if (isAdminRole(role)) return '/admin/dashboard';
  if (String(role || '').trim().toLowerCase() === 'manager') return '/manager/dashboard';
  return '/dashboard';
};

export const isSidebarRootPath = (pathname, role) => {
  const path = String(pathname || '').trim();
  if (!path) return false;

  if (isAdminRole(role)) {
    return ADMIN_SIDEBAR_PATHS.has(path);
  }

  if (String(role || '').trim().toLowerCase() === 'manager') {
    return MANAGER_SIDEBAR_PATHS.has(path);
  }

  return CUSTOMER_SIDEBAR_PATHS.has(path);
};

export const registerVisitedPath = (pathname) => {
  const path = String(pathname || '').trim();
  if (!path) return;

  if (pathnameHistory[pathnameHistory.length - 1] === path) {
    return;
  }

  pathnameHistory.push(path);

  if (pathnameHistory.length > 50) {
    pathnameHistory.shift();
  }
};

export const getPreviousVisitedPath = (currentPathname) => {
  const currentPath = String(currentPathname || '').trim();
  if (!currentPath) return null;

  for (let index = pathnameHistory.length - 2; index >= 0; index -= 1) {
    const candidate = pathnameHistory[index];
    if (candidate && candidate !== currentPath) {
      return candidate;
    }
  }

  return null;
};
