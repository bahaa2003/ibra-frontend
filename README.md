# Ibra Store Frontend Technical Reference

This document describes the current frontend implementation as it exists in this repository. It is intended for developers who need to run, maintain, extend, or audit the React application safely.

The frontend is a Vite React single page application for a digital products and wallet based store. It supports public browsing, customer ordering and wallet flows, admin operations, and supervisor/admin RBAC screens. The app can run against the real backend API or a local mock data provider selected by environment variables.

## 1. Project Overview

### What This Frontend Does

The frontend provides the browser UI for Ibra Store. It lets users browse digital products, register/login, manage their account, buy products using wallet balance or credit limit, upload topup receipts, view orders, and interact with notifications.

Administrators and supervisors use the same SPA to manage customers, products, categories, groups, orders, wallet activity, deposits/topups, currencies, payment methods, suppliers/providers, and supervisor permissions.

### Main Business Idea

The app is built around selling digital products and game/service topups. Customers maintain a wallet balance, optionally have a credit limit, and submit orders for products. Admin users manage the product catalog, customer accounts, wallet/topup requests, order fulfillment status, payment configuration, and external supplier/provider integrations.

### User Types Supported

The current role system is defined in `src/utils/authRoles.js`.

| User type | Normalized role | Notes |
| --- | --- | --- |
| Admin | `ADMIN` | Full admin access. Admin bypasses frontend permission checks. Aliases include `admin` and `super_admin`. |
| Supervisor | `SUPERVISOR` | Admin surface user with specific permission keys. Aliases include `supervisor`, `manager`, and `moderator`. |
| Customer/User | `CUSTOMER` | Storefront user with wallet, products, orders, account, and optional API docs access. Aliases include `customer` and `user`. |

### Main Areas

| Area | Main routes | Purpose |
| --- | --- | --- |
| Public storefront | `/`, `/about`, `/created-by`, `/products/:id` | Public browsing and informational pages. Product detail links redirect unauthenticated users to auth. |
| Auth and account access | `/auth`, `/login`, `/email-verified`, `/auth/account-pending`, `/auth/account-rejected`, `/auth/verify-email` | Login, registration, Google callback handling, verification and approval states. |
| Customer app | `/dashboard`, `/products`, `/wallet`, `/wallet/add-balance`, `/wallet/payment-details/:methodId`, `/orders`, `/account`, `/settings`, `/account-security`, `/api-docs` | Product purchase flow, wallet/topups, order history, profile/security settings, optional API token docs. |
| Admin app | `/admin/dashboard`, `/admin/users`, `/admin/products`, `/admin/orders`, `/admin/payments`, `/admin/wallet`, `/admin/groups`, `/admin/suppliers`, `/admin/currencies`, `/admin/payment-methods`, `/admin/supervisors` | Operational back office. |
| Supervisor app | Same admin surface, with permission checks | Supervisors use the admin layout but are limited by permission keys. |

### How It Connects To The Backend

The app uses `src/services/client.js` as the data provider selector.

```js
const provider = import.meta.env.VITE_DATA_PROVIDER || 'mock';
export const apiClient = provider === 'real' ? realApi : mockApi;
```

When `VITE_DATA_PROVIDER=real`, API calls go through `src/services/realApi.js`, an Axios based REST client. When it is unset or set to another value, the app uses `src/services/mockApi.js`, which stores data in browser `localStorage`.

### Current Architecture Style

The app is a client side rendered Vite SPA:

- React pages are mounted through `react-router-dom`.
- Top level providers are installed in `src/App.jsx`.
- Route-level code splitting uses `React.lazy` and `Suspense`.
- Zustand stores hold auth, products, admin data, orders, groups, topups, system settings, and notifications.
- API concerns are centralized in `src/services/realApi.js` and `src/services/mockApi.js`.
- Route protection is handled by `src/components/auth/ProtectedRoute.jsx`.
- Layout, sidebar visibility, and permission-aware navigation live in `src/components/layout`.
- Styling uses Tailwind CSS 4, CSS variables, and custom global CSS.

## 2. Tech Stack

| Category | Current implementation |
| --- | --- |
| Runtime | Browser SPA, Node/npm for local tooling. Node version is not pinned in the repo. Vite 6 generally expects a modern Node version. |
| Framework | React `^19.0.0` with `react-dom` `^19.0.0`. |
| Build tool | Vite `^6.2.0` with `@vitejs/plugin-react` and `@tailwindcss/vite`. |
| Routing | `react-router-dom` `^7.13.1`. |
| State management | Zustand `^5.0.11`, with `persist` middleware for several stores. |
| API client | Axios `^1.13.6` in `src/services/realApi.js`. |
| Styling | Tailwind CSS `^4.1.14`, CSS variables in `src/theme/tokens.css`, global CSS in `src/index.css`. |
| Icons | `lucide-react` `^0.546.0`. |
| Animation | `framer-motion` and `motion`. |
| i18n | `i18next`, `react-i18next`, `i18next-browser-languagedetector`. |
| Forms | Mostly controlled React state in page/components. No Formik/React Hook Form is used in the inspected code. |
| Validation | Custom helpers, mainly `src/utils/validation.js`, plus page-specific validation logic. No Zod/Yup runtime schema library is used. |
| Toasts | Custom toast context in `src/components/ui/Toast.jsx`. |
| Tables | Custom table component in `src/components/ui/Table.jsx` plus page-specific table markup. |
| File upload | Browser `File`/`FormData`, routed through `apiClient.uploadImage()` and topup receipt submission. |
| Charts | No charting library was found in current package usage. Dashboard metrics use cards/lists. |
| Cache | Zustand persisted state and in-memory request de-duplication. No React Query/SWR. |
| Tests | No test runner or `test` script is currently configured. |
| Special dependencies | `@google/genai`, `better-sqlite3`, `dotenv`, and `express` are in `package.json` but are not clearly used by the main `src` React app. Treat them as tooling/legacy until verified. |

## 3. Folder Structure

Top level frontend files:

| Path | Purpose |
| --- | --- |
| `package.json` | Scripts and dependencies. |
| `vite.config.js` | Vite plugins, alias config, manual chunks, dev server/HMR behavior, and selected env definitions. |
| `index.html` | SPA HTML shell, favicon links, Google font imports, app root. |
| `tsconfig.json` | Type checking config. `allowJs` is enabled, and `@/*` maps to the project root. |
| `public/` | Static assets served directly. Includes `_redirects` for SPA fallback hosting. |
| `dist/` | Build output. This should be treated as generated output. |
| `scripts/` | Utility scripts such as favicon generation. |
| `ENVIRONMENT_CONFIG.md`, `ENVIRONMENT_SETUP.md`, and other docs | Supplemental docs. Some may describe older fixes or setup notes and should be cross-checked against code. |

### `src/`

| Path | Purpose |
| --- | --- |
| `src/App.jsx` | Main router and provider composition. Defines all application routes. |
| `src/main.jsx` | React entrypoint. Installs browser error suppressors for extension permission errors and cleans old product storage shape. |
| `src/index.css` | Global CSS and Tailwind import. |
| `src/i18n.js` | i18next initialization for Arabic and English resources. |
| `src/theme/tokens.css` | Theme tokens used by the UI. |

### `src/pages`

Route page components. Important groups:

| Path | Purpose |
| --- | --- |
| `src/pages/Dashboard.jsx` | Public/protected storefront landing and product discovery page. |
| `src/pages/Products.jsx` | Authenticated product catalog and purchase entry point. |
| `src/pages/ProductDetails.jsx` | Public product link handler that redirects into catalog request flow. |
| `src/pages/Auth.jsx` | Login/register/auth page. |
| `src/pages/Wallet.jsx` | Customer wallet and transaction history. |
| `src/pages/AddBalance.jsx` | Customer add-balance method selection. |
| `src/pages/PaymentDetails.jsx` | Topup receipt submission page. |
| `src/pages/Orders.jsx` | Customer order history. |
| `src/pages/Account.jsx` | Profile editing and avatar update. |
| `src/pages/AccountSecurity.jsx` | 2FA/API token related security page. |
| `src/pages/Settings.jsx` | Account settings shell. |
| `src/pages/ApiDocs.jsx` | API token/developer documentation for users with API access enabled. |
| `src/pages/CreatedByPage.jsx`, `src/pages/About.jsx` | Informational pages. |
| `src/pages/admin/` | Admin and supervisor operational pages. |
| `src/pages/wallet/` | Duplicate/legacy wallet page files. The active router imports the root-level wallet pages. |

### `src/pages/admin`

| Path | Purpose |
| --- | --- |
| `AdminDashboard.jsx` | Admin metrics, pending approvals, recent orders/topups/products, supplier balances. |
| `ManagerDashboard.jsx` | Alternate manager/supervisor dashboard route. |
| `AdminUsers.jsx` | Customer/user management, approvals, API access, balances, group/currency/credit limit, password reset, delete/restore, supervisor demotion. |
| `AdminSupervisors.jsx` | Supervisor promotion and permission management. Admin-only route. |
| `AdminGroups.jsx` | Customer group CRUD and discount management. |
| `AdminProducts.jsx` | Product/category CRUD, provider product mapping, dynamic fields, image upload. |
| `AdminOrders.jsx` | Paginated admin order management and supplier status sync. |
| `AdminPayments.jsx` | Topup/deposit review, approval/rejection/editing. |
| `AdminWallet.jsx` | Wallet operations, balances, financial operations view. |
| `AdminUserTransactions.jsx` | Per-user wallet transactions and balance actions. |
| `AdminPaymentMethods.jsx` | Payment group and method configuration. Admin-only route. |
| `AdminCurrencies.jsx` | Currency CRUD/rate management. Admin-only route. |
| `AdminSuppliers.jsx` | Supplier/provider config, connection tests, product sync, balance/order debug tools. |

### `src/components`

| Path | Purpose |
| --- | --- |
| `src/components/layout/` | `Layout`, `Sidebar`, `Header`, wallet sidebar card, and app shell behavior. |
| `src/components/auth/` | Protected route wrapper, auth visual components, logout confirmation, account access state pages. |
| `src/components/ui/` | Shared UI primitives: buttons, cards, badges, inputs, loaders, modals, search bars, switches, tables, theme/language toggles, toasts, WhatsApp floating button. |
| `src/components/products/` | Product cards, search bar, product purchase sheet/modal, product details sheet, loading/empty states. |
| `src/components/orders/` | Order filter components, cards, detail drawer, pagination helpers. |
| `src/components/wallet/` | Wallet cards, filter bar, transaction cards, receipt upload, stats. |
| `src/components/account/` | OTP input and 2FA card. |
| `src/components/admin/` | Admin broadcast modal. |
| `src/components/admin-dashboard/` | Admin dashboard widgets. |
| `src/components/home/`, `src/components/payment/`, `src/components/settings/`, `src/components/notifications/` | Feature-specific reusable UI. |

### `src/services`

| Path | Purpose |
| --- | --- |
| `client.js` | Selects `realApi` or `mockApi` based on `VITE_DATA_PROVIDER`. |
| `realApi.js` | Axios REST client, token handling, refresh logic, response normalizers, API method groups. |
| `mockApi.js` | LocalStorage-backed mock backend. Useful for UI development without a backend. |
| `api.js` | Legacy Axios helper and product fallback. No current imports were found from active stores/pages. |
| `accountSecurityApi.js` | Thin wrapper for 2FA and API token operations. |

### `src/store`

Zustand stores:

