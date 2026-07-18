/**
 * imageUrl.js — Utility to resolve image paths for display.
 *
 * The backend stores relative paths like `/uploads/avatars/123-abc.jpg`.
 * This utility prepends the backend origin so <img src> works correctly.
 *
 * Handles:
 *   - Relative paths: `/uploads/...` → `http://localhost:5000/uploads/...`
 *   - Absolute URLs: `https://...` → returned as-is
 *   - Base64 data URIs: `data:image/...` → returned as-is (legacy support)
 *   - Falsy values: → empty string
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ibra-backend.onrender.com/api';

/**
 * Backend origin (without /api suffix).
 * e.g. "http://localhost:5000" or "https://mysite.com"
 */
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

const LOCAL_BACKEND_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

const remapLegacyLocalUrl = (value) => {
  try {
    const url = new URL(value);
    const configuredOrigin = new URL(BACKEND_ORIGIN);
    const pointsToLocalBackend = LOCAL_BACKEND_HOSTS.has(url.hostname) && ['5000', '5001'].includes(url.port);
    const configuredBackendIsRemote = !LOCAL_BACKEND_HOSTS.has(configuredOrigin.hostname);

    if (pointsToLocalBackend && configuredBackendIsRemote) {
      return `${BACKEND_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return value;
  }

  return value;
};

/**
 * Resolve an image path for display in <img src>.
 *
 * @param {string|null|undefined} path - Relative path, absolute URL, or falsy
 * @returns {string} A fully-qualified URL or empty string
 */
export const resolveImageUrl = (path) => {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (!trimmed) return '';

  // Already absolute or data URI — return as-is
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return remapLegacyLocalUrl(trimmed);
  }

  // Relative path — prepend backend origin
  return `${BACKEND_ORIGIN}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

export default resolveImageUrl;
