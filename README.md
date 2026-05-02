<p align="center">
  <h1 align="center">🎨 Digital Products Platform — Frontend</h1>
  <p align="center">
    A modern React 19 storefront and admin dashboard for a digital products e-commerce platform, featuring multi-language support, dark/light themes, real-time order tracking, and a comprehensive admin panel.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-5-433E38" />
  <img src="https://img.shields.io/badge/i18next-EN%20%7C%20AR-26A69A" />
</p>

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Routing & Pages](#-routing--pages)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [UI Component Library](#-ui-component-library)
- [Internationalization](#-internationalization)
- [Theming](#-theming)
- [Build & Optimization](#-build--optimization)
- [Scripts](#-scripts)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework with Suspense & lazy loading |
| **Vite** | 6 | Build tool, dev server, HMR |
| **TailwindCSS** | 4 | Utility-first CSS (via `@tailwindcss/vite`) |
| **Zustand** | 5 | Lightweight state management (8 stores) |
| **React Router** | 7 | Client-side routing (30+ routes) |
| **Axios** | Latest | HTTP client with interceptors & token refresh |
| **Framer Motion** | 12 | Page transitions & micro-animations |
| **Lucide React** | Latest | Icon library |
| **i18next** | 25 | Internationalization (English + Arabic RTL) |
| **clsx + tailwind-merge** | Latest | Conditional class utilities |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- Backend API server running (see [Backend README](../Backend/README.md))

### Installation

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local

# Start development server
npm run dev
```

The app starts on **http://localhost:3000** (configurable via `--port` flag).

---

## 🔐 Environment Variables

Create a `.env.local` file (git-ignored) to override defaults:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# WhatsApp Support
VITE_ADMIN_WHATSAPP_NUMBER=+201010243175

# App Settings
VITE_APP_ENV=development
VITE_APP_MODE=development
APP_URL=http://localhost:3000

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Environment File Priority

| File | Purpose | Git Tracked |
|---|---|---|
| `.env` | Base defaults | Yes |
| `.env.development` | Dev-specific overrides | Yes |
| `.env.local` | Local overrides (highest priority) | **No** |
| `.env.example` | Template for new setups | Yes |

---

## 📁 Project Structure

```
Frontend/src/
├── App.jsx                        # Route definitions (30+ routes)
├── main.jsx                       # Entry point, providers setup
├── i18n.js                        # i18next configuration
├── index.css                      # Global styles & design tokens
│
├── pages/                         # Page-level components
│   ├── Landing.jsx                # Public landing page
│   ├── PublicCatalog.jsx          # Public product showcase (no pricing)
│   ├── Auth.jsx                   # Login / Register (40KB)
│   ├── EmailVerified.jsx          # Email verification callback
│   ├── AccountPending.jsx         # Pending approval screen
│   ├── AccountRejected.jsx        # Rejected account screen
│   ├── Dashboard.jsx              # Customer dashboard
│   ├── Products.jsx               # Product catalog (authenticated)
│   ├── ProductDetails.jsx         # Single product view
│   ├── Orders.jsx                 # Customer order history
│   ├── Wallet.jsx                 # Wallet overview & transactions
│   ├── AddBalance.jsx             # Deposit / top-up flow
│   ├── PaymentDetails.jsx         # Payment method details & receipt
│   ├── Account.jsx                # Profile management
│   ├── AccountSecurity.jsx        # Password & security settings
│   ├── Settings.jsx               # App settings (language, theme)
│   ├── CreatedByPage.jsx          # About / credits
│   ├── ManagerDashboard.jsx       # Manager overview
│   ├── AdminDashboard.jsx         # Admin analytics (35KB)
│   └── admin/                     # Admin sub-pages
│       ├── AdminUsers.jsx         # User management (58KB)
│       ├── AdminProducts.jsx      # Product CRUD (115KB)
│       ├── AdminOrders.jsx        # Order management (31KB)
│       ├── AdminWallet.jsx        # Wallet operations (37KB)
│       ├── AdminUserTransactions.jsx
│       ├── AdminGroups.jsx        # Pricing groups
│       ├── AdminCurrencies.jsx    # Currency management
│       ├── AdminPayments.jsx      # Deposit approvals
│       ├── AdminPaymentMethods.jsx # Payment config (42KB)
│       ├── AdminSuppliers.jsx     # Provider management (48KB)
│       ├── AdminSupervisors.jsx   # Supervisor accounts
│       └── AdminTopups.jsx        # Top-up management
│
├── components/                    # Reusable components
│   ├── ui/                        # Design system primitives
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Switch.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Toast.jsx
│   │   ├── Loader.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── FloatingWhatsApp.jsx
│   ├── layout/                    # App shell & navigation
│   ├── auth/                      # ProtectedRoute, auth guards
│   ├── home/                      # Landing page sections
│   ├── products/                  # Product cards, filters
│   ├── orders/                    # Order cards, status badges
│   ├── wallet/                    # Wallet widgets
│   ├── payment/                   # Payment flow components
│   ├── account/                   # Profile components
│   ├── settings/                  # Settings panels
│   ├── admin-dashboard/           # Admin dashboard widgets
│   └── app/                       # SessionBootstrap, RouteWarmup
│
├── store/                         # Zustand state stores
│   ├── useAuthStore.js            # Authentication state & session
│   ├── useAdminStore.js           # Admin dashboard data (33KB)
│   ├── useMediaStore.js           # Products & catalog (23KB)
│   ├── useOrderStore.js           # Order management (12KB)
│   ├── useTopupStore.js           # Deposit/top-up flows (14KB)
│   ├── useGroupStore.js           # Pricing groups
│   ├── useSystemStore.js          # System settings & payment config
│   └── useNotificationStore.js    # Toast notifications
│
├── services/
│   └── realApi.js                 # Axios HTTP adapter (2900+ lines)
│                                  #   - Token management & refresh
│                                  #   - Data normalization (BE → FE)
│                                  #   - Request/response interceptors
│                                  #   - 401 auto-retry with refresh
│
├── context/
│   ├── ThemeContext.jsx            # Dark/Light mode provider
│   └── LanguageContext.jsx         # EN/AR language + RTL provider
│
├── locales/
│   ├── en/                        # English translations
│   └── ar/                        # Arabic translations (RTL)
│
├── utils/                         # Utility modules
│   ├── orders.js                  # Order helpers (28KB)
│   ├── storefront.js              # Storefront logic (10KB)
│   ├── productStatus.js           # Product status mapping
│   ├── pricing.js                 # Price formatting & calculation
│   ├── money.js                   # Currency formatting (Intl)
│   ├── paymentSettings.js         # Payment config normalization
│   ├── validation.js              # Form validation helpers
│   ├── accountStatus.js           # Account status routing
│   ├── authErrorMessages.js       # Auth error i18n messages
│   ├── authRoles.js               # Role constants (ADMIN_ROLES)
│   ├── imageUrl.js                # Image URL resolver
│   ├── navigation.js              # Route helpers
│   ├── intl.js                    # Number/date formatting
│   ├── devLogger.js               # Dev-only console logger
│   ├── transactionCurrency.js     # Transaction currency resolver
│   ├── currencyCountryMap.js      # Currency → country mapping
│   ├── productPurchase.js         # Purchase flow helpers
│   └── whatsapp.js                # WhatsApp link generator
│
├── data/                          # Static data / mock fallbacks
├── assets/                        # Static assets (images, fonts)
└── theme/                         # Theme configuration
```

---

## 🗺 Routing & Pages

### Public Routes (no authentication)

| Path | Page | Description |
|---|---|---|
| `/` | Landing | Public landing page |
| `/catalog` | PublicCatalog | Product showcase (no pricing) |
| `/auth`, `/login` | Auth | Login / Register form |
| `/email-verified` | EmailVerified | Email verification callback |
| `/account/pending` | AccountPending | Awaiting admin approval |
| `/account/rejected` | AccountRejected | Account denied |

### Customer Routes (requires login + ACTIVE status)

| Path | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard | Customer overview |
| `/products` | Products | Browse & order products |
| `/products/:id` | ProductDetails | Single product view |
| `/orders` | Orders | Order history |
| `/wallet` | Wallet | Wallet balance & transactions |
| `/wallet/add-balance` | AddBalance | Deposit flow |
| `/wallet/payment-details/:methodId` | PaymentDetails | Payment instructions & receipt upload |
| `/account` | Account | Profile management |
| `/account-security` | AccountSecurity | Password settings |
| `/settings` | Settings | App preferences |

### Admin Routes (requires ADMIN role)

| Path | Page | Description |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | Analytics & revenue stats |
| `/admin/users` | AdminUsers | User management |
| `/admin/users/:userId/transactions` | AdminUserTransactions | User transaction history |
| `/admin/orders` | AdminOrders | All orders management |
| `/admin/products` | AdminProducts | Product CRUD & provider linking |
| `/admin/wallet` | AdminWallet | Wallet operations |
| `/admin/groups` | AdminGroups | Pricing tier management |
| `/admin/currencies` | AdminCurrencies | Currency & rate management |
| `/admin/payments` | AdminPayments | Deposit approvals |
| `/admin/payment-methods` | AdminPaymentMethods | Payment method configuration |
| `/admin/suppliers` | AdminSuppliers | Provider API management |
| `/admin/supervisors` | AdminSupervisors | Supervisor accounts |

All routes use **lazy loading** with `React.lazy()` and `Suspense` for code splitting.

---

## 🗄 State Management

The app uses **8 Zustand stores** with localStorage persistence:

| Store | Purpose | Key State |
|---|---|---|
| `useAuthStore` | Authentication | user, token, refreshToken, isAuthenticated |
| `useAdminStore` | Admin dashboard | users, orders, wallets, stats, providers |
| `useMediaStore` | Products & catalog | products, categories, suppliers, filters |
| `useOrderStore` | Customer orders | orders, pagination, filters |
| `useTopupStore` | Deposits/top-ups | deposits, payment methods |
| `useGroupStore` | Pricing groups | groups, selected group |
| `useSystemStore` | System config | payment settings, currencies, whatsapp |
| `useNotificationStore` | UI notifications | toast queue |

### Session Management

- JWT tokens stored in `localStorage` under `auth-storage`
- Automatic **token refresh** on 401 responses with request queuing
- Force logout with session cleanup on refresh failure
- Cross-tab session sync via `CustomEvent` dispatch

---

## 🔗 API Integration

All API communication is handled by `services/realApi.js` (~2900 lines):

### Key Features

- **Axios instance** with `Authorization: Bearer <token>` interceptor
- **Automatic token refresh** — 401 triggers refresh flow, queues concurrent requests
- **Data normalization** — transforms backend shapes to frontend conventions:
  - `_id` → `id`
  - `UPPERCASE` roles/statuses → `lowercase`
  - Populated MongoDB refs → flattened fields
  - Financial fields → consistent numeric types
- **Error wrapping** — standardized error objects with `status`, `code`, `message`
- **Force logout** — clears session on unrecoverable auth errors

### Normalizers

| Function | Transforms |
|---|---|
| `normaliseUser()` | User document → FE user shape |
| `normaliseProduct()` | Product doc → FE product with supplier mapping |
| `normaliseOrder()` | Order doc → FE order with financial snapshot |
| `normaliseWalletTransaction()` | Transaction → FE transaction with signed amounts |
| `normaliseGroup()` | Group → FE group (percentage → discount alias) |

---

## 🧩 UI Component Library

### Design Primitives (`components/ui/`)

| Component | Description |
|---|---|
| `Button` | Primary, secondary, danger variants with loading state |
| `Input` | Text input with label, error, icon support |
| `Badge` | Status badges with color variants |
| `Card` | Content container with header/body/footer |
| `Modal` | Overlay dialog with backdrop & animations |
| `Table` | Data table with sorting support |
| `Switch` | Toggle switch for boolean settings |
| `SearchBar` | Debounced search input |
| `Toast` | Toast notification system (via `ToastProvider`) |
| `Loader` | Spinning loader indicator |
| `ThemeToggle` | Dark/light mode switch |
| `LanguageSwitcher` | EN/AR language selector |
| `FloatingWhatsApp` | Fixed WhatsApp support button |

### Feature Components

| Directory | Contains |
|---|---|
| `layout/` | App shell, sidebar, header, responsive layout |
| `auth/` | ProtectedRoute, role-based access guards |
| `products/` | Product cards, grids, filters, order forms |
| `orders/` | Order cards (mobile), status badges, review actions |
| `wallet/` | Balance display, transaction list |
| `payment/` | Payment flow, receipt upload |
| `admin-dashboard/` | Charts, stats cards, analytics widgets |

---

## 🌐 Internationalization

| Language | Code | Direction | Files |
|---|---|---|---|
| English | `en` | LTR | `locales/en/` |
| Arabic | `ar` | RTL | `locales/ar/` |

### Implementation

- **i18next** with `react-i18next` hooks (`useTranslation`)
- **Browser detection** via `i18next-browser-languagedetector`
- **RTL support** through `LanguageContext` — toggles `dir="rtl"` on `<html>`
- **Persistent preference** stored in localStorage
- **Language switcher** available in the UI header

---

## 🎨 Theming

Dual theme support via `ThemeContext`:

- **Dark mode** — default, with dark backgrounds and light text
- **Light mode** — clean white backgrounds

Theme is persisted in `localStorage` and applied by toggling CSS classes. The `ThemeToggle` component provides a smooth switch UI.

---

## 📦 Build & Optimization

### Vite Configuration

- **Code splitting** — Manual chunk strategy for optimal loading:

  | Chunk | Contents |
  |---|---|
  | `react-vendor` | React, ReactDOM, Scheduler |
  | `router-vendor` | React Router |
  | `motion-vendor` | Framer Motion |
  | `i18n-vendor` | i18next ecosystem |
  | `icons-vendor` | Lucide React icons |
  | `state-vendor` | Zustand |
  | `vendor` | All other node_modules |

- **Lazy loading** — All page components use `React.lazy()` for route-level code splitting
- **Tree shaking** — Vite's Rollup-based build eliminates dead code
- **Path aliases** — `@/` maps to project root

### Build Output

```bash
npm run build
# Output → dist/
# Optimized, minified, chunked production bundle
```

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite --port=3000 --host=0.0.0.0` | Start dev server with HMR |
| `build` | `vite build` | Production build → `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `clean` | `rm -rf dist` | Remove build output |
| `lint` | `tsc --noEmit` | TypeScript type checking |
| `generate:favicons` | `node scripts/generate-favicons.mjs` | Generate favicon set |

---

<p align="center">
  Built with ❤️ using React 19 + Vite 6
</p>