| Path | Purpose |
| --- | --- |
| `useAuthStore.js` | Auth session, user, token, blocked account status, 2FA challenge, profile refresh. |
| `useAdminStore.js` | Users, supervisors, wallets, deleted users, per-user transactions, admin user actions. |
| `useMediaStore.js` | Products and categories. |
| `useOrderStore.js` | Customer/admin orders and order status updates. |
| `useTopupStore.js` | Deposits/topups and review actions. |
| `useSystemStore.js` | Currencies and payment settings. |
| `useGroupStore.js` | Customer groups. |
| `useNotificationStore.js` | Notifications and unread count. |

### `src/context`

| Path | Purpose |
| --- | --- |
| `ThemeContext.jsx` | Light/dark theme state persisted to `localStorage`. Default is dark. |
| `LanguageContext.jsx` | Arabic/English language state. The app intentionally returns RTL direction for both languages to avoid layout shifts. |

### `src/utils`

Important utilities include:

| Path | Purpose |
| --- | --- |
| `authRoles.js` | Role normalization, role aliases, permission checks, default role routes. |
| `accountStatus.js` | Account status normalization and blocked account route mapping. |
| `authErrors.js` | Auth error classification helpers. |
| `navigation.js` | Route navigation helpers. |
| `imageUrl.js` | Image URL normalization using API base URL. |
| `validation.js` | Product validation helpers. |
| `money.js`, `pricing.js`, `intlFormat.js`, `currencyCountryMap.js` | Currency, price, and formatting helpers. |
| `orders.js`, `orderStatus.js`, `productStatus.js`, `productPurchase.js` | Order/product status and purchase helpers. |
| `paymentSettings.js` | Payment settings helpers. |
| `transactionCurrency.js` | Transaction currency helpers. |
| `storefront.js` | Product display/storefront mapping helpers. |
| `whatsapp.js` | WhatsApp contact link helpers. |
| `devLogger.js` | Development logging helper. |

### Assets, Config, Hooks, Tests

| Area | Current status |
| --- | --- |
| `src/assets` | Logos, slides, and optimized `.webp` assets. |
| `src/config` | No dedicated `src/config` folder was found. Runtime config is mostly env-driven and implemented in services/utils. |
| `src/hooks` | No dedicated `src/hooks` folder was found. Hook-like behavior is mostly Zustand stores and contexts. |
| Tests | No `tests` folder or test script was found. |

## 4. Setup & Installation

### Prerequisites

- Node.js and npm installed. The repo does not pin an exact Node version. Use a current LTS release compatible with Vite 6 and React 19.
- Access to the backend API if running with `VITE_DATA_PROVIDER=real`.
- A browser with `localStorage` enabled.

### Install

```bash
cd Frontend
npm install
```

### Development Server

```bash
npm run dev
```

The `dev` script starts Vite with:

```bash
vite --port=3000 --host=0.0.0.0
```

Expected local URL:

```text
http://localhost:3000
```

Note: `vite.config.js` also defines `server.port = 5173`, but the npm script passes `--port=3000`, so the script wins.

### Production Build

```bash
npm run build
```

This writes the build output to `dist/`.

### Preview Production Build

```bash
npm run preview
```

Vite will print the preview URL. The default Vite preview port is commonly `4173` unless overridden by CLI/config.

### Type Check / Lint Script

```bash
npm run lint
```

This runs:

```bash
tsc --noEmit
```

There is no ESLint script configured in `package.json`.

### Tests

No automated test command is currently defined. There is no `npm test` script.

### Seed Data

There is no explicit seed command. Mock data is provided through `src/services/mockApi.js` and `src/data/mockData.js` when `VITE_DATA_PROVIDER` is not `real`.

To force mock mode:

```env
VITE_DATA_PROVIDER=mock
```

Because mock mode uses browser `localStorage`, clearing site data resets the local mock state.

### Common Startup Problems

| Problem | Likely cause | Fix |
| --- | --- | --- |
| App starts but data looks fake | `VITE_DATA_PROVIDER` is unset, so the app defaults to mock mode. | Set `VITE_DATA_PROVIDER=real` and configure `VITE_API_BASE_URL`. |
| Requests go to production backend unexpectedly | `.env.local` overrides other env files and currently contains the production backend URL. | Check `.env.local`, `.env.development`, and `.env`. |
| Login works in backend but not frontend | Token/response shape may not match frontend normalizers. | Inspect `src/services/realApi.js` auth normalizers and backend auth response. |
| 401 after page reload | Missing or unsupported refresh token flow. | `realApi.js` attempts `/auth/refresh`; if backend does not support it, user may be forced out. |
| Dev server port already used | Port 3000 is occupied. | Run Vite manually with another port, or stop the conflicting process. |
| HMR does not work | `DISABLE_HMR=true` in environment. | Remove or set `DISABLE_HMR=false`. |
| Old/stale UI data | Persisted Zustand/localStorage data. | Clear browser site data or remove specific storage keys such as `auth-storage`, `products-storage`, `orders-storage`. |
| CORS/API errors | Backend URL, CORS config, or API path mismatch. | Verify backend API base path ends with `/api` if required. |

## 5. Environment Variables

Vite exposes only variables prefixed with `VITE_` to browser code. Non-`VITE_` variables in frontend env files are not available in client code unless used by tooling.

Loaded env files found:

- `.env`
- `.env.development`
- `.env.local`
- `.env.example`

Legacy/reference files also exist:

- `env.development`
- `env.download`

Those legacy files are not automatically loaded by Vite unless renamed or explicitly loaded.

| Variable | Required | Example | Purpose | Used in |
| --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Required for real API mode. Optional in code because a production fallback exists. | `http://localhost:5000/api` | Base URL for backend API requests. | `src/services/realApi.js`, `src/utils/imageUrl.js`, `src/pages/ApiDocs.jsx`, `vite.config.js` define block. |
| `VITE_DATA_PROVIDER` | Optional, but important. Defaults to mock. | `real` or `mock` | Selects real backend client or local mock client. | `src/services/client.js`, stores such as `useMediaStore`, `useAdminStore`, `useOrderStore`, `useTopupStore`, `useGroupStore`, `useSystemStore`. |
| `VITE_ADMIN_WHATSAPP_NUMBER` | Optional. | `+201010243175` | WhatsApp support/contact number. | `src/utils/whatsapp.js`. |
| `VITE_APP_ENV` | Optional. | `development` | App environment marker. Defined into `process.env.VITE_APP_ENV` by Vite config; limited runtime usage found. | `vite.config.js`, env files. |
| `VITE_APP_MODE` | Optional. | `development` | Additional app mode marker. No direct `src` usage found during inspection. | Env files. |
| `VITE_API_URL` | Optional legacy/alternate. | `http://localhost:5000/api` | Alternate API base URL used only by API docs fallback. | `src/pages/ApiDocs.jsx`. |
| `ADMIN_WHATSAPP_NUMBER` | Optional fallback. | `+201010243175` | Non-Vite fallback read in WhatsApp helper through `import.meta.env`; may not be exposed by Vite unless configured. Prefer `VITE_ADMIN_WHATSAPP_NUMBER`. | `src/utils/whatsapp.js`. |
| `DISABLE_HMR` | Optional shell variable. | `true` | Disables Vite HMR when true. Not a browser env var. | `vite.config.js`. |
| `GEMINI_API_KEY` | Optional/unclear. | `your_gemini_api_key_here` | Present in env files and `package.json` includes `@google/genai`, but no active `src` usage was found. | Needs verification. |
| `APP_URL` | Optional/unclear. | `http://localhost:3000` | Present in env files, but no active `src` usage was found. | Needs verification. |

Recommended local development env:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DATA_PROVIDER=real
VITE_ADMIN_WHATSAPP_NUMBER=+201010243175
VITE_APP_ENV=development
VITE_APP_MODE=development
```

## 6. App Routing

Routes are defined in `src/App.jsx`.

### Public Routes

| Path | Page/component | Layout | Protection | Purpose |
| --- | --- | --- | --- | --- |
| `/` | `Dashboard` | No app layout | Public | Public storefront/home dashboard. |
| `/catalog` | Redirect to `/products` | No app layout | Public redirect | Legacy/catalog alias. |
| `/about` | `About` | No app layout | Public | About page. |
| `/created-by` | `CreatedByRoute` | No app layout when unauthenticated | Public with auth redirect | Shows public created-by page or redirects authenticated users to `/app/created-by`. |
| `/products/:id` | `ProductDetails` | No app layout | Redirects unauthenticated users to `/auth` | Product deep link handler. Authenticated users are redirected to `/products?request=:id`. |
| `*` | Redirect to `/` | N/A | Public fallback | Catch-all route. |

### Auth Routes

| Path | Page/component | Layout | Protection | Purpose |
| --- | --- | --- | --- | --- |
| `/auth` | `Auth` | No app layout | Public | Login/register page. |
| `/login` | `Auth` | No app layout | Public | Login alias. |
| `/email-verified` | `EmailVerified` | No app layout | Public | Email verification result page. |
| `/auth/account-pending` | `AccountPending` | No app layout | Public | Pending approval page. |
| `/auth/account-rejected` | `AccountRejected` | No app layout | Public | Rejected account page. |
| `/auth/verify-email` | `AccountVerificationRequired` | No app layout | Public | Verification required page. |
| `/account-pending` | Redirect | N/A | Public | Legacy redirect to `/auth/account-pending`. |
| `/account-rejected` | Redirect | N/A | Public | Legacy redirect to `/auth/account-rejected`. |

### Customer/User Routes

All routes below are wrapped by `Layout`.

| Path | Page/component | Required role/condition | Purpose |
| --- | --- | --- | --- |
| `/dashboard` | `Dashboard` | `CUSTOMER`, `ADMIN`, or `SUPERVISOR` | Authenticated dashboard/storefront route. |
| `/products` | `Products` | `CUSTOMER`, `ADMIN`, or `SUPERVISOR` | Product catalog and purchase flow. |
| `/wallet` | `Wallet` | `CUSTOMER` | Customer wallet and transaction history. |
| `/orders` | `Orders` | `CUSTOMER` | Customer orders. |
| `/wallet/add-balance` | `AddBalance` | `CUSTOMER` | Select payment method for topup. |
| `/wallet/payment-details/:methodId` | `PaymentDetails` | `CUSTOMER` | Submit topup details and receipt. |
| `/app/created-by` | `CreatedByPage` embedded | `CUSTOMER` or `SUPERVISOR` | Authenticated created-by page. |
| `/settings` | `Settings` | Any authenticated approved user | Settings shell. |
| `/account` | `Account` | Any authenticated approved user | Profile editing. |
| `/account-security` | `AccountSecurity` | Any authenticated approved user | 2FA/API token security. |
| `/api-docs` | `ApiDocsRoute` | Authenticated user with `user.isApiEnabled === true` | API token docs. Otherwise redirects to default role route. |

### Admin Routes

| Path | Page/component | Required role/permission | Purpose |
| --- | --- | --- | --- |
| `/admin` | Redirect | `ADMIN` or `SUPERVISOR` | Redirects to `/admin/dashboard`. |
| `/admin/dashboard` | `AdminDashboard` | `ADMIN` or `SUPERVISOR` with `dashboard.view` | Admin metrics and operations dashboard. |
| `/manager/dashboard` | `ManagerDashboard` | `ADMIN` or `SUPERVISOR` with `dashboard.view` | Alternate manager dashboard. |
| `/admin/users` | `AdminUsers` | `users.view` | Customer/user management. |
| `/admin/users/:userId/transactions` | `AdminUserTransactions` | `wallet.view` | User wallet transactions. |
| `/admin/groups` | `AdminGroups` | `groups.manage` | Customer group management. |
| `/admin/products` | `AdminProducts` | `products.view` | Product and category management. |
| `/admin/wallet` | `AdminWallet` | `wallet.view` | Wallet/balance operations. |
| `/admin/orders` | `AdminOrders` | `orders.view` | Order management. |
| `/admin/topups` | Redirect to `/admin/payments` | `topups.review` | Legacy route. |
| `/admin/payments` | `AdminPayments` | `topups.review` | Topup/deposit review. |
| `/admin/suppliers` | `AdminSuppliers` | `suppliers.manage` | Supplier/provider management. |
| `/admin/supervisors` | `AdminSupervisors` | `ADMIN` only | Supervisor promotion and permissions. |
| `/admin/payment-methods` | `AdminPaymentMethods` | `ADMIN` only | Payment group/method settings. |
| `/admin/currencies` | `AdminCurrencies` | `ADMIN` only | Currency settings. |

### Supervisor Routes

Supervisors use the same admin routes as admins, but only routes protected by permissions are available. Admin-only routes are not available to supervisors:

- `/admin/supervisors`
- `/admin/payment-methods`
- `/admin/currencies`

Supervisor access is determined by:

- Normalized role in `src/utils/authRoles.js`.
- Permission checks in `src/components/auth/ProtectedRoute.jsx`.
- Sidebar item filtering in `src/components/layout/Sidebar.jsx`.

### Error/Not Found Routes

There is no dedicated 404 page. The catch-all route redirects to `/`.

## 7. Authentication Flow

### Login Page

The login/register UI is implemented in `src/pages/Auth.jsx`. The auth store action is `useAuthStore.login()`.

Real login calls:

```text
POST /auth/login
```

Implemented in:

- `src/store/useAuthStore.js`
- `src/services/realApi.js`
- `src/services/mockApi.js`

### Login Success

On normal login success, the frontend expects a response containing a user and token, usually through a backend envelope:

```json
{
  "success": true,
  "data": {
    "user": {},
    "token": "jwt-or-access-token",
    "refreshToken": "optional-refresh-token"
  }
}
```

The real client normalizes fields such as role, permissions, 2FA flags, API token, wallet balance, group fields, currency, status, and account dates.

### Register Flow

Register calls:

```text
POST /auth/register
```

The frontend does not authenticate the user immediately after registration. Instead, it stores a blocked/access status and routes the user to one of:

- `/auth/verify-email`
- `/auth/account-pending`
- `/auth/account-rejected`

The actual route depends on normalized account status.

### Token/Session Storage

Auth state is persisted by Zustand under:

```text
localStorage key: auth-storage
```

Persisted fields include:

- `user`
- `token`
- `isAuthenticated`
- `blockedStatus`
- `blockedUser`
- `profileLastLoadedAt`

### Auth Header

`src/services/realApi.js` attaches the token on each request:

```http
Authorization: Bearer <token>
```

### Refresh Session Logic

`realApi.js` attempts token refresh through:

```text
POST /auth/refresh
```

Important behavior:

- Concurrent 401-triggered refresh attempts are queued.
- If refresh succeeds, the original request is retried with the new token.
- If `/auth/refresh` returns 404, refresh is marked unsupported for the current browser session.
- If refresh fails, local auth is cleared and an `auth:force-logout` browser event is dispatched.

`src/components/auth/SessionBootstrap.jsx` also attempts to refresh the session/profile on app startup.

### Logout

`useAuthStore.logout()` calls the API client logout and clears local session state.

`realApi.auth.logout()` clears local frontend state and then best-effort posts:

```text
POST /auth/logout
```

The real API client also clears related local storage keys, including:

- `admin-ui-storage`
- `group-storage`
- `products-storage`
- `orders-storage`
- `topups-storage`
- `notifications-storage`
- auth token/session fields

### Protected Routes

Protected route logic is in:

```text
src/components/auth/ProtectedRoute.jsx
```

It checks:

- Whether a user is authenticated.
- Whether account status is approved.
- Whether the normalized role matches allowed roles.
- Whether required permission keys are present.

If unauthorized:

- Unauthenticated users go to `/auth`, or a blocked access page if a blocked status is known.
- Pending/rejected/verification-required accounts go to the matching account access page.
- Role/permission denied users are redirected to `getDefaultRouteForRole(user.role)`.

### Current User/Profile Loading

Profile loading uses:

```text
GET /users/me
```

This is called through:

- `useAuthStore.refreshProfile()`
- `SessionBootstrap`
- Some account/admin flows after changes.

The store uses a 60 second profile cache and de-duplicates simultaneous profile refreshes.

### 2FA

2FA support exists in the frontend:

| Operation | Endpoint | Files |
| --- | --- | --- |
| Generate 2FA setup | `POST /auth/2fa/generate` | `realApi.js`, `accountSecurityApi.js`, `TwoFactorCard` |
| Enable 2FA | `POST /auth/2fa/enable` | `realApi.js`, `accountSecurityApi.js`, `TwoFactorCard` |
| Disable 2FA | `POST /auth/2fa/disable` | `realApi.js`, `accountSecurityApi.js`, `TwoFactorCard` |
| Verify 2FA login challenge | `POST /auth/verify-2fa` | `useAuthStore.js`, `realApi.js` |

If login returns `requires2FA`, the auth store stores a temporary two-factor challenge instead of authenticating the user.

### Google/Social Login

Google login is implemented by redirecting the browser to:

```text
<VITE_API_BASE_URL>/auth/google
```

The callback parser expects URL parameters such as:

- `token`
- `status`
- `message`

If `token` is present, the frontend stores the token and fetches the profile. If `status` indicates a blocked/approval state, the user is routed to the matching access page.

### Approval / Activation Flow

Account status normalization lives in `src/utils/accountStatus.js`. Supported normalized statuses include:

- `approved`
- `verification_required`
- `pending`
- `rejected`

The UI routes non-approved users away from protected app pages.

### Auth Error Cases

Common error cases handled by the frontend:

- Invalid login credentials.
- 2FA required or invalid code.
- Email verification required.
- Pending account approval.
- Rejected account.
- Expired/invalid token.
- Refresh token unsupported or failed.
- Permission denied route access.

## 8. API Layer

### Base API Client

The active client is selected in:

```text
src/services/client.js
```

```js
export const apiClient = provider === 'real' ? realApi : mockApi;
```

### Real API Client

File:

```text
src/services/realApi.js
```

Important defaults:

| Setting | Value |
| --- | --- |
| Base URL | `VITE_API_BASE_URL || https://ibra-backend.onrender.com/api` |
| Timeout | `180000` ms |
| Content-Type | Not forced globally, to avoid breaking `FormData`. |
| Auth storage key | `auth-storage` |
| Payment settings cache key | `payment-settings-cache` |

### Request Handling

The request interceptor:

- Reads the persisted token from `auth-storage`.
- Adds `Authorization: Bearer <token>` when available.
- Leaves `FormData` content type to the browser.

### Response Handling

The response interceptor:

- Returns normal responses directly.
- On token-related 401 errors, attempts refresh if a refresh token exists.
- Retries the original request after successful refresh.
- Clears auth and dispatches `auth:force-logout` when refresh fails.

Most API methods call an internal `unwrap()` helper that accepts both:

```json
{ "success": true, "message": "OK", "data": {} }
```

and raw response bodies.

### Error Handling

`realApi.js` wraps Axios errors into objects with:

- `message`
- `status`
- `code`
- original response/body details where available

Pages and stores generally catch errors and show a toast or set store error state.

### Main API Service Groups

The real client exposes grouped methods. Endpoint details below are based on the current frontend code.

#### Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `login` | `POST /auth/login` | Login with email/password. |
| `verify2FA` | `POST /auth/verify-2fa` | Complete 2FA login challenge. |
| `generate2FA` | `POST /auth/2fa/generate` | Generate 2FA setup data. |
| `enable2FA` | `POST /auth/2fa/enable` | Enable 2FA with OTP. |
| `disable2FA` | `POST /auth/2fa/disable` | Disable 2FA. |
| `loginWithGoogle` | Browser redirect to `/auth/google` | Start Google OAuth. |
| `register` | `POST /auth/register` | Register new account. |
| `resendVerification` | `POST /auth/resend-verification` | Resend verification email. |
| `getProfile` | `GET /users/me` | Load current profile. |
| `refreshSession` | `POST /auth/refresh` | Refresh access token/session. |
| `logout` | `POST /auth/logout` best effort | Logout and clear local storage. |

#### Users and Supervisors

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `list` | `GET /admin/users` | Paginated users list. |
| `listSupervisors` | `GET /admin/supervisors` | Supervisors list. |
| `getById` | `GET /admin/users/:id` | User details. |
| `updateStatus` | `PATCH /admin/users/:id/approve`, `PATCH /admin/users/:id/reject`, or generic patch | Approve/reject/update status. |
| `updateRole` | `PATCH /admin/users/:id/role` | Change role, including supervisor promotion/demotion. |
| `updateSupervisorPermissions` | `PATCH /admin/supervisors/:id/permissions` | Update supervisor permissions. |
| `addCoins` | `POST /admin/wallets/:userId/add` or deduct equivalent | Add/deduct balance. |
| `updateGroup` | `PATCH /admin/users/:id` | Update group fields. |
| `updateCurrency` | `PATCH /admin/users/:id/currency` | Update user currency. |
| `resetPassword` | `POST /admin/users/:id/reset-password` | Reset/generate password. |
| `delete` | `DELETE /admin/users/:id` | Delete user. |
| `restore` | Multiple candidate restore endpoints | Restore deleted user. |
| `updateAvatar` | User avatar endpoint with file or URL | Update avatar. |
| `updateProfile` | Profile update endpoint | Update profile fields. |
| `regenerateApiToken` | `PATCH /users/me/api-token` | Regenerate current user's API token. |

#### Products and Categories

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `products.list` | Public/admin product endpoints with fallback logic | Load catalog/admin products. |
| `products.get` | Product detail endpoint | Load product. |
| `products.create` | Admin product endpoint | Create product. |
| `products.update` | Admin product endpoint | Update product. |
| `products.toggleStatus` | Admin product status endpoint | Toggle product active/visibility status. |
| `products.delete` | `DELETE /admin/products/:id` | Delete product. |
| `products.listProviders` | `GET /admin/providers` | Load providers for product mapping. |
| `products.listProviderProducts` | `GET /admin/provider-products/:providerId` | Load provider products. |
| `products.getSyncedPrice` | `GET /admin/provider-products/item/:providerProductId/price` | Get provider synced price. |
| `categories.create` | `POST /admin/categories` | Create category. |
| `categories.update` | `PATCH /admin/categories/:id` | Update category. |
| `categories.toggle` | `PATCH /admin/categories/:id/toggle` | Toggle category. |
| `categories.delete` | `DELETE /admin/categories/:id` | Delete category. |

#### Orders

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `orders.list` | User/admin order endpoint selected by args | Load orders. |
| `orders.listPaginated` | `GET /admin/orders?...` | Admin paginated orders. |
| `orders.getById` | Multiple candidate endpoints | Load one order. |
| `orders.create` | Candidate order create endpoint | Create customer order. |
| `orders.updateStatus` | `PATCH /admin/orders/:id/status` | Update order status. |
| `orders.syncSupplierStatus` | `POST /admin/orders/:id/sync-status` | Sync order with provider/supplier. |

#### Topups / Deposits

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `topups.list` | User/admin deposit endpoint selected by args | Load topups/deposits. |
| `topups.getById` | Candidate deposit detail endpoints | Load topup. |
| `topups.create` | `POST /me/deposits` | Submit deposit/topup request. |
| `topups.approve` | `PATCH /admin/deposits/:id/approve` | Approve deposit. |
| `topups.reject` | `PATCH /admin/deposits/:id/reject` | Reject deposit. |
| `topups.updateRequest` | `PATCH /admin/deposits/:id` | Edit deposit request. |

#### Wallet

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `adminWallets.list` | `GET /admin/wallets` | Admin wallets list. |
| `adminWallets.getByUserId` | `GET /admin/wallets/:userId` | User wallet. |
| `adminWallets.getTransactionsByUserId` | Multiple candidate transaction endpoints | User transactions. |
| `wallet.getStats` | `GET /wallet/stats` | Current user wallet stats. |
| `wallet.getTransactions` | `GET /wallet/transactions` | Current user wallet transactions. |

#### System Settings

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `system.currencies` | `GET /currencies/active`, fallback `/admin/currencies` | Active currencies. |
| `system.addCurrency` | `POST /admin/currencies` | Create currency. |
| `system.updateCurrency` | `PATCH /admin/currencies/:code` | Update currency. |
| `system.deleteCurrency` | `PATCH /admin/currencies/:code` with `isActive:false` | Soft-disable currency. |
| `system.paymentSettings` | `GET /settings/payment`, fallback `/admin/settings` | Payment settings. |
| `system.updatePaymentSettings` | Multiple `/admin/settings/:key` patches | Save payment settings. |
| `system.allSettings` | `GET /admin/settings` | Load all settings. |
| `system.getSetting` | `GET /admin/settings/:key` | Load one setting. |
| `system.updateSetting` | `PATCH /admin/settings/:key` | Update one setting. |

#### Suppliers / Providers

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `suppliers.list` | `GET /admin/providers` | List providers. |
| `suppliers.get` | `GET /admin/providers/:id` | Get provider. |
| `suppliers.create` | `POST /providers` | Create provider. This may need backend verification because other provider endpoints use `/admin/providers`. |
| `suppliers.update` | `PATCH /admin/providers/:id` | Update provider. |
| `suppliers.deactivate` | `PATCH /admin/providers/:id/toggle` | Toggle provider active state. |
| `suppliers.testConnection` | `POST /admin/providers/:id/test-connection` | Test provider credentials. |
| `suppliers.syncProducts` | `POST /admin/catalog/sync/:id` | Sync provider products. |
| `suppliers.getBalance` | `GET /admin/providers/:id/balance` | Provider balance. |
| `suppliers.getLiveProducts` | `GET /admin/providers/:id/products` | Live provider catalog. |
| `suppliers.checkOrder` | `GET /admin/providers/:id/check-order?orderId=...` | Provider order status check. |
| `suppliers.delete` | `DELETE /admin/providers/:id` | Delete provider. |

#### Notifications and Audit

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `notifications.list` | `GET /me/notifications` | Load current user notifications. |
| `notifications.unreadCount` | `GET /me/notifications/unread-count` | Load unread count. |
| `notifications.markAsRead` | `PATCH /me/notifications/:id/read` | Mark one read. |
| `notifications.markAllAsRead` | `PATCH /me/notifications/read-all` | Mark all read. |
| `notifications.clearRead` | `DELETE /me/notifications/read` | Clear read notifications. |
| `notifications.createBroadcast` | `POST /notifications` | Broadcast notification. |
| `audit.list` | `GET /admin/audit` | Admin audit list. |
| `audit.actorLogs` | `GET /admin/audit/actor/:actorId` | Logs by actor. |

### Legacy API Helper

`src/services/api.js` defines a separate Axios helper and a `fetchProducts` fallback, but no active imports were found from current pages/stores. Treat it as legacy unless a future route imports it.

### Direct Browser-Side External Services

| Service | Purpose | Files | Notes |
| --- | --- | --- | --- |
| Backend API | Primary application data, auth, orders, wallet, admin operations. | `src/services/realApi.js` | Base URL comes from `VITE_API_BASE_URL`. |
| Google OAuth | Social login start and callback token/status handling. | `src/services/realApi.js`, `src/store/useAuthStore.js` | Frontend redirects to backend `/auth/google`; backend owns OAuth provider details. |
| WhatsApp deep links | Support/contact links. | `src/utils/whatsapp.js`, `FloatingWhatsApp`, sidebar/account access pages | Number comes from `VITE_ADMIN_WHATSAPP_NUMBER` or fallback values. |
| Rest Countries API | Currency metadata lookup in admin currency page. | `src/pages/admin/AdminCurrencies.jsx` | Browser fetch to `https://restcountries.com/v3.1/all?fields=name,currencies`. |
| Backend image upload | Product/payment images and deposit receipts. | `realApi.uploadImage`, `AdminProducts`, `AdminPaymentMethods`, `PaymentDetails` | Upload validation is partly client-side and must also be enforced backend-side. |
| Google Fonts | Web font loading in HTML shell. | `index.html` | Loaded directly by the browser. |
| UI Avatars | Fallback avatar images. | User/avatar normalization and UI usage | External image service fallback. Verify privacy requirements before exposing user names/emails. |

## 9. State Management

### Storage Keys

| Store | File | Persist key | Main data |
| --- | --- | --- | --- |
| Auth | `src/store/useAuthStore.js` | `auth-storage` | User, token, auth status, blocked status. |
| Admin | `src/store/useAdminStore.js` | `admin-ui-storage` | Only cache timestamps are persisted to avoid persisting admin PII. |
| Products/categories | `src/store/useMediaStore.js` | `products-storage` | Products, categories, timestamps. |
| Orders | `src/store/useOrderStore.js` | `orders-storage` | User/admin order lists and pagination. |
| Topups | `src/store/useTopupStore.js` | `topups-storage` | Topup/deposit lists and summary. |
| Groups | `src/store/useGroupStore.js` | `group-storage` | Customer groups. |
| Notifications | `src/store/useNotificationStore.js` | `notifications-storage` | Notifications, unread count, pagination. |
| System | `src/store/useSystemStore.js` | None | Currencies and payment settings kept in memory, with separate payment settings cache in API client. |

### `useAuthStore`

State:

- `user`
- `token`
- `isAuthenticated`
- `isLoading`
- `error`
- `blockedStatus`
- `blockedUser`
- `twoFactorChallenge`
- `profileLastLoadedAt`

Actions:

- `login`
- `verifyTwoFactorChallenge`
- `clearTwoFactorChallenge`
- `loginWithGoogle`
- `signup`
- `logout`
- `updateUserSession`
- `refreshProfile`
- `hasPermission`
- `hasAnyPermission`
- `hasAllPermissions`
- `setBlockedAccess`
- `clearBlockedAccess`

Notes:

- Profile refresh has a 60 second cache and request de-duplication.
- Signup sets access status instead of logging the user in.
- Login may produce a 2FA challenge instead of a session.

### `useAdminStore`

State:

- `users`
- `deletedUsers`
- `usersPagination`
- `usersCurrentPage`
- `usersLastLoadedAt`
- `wallets`
- `walletsLastLoadedAt`
- `userWalletTransactions`
- loading/error flags

Actions include:

- `loadUsers`
- `loadUsersPage`
- `loadSupervisors`
- `getUserById`
- `updateUserStatus`
- `updateUserCoins`
- `setUserBalance`
- `updateUserGroup`
- `updateUserRole`
- `updateSupervisorPermissions`
- `updateUserCurrency`
- `updateUserCreditLimit`
- `deleteUser`
- `restoreUser`
- `updateUserAvatar`
- `updateUserProfile`
- `resetUserPassword`

Important behavior:

- Users cache TTL is about 90 seconds.
- Wallet cache TTL is about 60 seconds.
- Real provider bypasses some hydrated cache on the first session.
- Updating a user's group clears product cache and refreshes the current user if affected.
- Balance operations intentionally re-fetch users/wallets/transactions instead of optimistic mutation.

### `useMediaStore`

State:

- `products`
- `categories`
- `isLoading`
- `error`
- `lastLoadedAt`

Actions:

- `loadProducts`
- `resetProducts`
- `addProduct`
- `updateProduct`
- `toggleProductStatus`
- `deleteProduct`
- `addCategory`
- `updateCategory`
- `deleteCategory`
- `fetchProducts`

Important behavior:

- Product/category cache TTL is about 5 minutes.
- Product normalization handles provider mapping, inventory, schedules, visibility, dynamic fields, API availability, synced pricing, and manual pricing.
- Deleting a category also removes products under that category from the local store state.

### `useOrderStore`

State:

- `orders`
- `ordersLastLoadedAt`
- `ordersLastLoadedScope`
- `adminOrders`
- `adminPagination`
- `adminOrdersLoading`

Actions:

- `loadOrders`
- `loadAdminOrders`
- `getOrderById`
- `addOrder`
- `updateOrderStatus`
- `syncOrderSupplierStatus`

Important behavior:

- Order cache TTL is about 60 seconds per scope.
- `addOrder` builds a financial snapshot with currency conversion and pricing values before creating an order.
- A code TODO notes that group discount in one financial snapshot path is currently hardcoded to `0` and should be verified.
- Status updates refresh related user/profile data after completion.

### `useTopupStore`

State:

- `topups`
- `topupsLastLoadedAt`
- `topupsPagination`
- `topupsSummary`
- loading/error flags

Actions:

- `loadTopups`
- `loadTopupsFiltered`
- `getTopupById`
- `requestTopup`
- `updateTopupStatus`
- `updateTopupRequest`

Important behavior:

- Cache TTL is about 60 seconds.
- Topup approval builds financial snapshot data.
- Real API maps topups to deposit endpoints.

### `useSystemStore`

State:

- `currencies`
- `paymentSettings`
- loading/error flags and timestamps

Actions:

- `loadCurrencies`
- `addCurrency`
- `updateCurrency`
- `deleteCurrency`
- `ensureDefaultCurrency`
- `loadPaymentSettings`
- `savePaymentSettings`

Important behavior:

- Currency cache TTL is about 10 minutes.
- Payment settings cache TTL is about 5 minutes.
- Payment settings include country accounts, instructions, WhatsApp number, and payment groups.

### `useGroupStore`

State:

- `groups`
- loading/error flags and timestamp

Actions:

- `loadGroups`
- `addGroup`
- `updateGroup`
- `deleteGroup`

Cache TTL is about 5 minutes.

### `useNotificationStore`

State:

- `notifications`
- `unreadCount`
- `pagination`
- `isLoading`
- `error`
- `lastLoadedAt`

Actions:

- `fetchNotifications`
- `fetchUnreadCount`
- `addNotification`
- `markAsRead`
- `markAllAsRead`
- `clearNotifications`
- `clearReadNotifications`

Cache TTL is about 30 seconds.

## 10. Supervisors / Admin / RBAC UI

This is the most security-sensitive UI area in the frontend.

### Where Supervisor Code Lives

| Area | File |
| --- | --- |
| Supervisor management page | `src/pages/admin/AdminSupervisors.jsx` |
| User management page with demotion/password reset | `src/pages/admin/AdminUsers.jsx` |
| Role and permission helpers | `src/utils/authRoles.js` |
| Route guard | `src/components/auth/ProtectedRoute.jsx` |
| Sidebar/menu filtering | `src/components/layout/Sidebar.jsx` |
| Supervisor/user store actions | `src/store/useAdminStore.js` |
| Real supervisor API calls | `src/services/realApi.js` |
| Mock supervisor behavior | `src/services/mockApi.js` |

### What A Supervisor Is In This Frontend

A supervisor is a user whose normalized role is `SUPERVISOR`. Supervisors can access selected admin pages when their user object contains the required permission keys.

The frontend also treats legacy role names as supervisor equivalents:

- `supervisor`
- `manager`
- `moderator`

These aliases normalize to `SUPERVISOR` in `src/utils/authRoles.js`.

### Difference Between Admin, Supervisor, Customer

| Role | Access behavior |
| --- | --- |
| Admin | Full admin user. `userHasPermission()` returns true for every permission. Admin-only routes are available. |
| Supervisor | Admin-surface user with explicit permission keys. Route/menu access depends on permissions. Admin-only routes are blocked. |
| Customer | Store user. Has wallet/orders/products/account access. Does not pass admin/supervisor permission checks. |

### How Frontend Identifies Current Role

`normalizeRole()` in `src/utils/authRoles.js` reads `user.role`, lowercases it, and maps aliases:

```js
admin, super_admin -> ADMIN
supervisor, manager, moderator -> SUPERVISOR
customer, user -> CUSTOMER
```

`normalizeAuthUser()` also normalizes permissions and stores them on:

- `user.permissions`
- `user.supervisorPermissions`

### How Permissions Are Stored In Frontend State

The frontend accepts either:

```json
["dashboard.view", "orders.view"]
```

or object-map style permissions:

```json
{
  "dashboard.view": true,
  "orders.view": true
}
```

The normalized user stores permission arrays in:

- `permissions`
- `supervisorPermissions`

Admin users bypass permission checks. Supervisors must have the specific key.

### Permission Keys Found In Frontend

The supervisor UI defines permission groups in `src/pages/admin/AdminSupervisors.jsx`.

| Key | Group | Active in UI | Current frontend usage |
| --- | --- | --- | --- |
| `dashboard.view` | Dashboard | Yes | Required for `/admin/dashboard` and `/manager/dashboard`; sidebar dashboard item. |
| `reports.view` | Dashboard | Yes | Defined in supervisor UI. No route guard found using this key. |
| `reports.export` | Dashboard | No, marked upcoming/locked | Defined in supervisor UI only. |
| `orders.view` | Orders | Yes | Required for `/admin/orders`; sidebar orders item. |
| `orders.update` | Orders | Yes | Defined in supervisor UI. Some order actions rely on backend enforcement rather than frontend button-level guard. |
| `orders.refund` | Orders | No, marked upcoming/locked | Defined in supervisor UI only. |
| `wallet.view` | Wallet | Yes | Required for `/admin/wallet` and `/admin/users/:userId/transactions`; sidebar wallet item. |
| `topups.review` | Wallet | Yes | Required for `/admin/payments`; sidebar payments item; `/admin/topups` redirect route. |
| `wallet.adjust` | Wallet | No, marked upcoming/locked | Defined in supervisor UI only. |
| `products.view` | Catalog | Yes | Required for `/admin/products`; sidebar products item. |
| `products.manage` | Catalog | Yes | Sidebar can show products if user has this key, but route still requires `products.view`. This is a mismatch to verify. |
| `groups.manage` | Catalog | Yes | Required for `/admin/groups`; sidebar groups item. |
| `suppliers.manage` | Catalog | No in supervisor UI, marked upcoming/locked | Required for `/admin/suppliers` route/sidebar despite being locked in supervisor UI. This means supervisors cannot grant it from the current UI. |
| `users.view` | Users | Yes | Required for `/admin/users`; sidebar users item. |
| `users.status` | Users | Yes | Defined in supervisor UI. User approval/rejection buttons are not consistently hidden by this key. |
| `users.delete` | Users | No, marked upcoming/locked | Defined in supervisor UI only. |

### Permission Defaults

`AdminSupervisors.jsx` defines:

- `ACTIVE_PERMISSION_KEYS`: all active permission keys in the UI.
- `MANAGER_DEFAULT_PERMISSIONS`: all active permission keys.
- `MODERATOR_DEFAULT_PERMISSIONS`: `dashboard.view`, `orders.view`, `orders.update`, `topups.review`, `products.view`, `users.view`.

Important: `getSupervisorPermissions(entry)` falls back to `MODERATOR_DEFAULT_PERMISSIONS` when a supervisor has no permission array. This can make the UI display permissions even if the backend returned no permissions. Verify backend behavior before relying on this fallback.

### How Routes Are Protected

`ProtectedRoute` accepts:

- `roles`
- `permissions`

Example from `src/App.jsx`:

```jsx
<Route
  path="/admin/orders"
  element={
    <AdminRoute permissions="orders.view">
      <AdminOrders />
    </AdminRoute>
  }
/>
```

`AdminRoute` is a wrapper around `ProtectedRoute` that restricts roles to:

- `ADMIN`
- `SUPERVISOR`

and passes through the required permission.

### How Sidebar/Menu Items Are Hidden Or Shown

`src/components/layout/Sidebar.jsx` defines `navItems`. Each item can have:

- `roles`
- `permissions`
- `visible`

The sidebar filters items with:

- `hasRequiredRole(user, item.roles)`
- `userHasAnyPermission(user, item.permissions)`
- optional `visible(user)`

Important details:

- Admin users see all permission-gated admin items unless a route is admin-only.
- Supervisors see items only when they have at least one required permission.
- `/admin/products` sidebar item uses `products.view` and `products.manage` as any-permission, while the route requires `products.view`.
- `/api-docs` is only visible when `user.isApiEnabled === true`.

### How Action Buttons Are Hidden/Disabled

Current behavior is mixed:

- Route access is protected by permissions.
- Sidebar access is filtered by permissions.
- Some page-level action buttons are not consistently gated by granular permissions such as `orders.update`, `users.status`, `users.delete`, `wallet.adjust`, or `products.manage`.
- Backend permission checks are therefore required for true security.

### Supervisor List Page Behavior

File:

```text
src/pages/admin/AdminSupervisors.jsx
```

Behavior:

- Admin-only route: `/admin/supervisors`.
- Loads users through `useAdminStore.loadUsers()`.
- Treats normalized `SUPERVISOR` users as supervisors.
- Candidate list excludes admins and existing supervisors.
- Search filters by name/email.
- Status filter supports:
  - `all`
  - `approved`
  - `pending`
  - `rejected`
- Summary cards show:
  - total supervisors
  - active/approved supervisors
  - pending supervisors
  - blocked/rejected supervisors

### Creating Supervisors

There is no standalone "create supervisor account" form in the frontend.

The current UI promotes an existing non-admin, non-supervisor user:

1. Admin opens `/admin/supervisors`.
2. Admin selects an existing user from the candidate dropdown.
3. Admin clicks the promote/create action.
4. Frontend calls:

```js
updateUserRole(candidateId, ROLES.SUPERVISOR, actor, defaults)
```

Real API endpoint:

```text
PATCH /admin/users/:id/role
```

The selected user becomes a supervisor. Initial permissions are derived from the UI defaults.

### Who Can Create Supervisors

Only admins can access `/admin/supervisors` in the current router:

```jsx
<ProtectedRoute roles={ADMIN_ROLES}>
  <AdminSupervisors />
</ProtectedRoute>
```

`ADMIN_ROLES` contains only the normalized admin role.

### Supervisor Login

Supervisors use the same login flow as other users:

```text
POST /auth/login
```

There is no separate supervisor login page or token flow.

After login, the frontend normalizes the returned role and permissions. Supervisors are authenticated through the same persisted auth store as admins and customers.

### Supervisor CRUD / Management Actions

| Action | Where | Frontend behavior | API/store action |
| --- | --- | --- | --- |
| List supervisors | `AdminSupervisors.jsx` | Filters loaded users by normalized role, with API fallback via `loadSupervisors`. | `loadUsers`, `loadSupervisors`, `GET /admin/supervisors`. |
| Promote user to supervisor | `AdminSupervisors.jsx` | Select existing user, update role to `SUPERVISOR`. | `updateUserRole`, `PATCH /admin/users/:id/role`. |
| Edit permissions | `AdminSupervisors.jsx` | Toggle active permission keys in grid, save. Locked/upcoming keys cannot be toggled. | `updateSupervisorPermissions`, `PATCH /admin/supervisors/:id/permissions`. |
| Activate/deactivate/block | `AdminSupervisors.jsx` | If rejected, set approved. Otherwise set rejected. | `updateUserStatus`. |
| Delete | `AdminSupervisors.jsx` | Uses `window.confirm`, then deletes user. | `deleteUser`, `DELETE /admin/users/:id`. |
| Demote to customer | `AdminUsers.jsx` | User management can change supervisor role back to customer. | `updateUserRole(userId, 'customer', actor, [])`. |
| Password reset/change | `AdminUsers.jsx` | Admin user management supports generate/reset/set manual password flows. | `resetUserPassword`, `POST /admin/users/:id/reset-password`. |

### Activation / Deactivation / Delete Behavior

`AdminSupervisors.jsx` uses user status as the activation state:

- If supervisor status is `rejected`, the action label indicates activation and sets status to `approved`.
- Otherwise the action sets status to `rejected`, effectively blocking access.
- Delete removes the underlying user through the admin user delete action.

There is no separate supervisor-specific soft delete UI besides the user delete/restore flows in admin users.

### Scope Limitations

No frontend scope fields were found for supervisors such as:

- country scope
- branch scope
- category scope
- provider scope
- order scope
- wallet scope
- report scope

Access is currently permission-key based only.

### Audit Logs / Actions

The API client exposes:

```text
GET /admin/audit
GET /admin/audit/actor/:actorId
```

No dedicated supervisor audit page was found in the active route list. Some admin store methods pass an `actor` object to API calls, but audit display/enforcement depends on backend implementation.

### Frontend Dependencies Expected By Supervisor Feature

The supervisor UI expects:

- Users to have stable `id`, `name`, `email`, `role`, `status`.
- Supervisor permissions to be returned as `permissions` or `supervisorPermissions`.
- Role update endpoint to accept a supervisor role and optional permissions.
- Permissions update endpoint to accept an array of permission keys.
- User status endpoints to approve/reject supervisors as normal users.
- Backend to enforce permissions for protected admin actions.

### Security Risks And Missing Validations

- Frontend route and sidebar guards are not sufficient security. The backend must check every privileged operation.
- Some permission keys are defined in the supervisor UI but are not used by route guards.
- Some sensitive page actions are not hidden/disabled by granular permission keys.
- `products.manage` can show the Products menu, but the route requires `products.view`.
- `suppliers.manage` is required by the route but marked inactive/upcoming in the supervisor permissions UI.
- Permission fallback defaults can make an empty permission set look like a moderator default set.
- Supervisor creation is promotion-only. Creating a new supervisor account requires registering/creating a normal user first.
- Supervisor route denial currently redirects using `getDefaultRouteForRole`, which sends supervisors to `/dashboard`, not `/admin/dashboard`.

### How To Safely Modify The Supervisors Feature

Before changing supervisor permissions, check:

- `src/pages/admin/AdminSupervisors.jsx`
- `src/utils/authRoles.js`
- `src/components/auth/ProtectedRoute.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/store/useAdminStore.js`
- `src/services/realApi.js`
- `src/services/mockApi.js`
- Backend permission constants/middleware, if available.

To add a new permission:

1. Add the permission key to `PERMISSION_GROUPS` in `AdminSupervisors.jsx`.
2. Decide whether it is active or locked/upcoming.
3. Add it to the appropriate default permission set if supervisors should receive it by default.
4. Protect the matching route in `src/App.jsx` using `AdminRoute permissions="new.key"` if route-level access is needed.
5. Update `Sidebar.jsx` so the menu item appears only for users with the right permission.
6. Add button/action-level checks inside the relevant page if the permission controls a dangerous action.
7. Update real API/backend permission definitions.
8. Update `mockApi.js` if mock mode should simulate the behavior.
9. Update frontend tests when a test suite exists.

Common mistakes to avoid:

- Adding a sidebar permission but not updating the route guard.
- Updating the route guard but leaving action buttons available inside a page.
- Adding UI permission keys that the backend does not recognize.
- Relying on admin bypass behavior while testing a supervisor-only change.
- Forgetting that role alias `manager` maps to `SUPERVISOR`.
- Treating `permissions` and `supervisorPermissions` as different sources of truth without normalizing both.

## 11. Pages & Main Features

### Dashboard / Storefront

| Item | Details |
| --- | --- |
| Path | `/`, `/dashboard` |
| Main file | `src/pages/Dashboard.jsx` |
| Stores/services | Auth store, media store, group store. |
| Actions | Load products/categories/groups, show storefront, navigate to catalog/category/product request. |
| Permissions | Public on `/`; authenticated roles on `/dashboard`. |
| Notes | The route serves both public and authenticated contexts. |

### Products / Purchase Flow

| Item | Details |
| --- | --- |
| Path | `/products`, `/products/:id` |
| Main files | `src/pages/Products.jsx`, `src/pages/ProductDetails.jsx`, `src/components/products/ProductPurchaseSheet.jsx` |
| Stores/services | Media store, order store, system store, auth store. |
| Actions | Browse/search/filter products, category navigation, purchase sheet, create order. |
| Permissions | Customer/admin/supervisor can open `/products`; purchase requires authenticated approved account and sufficient balance/credit. |
| Notes | `ProductDetails` converts deep links into `/products?request=<id>`. |

Purchase validation includes:

- Required product/order fields.
- Dynamic field requirements.
- Quantity min/max/step.
- Product availability/purchasability.
- Approved account status.
- Balance plus credit limit check.
- Currency and exchange rate snapshot.
- Idempotency key generation.

### Orders

| Item | Details |
| --- | --- |
| Customer path | `/orders` |
| Admin path | `/admin/orders` |
| Main files | `src/pages/Orders.jsx`, `src/pages/admin/AdminOrders.jsx` |
| Stores/services | Order store, media store, system store, API client. |
| Actions | List/filter orders, open detail drawer, admin status update, rejection reason, provider status sync. |
| Permissions | Customer route for customers. Admin route requires `orders.view`; updates should be backend-checked. |
| Notes | Admin search is debounced and server-paginated. |

### Wallet / Payments / Topups

| Item | Details |
| --- | --- |
| Customer paths | `/wallet`, `/wallet/add-balance`, `/wallet/payment-details/:methodId` |
| Admin paths | `/admin/wallet`, `/admin/users/:userId/transactions`, `/admin/payments` |
| Main files | `Wallet.jsx`, `AddBalance.jsx`, `PaymentDetails.jsx`, `AdminWallet.jsx`, `AdminUserTransactions.jsx`, `AdminPayments.jsx` |
| Stores/services | Topup store, admin store, system store, order store, API wallet endpoints. |
| Actions | View wallet history, submit deposit receipt, approve/reject/edit deposits, add/deduct/set balance, inspect user transactions. |
| Permissions | Customer wallet routes are customer-only. Admin wallet routes require `wallet.view`; payments require `topups.review`. |
| Notes | Wallet page merges wallet transactions, approved topups, and completed orders with deduplication/fallback logic. |

Receipt upload accepts images with these MIME types in `UploadReceiptBox`:

- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`
- `image/bmp`

Maximum receipt size is 20 MB.

### Users / Customers

| Item | Details |
| --- | --- |
| Path | `/admin/users` |
| Main file | `src/pages/admin/AdminUsers.jsx` |
| Stores/services | Admin store, group store, system store. |
| Actions | Approve/reject users, resend verification, change group/currency/credit limit, toggle API access, reset password, add/deduct/set balance, delete/restore users, demote supervisors. |
| Permissions | Route requires `users.view`. Granular action keys such as `users.status` and `users.delete` are defined but not consistently enforced in UI. |
| Notes | Approval flow can require selecting group/currency/credit limit. |

### Supervisors

| Item | Details |
| --- | --- |
| Path | `/admin/supervisors` |
| Main file | `src/pages/admin/AdminSupervisors.jsx` |
| Stores/services | Admin store. |
| Actions | Promote existing users to supervisors, edit permissions, approve/reject, delete. |
| Permissions | Admin-only route. |
| Notes | No standalone supervisor account creation form. |

### Groups

| Item | Details |
| --- | --- |
| Path | `/admin/groups` |
| Main file | `src/pages/admin/AdminGroups.jsx` |
| Stores/services | Group store, admin store. |
| Actions | Create/update/delete groups, assign users to alternative group before deleting a populated group. |
| Permissions | `groups.manage`. |
| Notes | Groups influence customer discounts and account grouping. |

### Products / Categories Admin

| Item | Details |
| --- | --- |
| Path | `/admin/products` |
| Main file | `src/pages/admin/AdminProducts.jsx` |
| Stores/services | Media store, API provider/product endpoints. |
| Actions | Product CRUD, category CRUD, status toggle, provider mapping, synced price, dynamic fields, image upload. |
| Permissions | Route requires `products.view`. `products.manage` exists but is not the route guard. |
| Notes | Product image upload validates max 20 MB before calling `uploadImage('products')`. |

### Suppliers / Providers

| Item | Details |
| --- | --- |
| Path | `/admin/suppliers` |
| Main file | `src/pages/admin/AdminSuppliers.jsx` |
| Stores/services | `apiClient.suppliers`. |
| Actions | Create/update/deactivate/delete providers, test connection, sync products, fetch live products, check provider balance/order. |
| Permissions | `suppliers.manage`. |
| Notes | The supervisor permission UI marks this key as inactive/upcoming, so granting it from UI may not be possible currently. |

### Currencies

| Item | Details |
| --- | --- |
| Path | `/admin/currencies` |
| Main file | `src/pages/admin/AdminCurrencies.jsx` |
| Stores/services | System store, Rest Countries public API. |
| Actions | Add/update/disable currencies, update rates, optional debt adjustment. |
| Permissions | Admin-only. |
| Notes | USD deletion is disabled in UI. The page fetches world currency metadata from `restcountries.com`. |

### Payment Methods

| Item | Details |
| --- | --- |
| Path | `/admin/payment-methods` |
| Main file | `src/pages/admin/AdminPaymentMethods.jsx` |
| Stores/services | System store, `apiClient.uploadImage`. |
| Actions | Manage payment groups and payment methods, upload group/method images, active toggles, fee percentages. |
| Permissions | Admin-only. |
| Notes | Payment image upload accepts common image formats and max 2 MB. |

### Notifications

| Item | Details |
| --- | --- |
| Components | `src/components/notifications/` and header notification UI. |
| Store | `src/store/useNotificationStore.js` |
| Actions | Fetch notifications/unread count, mark read/all read, clear read, add local notifications. |
| Permissions | Authenticated users. Broadcast creation is exposed in API client/admin dashboard behavior and must be backend-protected. |

### Settings / Account / Security

| Item | Details |
| --- | --- |
| Paths | `/settings`, `/account`, `/account-security`, `/api-docs` |
| Main files | `Settings.jsx`, `Account.jsx`, `AccountSecurity.jsx`, `ApiDocs.jsx` |
| Stores/services | Auth store, admin store, account security API. |
| Actions | Edit profile/avatar, 2FA setup, API token docs/regeneration, logout. |
| Permissions | Authenticated approved user. API docs require `isApiEnabled === true`. |

## 12. Components

### Layout Components

| Component | Path | Purpose |
| --- | --- | --- |
| `Layout` | `src/components/layout/Layout.jsx` | Main authenticated shell with sidebar/header, mobile overlay, back navigation behavior. |
| `Sidebar` | `src/components/layout/Sidebar.jsx` | Role/permission filtered navigation, wallet card, logout, language switch. |
| `Header` | `src/components/layout/Header.jsx` | Top bar, brand, wallet pill, notifications, theme toggle, mobile menu. |
| `WalletSidebarCard` | `src/components/layout/WalletSidebarCard.jsx` | Customer wallet summary in sidebar. |

### Auth Components

| Component | Path | Purpose |
| --- | --- | --- |
| `ProtectedRoute` | `src/components/auth/ProtectedRoute.jsx` | Auth, account status, role, and permission guard. |
| `LogoutConfirmDialog` | `src/components/auth/LogoutConfirmDialog.jsx` | Shared logout confirmation dialog. |
| `SessionBootstrap` | `src/components/auth/SessionBootstrap.jsx` | Refresh/session/profile/bootstrap loader. |
| `AccountAccessState` | `src/components/auth/AccountAccessState.jsx` | Shared pending/rejected/verification-required account state UI. |

### UI Primitives

| Component | Path | Purpose |
| --- | --- | --- |
| `Button` | `src/components/ui/Button.jsx` | Shared button primitive. |
| `Card` | `src/components/ui/Card.jsx` | Shared card primitive. |
| `Badge` | `src/components/ui/Badge.jsx` | Status/label badge. |
| `Input` | `src/components/ui/Input.jsx` | Shared input. |
| `Loader` | `src/components/ui/Loader.jsx` | Loading indicator. |
| `Modal` | `src/components/ui/Modal.jsx` | Shared modal wrapper. |
| `SearchBar` | `src/components/ui/SearchBar.jsx` | Search input component. |
| `Switch` | `src/components/ui/Switch.jsx` | Toggle component. |
| `Table` | `src/components/ui/Table.jsx` | Reusable table component. |
| `ToastProvider`, `useToast` | `src/components/ui/Toast.jsx` | Toast notification system. |
| `ThemeToggle` | `src/components/ui/ThemeToggle.jsx` | Dark/light theme toggle. |
| `LanguageSwitcher` | `src/components/ui/LanguageSwitcher.jsx` | Language switcher. |
| `FloatingWhatsApp` | `src/components/ui/FloatingWhatsApp.jsx` | Global WhatsApp contact shortcut. |

### Feature Components

| Area | Components |
| --- | --- |
| Products | Product cards, search bar, purchase sheet/modal, details sheet, loading and empty states under `src/components/products`. |
| Orders | Order cards, filters, detail drawer, pagination helpers under `src/components/orders`. |
| Wallet | Balance card, stats cards, filters, transaction cards, receipt upload under `src/components/wallet`. |
| Account | OTP input and 2FA card under `src/components/account`. |
| Admin dashboard | Metric cards and widgets under `src/components/admin-dashboard`. |
| Admin | Broadcast modal under `src/components/admin`. |

## 13. UI/UX Behavior

### Loading States

- Route-level lazy loading uses `Suspense` and `RouteLoader`.
- Stores expose loading flags such as `isLoading`, `isLoadingUsers`, `adminOrdersLoading`.
- Pages use loaders, skeleton-like cards, disabled buttons, or local submitting states.

### Empty States

Empty states exist across:

- Product lists.
- Orders.
- Wallet transactions.
- Admin users/payments/orders.
- Supervisor candidate/list/detail areas.

### Error States

Error handling is mostly page/store local:

- Stores set `error` fields.
- Pages catch API exceptions and show toasts.
- Auth/account access errors route users to account state pages.

### Toasts / Alerts

Custom toast system:

```text
src/components/ui/Toast.jsx
```

Toast types:

- `success`
- `error`
- `warning`
- `info`

Toasts auto-dismiss after about 3 seconds.

### Confirmation Modals

The app uses a mix of:

- Custom modal components.
- `window.confirm`.
- `window.prompt` in some admin flows.

Examples:

- Supervisor delete uses `window.confirm`.
- Payment rejection uses `window.prompt`.
- Product/category/delete flows use custom confirmations in some places.

### Pagination / Filter / Search

| Area | Behavior |
| --- | --- |
| Admin orders | Server-side pagination and debounced search. |
| Admin payments | Server-side status/search/page filters. |
| Admin users | Backend pagination stored in admin store. |
| User transactions | Page-level filtering and pagination. |
| Product catalog | Search/category filtering in client. |
| Wallet | Period/type/status filtering with merged transaction data. |

### Responsive Behavior

- `Layout` uses a fixed sidebar on desktop and slide-over sidebar on mobile.
- Sidebar width is about 312 px expanded and 112 px collapsed.
- Mobile sidebar closes on navigation.
- Header exposes a menu button for small screens.
- Many page grids use responsive Tailwind classes.

### Theme And Language

- Theme defaults to dark and is persisted under localStorage key `theme`.
- The app supports Arabic and English resources.
- `LanguageContext` intentionally returns `dir='rtl'` for both languages to preserve layout direction.

## 14. Backend Contract

The frontend normalizers are forgiving, but the following shapes are expected for smooth behavior.

### Standard API Envelope

Preferred backend envelope:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Raw arrays/objects are also accepted by many real API methods.

### Auth Response Shape

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "status": "approved",
      "permissions": [],
      "isApiEnabled": false,
      "apiToken": "optional",
      "coins": 100,
      "creditLimit": 0,
      "currency": "USD"
    },
    "token": "access-token",
    "refreshToken": "optional-refresh-token"
  }
}
```

2FA login challenge shape may include:

```json
{
  "requires2FA": true,
  "tempToken": "temporary-token",
  "requestId": "challenge-id",
  "email": "user@example.com"
}
```

### User Object Expectations

The frontend reads or normalizes:

- `id` or `_id`
- `name`
- `email`
- `role`
- `status`
- `permissions`
- `supervisorPermissions`
- `isTwoFactorEnabled` or `twoFactorEnabled`
- `isApiEnabled`
- `apiToken`
- `walletBalance`, `coins`, or wallet-derived balance
- `creditLimit`
- `group`, `groupId`, `groupName`, `groupPercentage`
- `currency` or `currencyCode`
- `signupMethod`, `authProvider`
- `approvedAt`, `rejectedAt`, `createdAt`
- `avatar`

### Permissions Shape

Accepted:

```json
["dashboard.view", "orders.view"]
```

or:

```json
{
  "dashboard.view": true,
  "orders.view": true
}
```

### Paginated Response Shapes

Common accepted shapes include:

```json
{
  "data": {
    "users": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

For different resources, keys may be:

- `users`
- `orders`
- `items`
- `notifications`
- `transactions`
- `pagination`
- `summary`

### Error Response Shape

The frontend reads:

```json
{
  "success": false,
  "message": "Human readable error",
  "error": "Detailed error",
  "code": "OPTIONAL_CODE"
}
```

`realApi.js` also uses HTTP status and response data when wrapping errors.

### Product Response Assumptions

Products may include:

- `id` or `_id`
- `name`, `nameAr`
- `description`, `descriptionAr`
- `image`
- `category`, `categoryId`
- `status`, `productStatus`, `isActive`
- `isVisibleInStore`, `showWhenUnavailable`
- inventory fields
- schedule fields
- `minQty`, `maxQty`, `stepQty`
- `basePrice`, `basePriceCoins`, `displayPrice`
- provider/supplier IDs
- `externalProductId`, `providerProductId`
- `dynamicFields`, `orderFields`
- `isAvailableForApi`
- synced/manual pricing flags

### Order Response Assumptions

Orders may include:

- `id`, `_id`
- `orderNumber`, `siteOrderNumber`
- `supplierOrderNumber`, `externalOrderId`
- `productId`, `productName`
- `userId`, `userName`, `userEmail`
- `status`
- `quantity`
- `priceCoins`, `totalAmount`
- `financialSnapshot`
- `orderFieldsValues`, `orderFields`, `dynamicData`, `customerInput`, `quantitySnapshot`
- provider/supplier fields
- `rejectionReason`
- `createdAt`, `updatedAt`

### Wallet / Topup Response Assumptions

Wallet transactions may include:

- `id`, `_id`
- `type`, `kind`, `transactionType`
- `amount`, `signedAmount`
- `balanceAfter`
- `currency`, `originalCurrency`
- `status`
- `description`
- reference/order/deposit/source fields
- `createdAt`

Topups/deposits may include:

- `id`, `_id`
- `userId`, `userName`, `userEmail`
- `status`
- `requestedAmount`, `requestedCoins`, `amount`
- `actualPaidAmount`
- `creditedCoins`
- `currency`, `currencyCode`
- `paymentMethodId`
- `proofImage`, `receipt`
- `senderWalletNumber`
- `notes`, `adminNotes`
- `financialSnapshot`
- `createdAt`, `reviewedAt`

### Hardcoded/Expected Status Values

Frontend logic references statuses such as:

- Account: `approved`, `pending`, `rejected`, `verification_required`
- Orders: `pending`, `processing`, `completed`, `rejected`, `cancelled` and provider-specific statuses after normalization
- Topups/deposits: `pending`, `approved`, `rejected`
- Products: active/inactive, visible/hidden, availability/product status helpers

Backend statuses can be uppercase or lowercase, but frontend normalization is safest when backend sends predictable strings.

## 15. Security Notes

### Token Storage

The auth token is stored in `localStorage` through Zustand persistence. This is convenient but vulnerable to XSS. Treat any script injection risk as session compromise risk.

### Route Guards Are Not Backend Security

Frontend guards improve UX only. The backend must enforce:

- Authenticated requests.
- Role checks.
- Permission checks.
- Ownership checks for customer resources.
- Admin-only operations.

### Supervisor/Admin Permission Risks

- Admin bypasses all frontend permissions.
- Supervisor action-level checks are incomplete in some admin pages.
- Several permission keys exist in UI but are not route guards.
- Backend and frontend permission key lists must stay synchronized.
- `manager` is an alias for supervisor, which can confuse debugging if backend returns mixed role names.

### Sensitive Data Display

Admin pages display or manipulate sensitive data such as:

- User emails and IDs.
- Wallet balances and credit limits.
- Receipt/payment proof images.
- API access flags/tokens.
- Provider credentials/config fields.

Restrict admin/supervisor routes and ensure backend redacts secrets where appropriate.

### File Upload Validation

Current frontend checks:

- Receipt images: image MIME types, max 20 MB.
- Product images: max 20 MB in `AdminProducts`.
- Payment group/method images: png/jpeg/jpg/webp/gif, max 2 MB.

Backend must also validate type, size, path, and storage permissions.

### CORS And Security Headers

The frontend does not configure CORS or security headers. These must be handled by the backend and hosting platform.

### Sensitive Environment Variables

Only `VITE_` env variables are intended for browser code. Do not put private secrets in `VITE_` variables. `GEMINI_API_KEY` appears in frontend env examples but no active browser usage was found; if it is needed, do not expose a private key to the browser.

## 16. Performance Notes

### Existing Optimizations

- Lazy-loaded routes with `React.lazy`.
- Vite manual chunks for router, motion, i18n, icons, state, React, and vendor code.
- Store-level cache TTLs:
  - Products/groups: about 5 minutes.
  - Users: about 90 seconds.
  - Wallets/orders/topups: about 60 seconds.
  - Notifications: about 30 seconds.
  - Currencies: about 10 minutes.
  - Payment settings: about 5 minutes.
- Request de-duplication for profile and some store loads.
- Admin orders search debounce of about 500 ms.
- Admin order/payment pages use server-side pagination.

### Known Bottlenecks / Watch Areas

| Area | Risk |
| --- | --- |
| Wallet page | Merges wallet transactions, orders, and topups client-side. Large histories may become expensive. |
| Admin dashboard | Fetches supplier balances individually, which can be slow with many suppliers. |
| Supplier global search | Can fetch live products across providers and become slow or rate-limited. |
| Product catalog | Large product/category sets are stored in localStorage and filtered client-side. |
| Admin users | Large user lists need reliable backend pagination. |
| Fallback endpoint logic | Some API methods try multiple endpoint candidates, increasing latency when backend paths do not match. |

### Suggested Safe Improvements

- Add backend-driven pagination/search for very large product catalogs.
- Add explicit backend endpoint contracts to reduce fallback retries.
- Add action-level permission guards to reduce avoidable failed admin requests.
- Add React Query/SWR or a typed data-fetching layer only if the project is ready for a broader refactor.
- Add automated tests before changing financial snapshot, order, wallet, or supervisor logic.

## 17. Development Guidelines

### Add A New Page

1. Create a page under `src/pages` or the relevant feature folder.
2. Add a lazy import in `src/App.jsx`.
3. Add a route with the correct layout and guard.
4. Add a sidebar entry in `src/components/layout/Sidebar.jsx` if it should be navigable.
5. Add store/API methods if needed.
6. Add loading, empty, and error states.

### Add A New Protected Route

Use `ProtectedRoute` for general protected pages:

```jsx
<ProtectedRoute roles={[ROLES.CUSTOMER]}>
  <MyPage />
</ProtectedRoute>
```

Use `AdminRoute` for admin/supervisor routes:

```jsx
<AdminRoute permissions="orders.view">
  <AdminOrders />
</AdminRoute>
```

Always match the frontend guard with backend authorization.

### Add A New Sidebar Item

Update `src/components/layout/Sidebar.jsx`:

- Choose an icon from `lucide-react`.
- Set `path`.
- Set `roles`.
- Set `permissions` if admin/supervisor-only.
- Add `visible(user)` if the item depends on a user flag such as `isApiEnabled`.

Then verify the matching route guard in `src/App.jsx`.

### Add A New API Service Method

1. Add the method to `src/services/realApi.js`.
2. Add a matching mock implementation in `src/services/mockApi.js` if local development needs it.
3. Normalize response shape inside the service when possible.
4. Use the method from a Zustand store rather than directly from many components when state needs to be shared.
5. Add error handling and user-facing toasts at the page/store boundary.

### Add A New Permission Check

1. Add the permission key to the backend first.
2. Add it to `PERMISSION_GROUPS` in `AdminSupervisors.jsx`.
3. Update `ProtectedRoute` usage in `src/App.jsx` if it controls route access.
4. Update `Sidebar.jsx` if it controls menu visibility.
5. Add button/action guards in the relevant page.
6. Update mock API behavior if needed.
7. Verify with a supervisor account, not an admin account.

### Add A New Form

Current convention is controlled React state with local validation. For consistency:

- Keep form state close to the page/component unless reused.
- Use existing `Input`, `Button`, `Modal`, `Switch`, and toast components.
- Validate before API calls.
- Show field-level or toast errors.
- Disable submit while loading.
- Avoid introducing a form library unless the project adopts it broadly.

### Add A New Provider / Integration

Frontend provider management is in:

- `src/pages/admin/AdminSuppliers.jsx`
- `src/services/realApi.js` supplier methods

When adding integration-specific fields:

- Keep credentials and secrets backend-side where possible.
- Update supplier form fields carefully.
- Update provider product normalization if the returned catalog shape differs.
- Verify live products, sync, balance, and order check flows.
- Ensure backend masks sensitive credentials in GET responses.

### Code Style Conventions Observed

- Functional React components.
- Zustand stores for shared state.
- Tailwind utility classes.
- Lucide icons.
- `async/await` API actions with try/catch.
- Toasts for user-facing success/error.
- LocalStorage persistence for session and cached data.
- Role and permission helpers centralized in `authRoles.js`.
- Mixed English/Arabic translation resources, RTL-first layout.

## 18. Known Issues / TODO / Needs Verification

These items are based on static inspection and should be verified before major changes.

1. No automated test runner or test script is configured.
2. `VITE_DATA_PROVIDER` defaults to mock mode when unset, which can surprise developers expecting real backend data.
3. `.env.local` can override `.env.development` and currently points at a production backend URL.
4. `GEMINI_API_KEY`, `APP_URL`, `@google/genai`, `better-sqlite3`, `dotenv`, and `express` appear in frontend config/dependencies but no active `src` usage was found.
5. `src/services/api.js` appears to be legacy/unused by the current store-based API layer.
6. `src/pages/wallet/` contains duplicate/legacy wallet page files; active routes import root-level wallet pages.
7. There is no dedicated 404 page; unknown routes redirect to `/`.
8. Supervisor `getDefaultRouteForRole()` currently sends supervisors to `/dashboard`, not an admin/supervisor dashboard.
9. Supervisor permission fallback can display default permissions if backend returns none.
10. Some permission keys are defined in the supervisor UI but are not route guards or action-level guards.
11. `products.manage` sidebar behavior does not exactly match the `/admin/products` route requirement of `products.view`.
12. `suppliers.manage` is required for `/admin/suppliers`, but the supervisor permission UI marks it inactive/upcoming.
13. Action-level permission enforcement is incomplete in several admin pages. Backend must enforce.
14. Supplier create endpoint in the frontend uses `POST /providers`, while most other supplier endpoints use `/admin/providers`; verify backend route.
15. Some API methods try multiple fallback endpoints, which can hide backend contract drift and add latency.
16. `useOrderStore.addOrder()` contains a TODO around group discount snapshot behavior.
17. Wallet and financial pages have complex client-side merging/snapshot logic. Treat changes as high risk.
18. Topup, wallet, order, and user data can be persisted in localStorage in mock/cached flows. Clear storage when debugging stale state.
19. The app relies on backend support for `/auth/refresh`; if missing, refresh is marked unsupported and users may be logged out on token expiry.
20. Admin currency page fetches metadata from `restcountries.com`; failures should be expected in offline/restricted environments.
21. Some admin flows use `window.confirm` and `window.prompt` instead of shared modal components.
22. The language context intentionally forces RTL direction for both Arabic and English. Verify before changing layout direction.
23. API token docs are displayed when `user.isApiEnabled === true`; backend must ensure tokens and docs are only available to allowed users.
24. File upload validation exists client-side but must be duplicated backend-side.
25. There is no visible frontend config directory; environment/config concerns are spread across Vite, services, and utilities.

## Quick Reference

Common commands:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

Most important files to inspect before changing behavior:

```text
src/App.jsx
src/services/client.js
src/services/realApi.js
src/services/mockApi.js
src/store/useAuthStore.js
src/utils/authRoles.js
src/components/auth/ProtectedRoute.jsx
src/components/layout/Sidebar.jsx
```

Most important files for supervisor/RBAC changes:

```text
src/pages/admin/AdminSupervisors.jsx
src/pages/admin/AdminUsers.jsx
src/utils/authRoles.js
src/components/auth/ProtectedRoute.jsx
src/components/layout/Sidebar.jsx
src/store/useAdminStore.js
src/services/realApi.js
src/services/mockApi.js
```

---

## Supervisor / Admin UI Reference - Current Implementation

This section documents the current frontend behavior for supervisor/admin permissions after the recent route, wallet, product-visibility, blind provider-sync, demotion, logo, and notification updates.

### Personal Pages vs Admin Pages

Supervisors can use personal pages independently from admin permissions. Admin pages remain permission-protected.

| Page | Supervisor behavior | API expectation |
| --- | --- | --- |
| `/orders` | Allowed for supervisors as a personal orders page, even without `orders.view`. | Uses personal order methods such as `apiClient.orders.listMine()` and `/me/orders`. |
| `/wallet` | Allowed for supervisors as a personal wallet page, even without `wallet.view`. | Uses personal wallet/order/topup methods such as `/wallet/transactions`, `/me/orders`, and `/me/deposits`. |
| `/wallet/add-balance` | Customer-only in the current router. | Supervisors should not use personal topup flow. |
| `/wallet/payment-details/:methodId` | Customer-only in the current router. | Supervisors should not use personal topup payment-detail flow. |
| `/admin/orders` | Requires admin/supervisor route access and `orders.view`. | Uses admin order endpoints. |
| `/admin/wallet` | Requires admin/supervisor route access and `wallet.view`. | Uses admin wallet endpoints. |

The sidebar exposes personal `Orders` and `Wallet` entries to supervisors without depending on admin order/wallet permissions. Admin `Orders Manager` and `Admin Wallet` entries still depend on their admin permissions.

### Role-Aware Logo Navigation

Logo clicks use `getLogoTargetForRole()` from `src/utils/authRoles.js`.

| Session | Logo target |
| --- | --- |
| Guest | `/` |
| CUSTOMER | `/dashboard` |
| ADMIN | `/admin/dashboard` |
| SUPERVISOR | `/admin/dashboard` |

This helper is intentionally separate from route-denial behavior. A supervisor without `dashboard.view` can still be routed through the existing admin route guard.

### Demote / Cancel Supervisor UI

The demote/cancel-supervisor action is no longer exposed as a quick row/card action. It is available inside the user details/account actions area near dangerous account actions.

Current behavior:

- The user details/account actions area contains the demote action for supervisor users.
- A confirmation modal appears before the API call.
- Canceling the modal does not call the API.
- Confirming demotes the user to a normal customer/user and clears supervisor permissions.
- The account is not deleted by demotion.

Confirmation text:

```text
هل أنت متأكد من إلغاء الإشراف عن هذا المستخدم؟ سيتم تحويله إلى مستخدم عادي، وسيتم إزالة كل صلاحيات المشرف، ولن يستطيع الدخول إلى لوحة الإدارة بعد ذلك. هذا الإجراء لا يحذف الحساب.
```

Relevant files:

- `src/pages/admin/AdminUsers.jsx`
- `src/store/useAdminStore.js`
- `src/services/realApi.js`

### Wallet Adjustment UI Rules

The frontend exposes add-balance controls according to the backend `wallet.adjust` rules, but the backend remains the source of truth.

| Actor | UI behavior |
| --- | --- |
| ADMIN | Existing add, deduct, set, and wallet/debt controls remain available where they already existed. |
| SUPERVISOR with `wallet.adjust` | Can see add-balance actions only for CUSTOMER targets. |
| SUPERVISOR without `wallet.adjust` | Does not see add-balance actions. |
| SUPERVISOR targeting self | Add-balance is hidden/disabled. |
| SUPERVISOR targeting ADMIN/SUPERVISOR | Add-balance is hidden/disabled. |
| SUPERVISOR deduct/set/debt-adjust | Hidden/blocked; these remain admin-only. |

`wallet.adjust` is available in the supervisor permission UI.

### Admin Products - Supervisor Visibility

For supervisors on `/admin/products`, the admin product table is intentionally blind to price and provider internals.

Supervisor table behavior:

- No price column.
- No provider/supplier column.
- No price values of any kind.
- No visible provider IDs, supplier IDs, provider product IDs, `externalProductId`, `rawPayload`, `providerMapping`, or raw provider data.
- Product rows should not render blank or `undefined` price/provider artifacts.

Permission behavior:

| Permission | UI behavior |
| --- | --- |
| `products.view` | Read-only product list. No create, edit, delete, activate/deactivate, provider-link, or sync controls. |
| `products.manage` | Safe metadata edit flow only. No price fields, provider linkage fields, create button, delete button, or provider-sync controls. |
| `products.provider.sync` | Shows the blind provider-link/sync section for existing products. Does not show prices. |

Safe metadata fields for supervisors with `products.manage`:

- `name`
- `description`
- `image`
- `category`
- `displayOrder`
- active status where already safely supported

Admin behavior is unchanged: admins still see full product/provider/pricing UI and actions.

### Blind Provider Link / Sync UI

`products.provider.sync` is a dedicated permission and appears in the supervisor permissions UI with:

```text
Label: ربط المورد ومزامنة السعر
Description: يسمح بربط المنتج بمنتج مورد وتشغيل مزامنة السعر بدون عرض الأسعار.
```

For a supervisor with `products.provider.sync`, `/admin/products` shows a safe provider-link/sync section in the product modal.

Allowed UI:

- Select provider by provider name.
- Search/select provider product by provider product name.
- View safe current linkage summary.
- Save/link provider product.
- Trigger blind price sync.
- Generic success messages only:
  - `تم ربط المنتج بالمورد بنجاح`
  - `تمت مزامنة السعر بنجاح`

Safe current linkage summary shown to supervisors:

```text
currentProviderName
currentProviderProductName
linkageMode
isLinked
currentProviderProductActive
currentProviderMinQty
currentProviderMaxQty
```

Provider product option cards may show:

- Product name.
- Provider name when useful.
- Category label when available.
- Min/max quantity when available and safe.
- Active/inactive status.

Provider product option cards must not show:

```text
basePrice
providerPrice
rawPrice
price
finalPrice
sellingPrice
displayPrice
markedUpPriceUSD
oldPrice
newPrice
cost
rate
profit
margin
markup
rawPayload
externalProductId
provider raw response
visible provider IDs
visible provider product IDs
```

Internal provider/product IDs may still be used as select values and API payload IDs, but they must not be rendered visibly in the UI.

Relevant files:

- `src/pages/admin/AdminProducts.jsx`
- `src/pages/admin/AdminSupervisors.jsx`
- `src/services/realApi.js`
- `src/utils/authRoles.js`

### Notifications UI Compatibility

The backend now emits additional order, refund, wallet, topup/deposit, and high-priority provider-rejection notifications through the existing notification response shape. The current frontend notification bell/store should display these automatically as long as the backend keeps the existing notification contract.

Important notes:

- Customer messages are expected to be safe and generic.
- Admin/supervisor notification routing is permission-targeted by the backend.
- `priority: HIGH` exists for provider rejected + refunded warnings.
- The frontend has not been redesigned for special high-priority styling in this pass.

Relevant files:

- `src/store/useNotificationStore.js`
- `src/components/notifications/NotificationBell.jsx`
- `src/services/realApi.js`

### Development Guidelines for These Areas

When changing supervisor/admin UI behavior:

1. Check route guards in `src/App.jsx`.
2. Check role and permission helpers in `src/utils/authRoles.js`.
3. Check sidebar visibility in `src/components/layout/Sidebar.jsx`.
4. Check endpoint selection in `src/services/realApi.js`.
5. Check page-level action guards before adding or exposing buttons.
6. Check the backend route/controller/service guard before trusting frontend permissions.

When adding a new supervisor product permission:

1. Add the permission to `src/pages/admin/AdminSupervisors.jsx`.
2. Add route/action guards in the target page.
3. Keep hidden fields out of supervisor update payloads.
4. Confirm backend rejects direct unsafe payloads.
5. Update this README and the backend README.

### Remaining TODO / Needs Verification

- Optional high-priority notification visual styling for `priority: HIGH`.
- Decide whether category management needs a separate supervisor permission.
- Decide whether more granular product metadata permissions are needed beyond `products.manage`.
- Confirm whether supervisors should ever receive a safe non-pricing product creation flow; current UI keeps creation admin-only.
- Keep verifying that product/provider IDs are only used as internal values and never rendered visibly for supervisors.
