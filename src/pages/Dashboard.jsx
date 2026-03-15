import React, { useEffect, useMemo } from 'react';
import { ArrowRight, CreditCard, ListOrdered, TrendingUp, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import useOrderStore from '../store/useOrderStore';
import useTopupStore from '../store/useTopupStore';
import useMediaStore from '../store/useMediaStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import HeroSlider from '../components/home/HeroSlider';
import AnnouncementTicker from '../components/home/AnnouncementTicker';
import CategoryCard from '../components/home/CategoryCard';
import StoreFooter from '../components/home/StoreFooter';
import buyCardsImage from '../assets/buyCards.webp';
import chatAppsImage from '../assets/chatApps.webp';
import gamesChargingImage from '../assets/gamesCharging.webp';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  getStorefrontLanguage,
} from '../utils/storefront';

const Dashboard = () => {
  const { user, refreshProfile } = useAuthStore();
  const { users, loadUsers } = useAdminStore();
  const { orders, loadOrders, syncOrderSupplierStatus } = useOrderStore();
  const { topups, loadTopups } = useTopupStore();
  const { categories, products, loadProducts } = useMediaStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = getStorefrontLanguage(i18n);
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const isRTL = language === 'ar';

  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  // Fetch fresh profile on mount to bust Zustand persist cache (stale balance)
  useEffect(() => {
    if (refreshProfile) {
      refreshProfile();
    }
  }, [refreshProfile]);

  useEffect(() => {
    if (isAdmin || isManager) {
      loadOrders();
      loadTopups();
    }
    if (isAdmin) {
      loadUsers();
    }
    if (isCustomer) {
      loadProducts();
    }
  }, [isAdmin, isManager, isCustomer, loadOrders, loadTopups, loadUsers, loadProducts]);

  const recentTopups = [...(topups || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  const recentOrders = [...(orders || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  const approvedTopups = (topups || []).filter((item) => item.status === 'approved' || item.status === 'completed');
  const totalCoinsSold = approvedTopups.reduce((sum, item) => sum + Number(item.requestedCoins || item.amount || 0), 0);
  const completedOrders = (orders || []).filter((item) => item.status === 'completed');
  const totalProfits = completedOrders.reduce((sum, item) => sum + Number(item.priceCoins || 0), 0);

  const adminStats = [
    { label: t('legacy.totalUsers'), value: (users || []).length, icon: Users },
    { label: t('legacy.totalOrders'), value: (orders || []).length, icon: TrendingUp },
    { label: t('dashboard.totalTopups'), value: (topups || []).length, icon: CreditCard },
    { label: t('dashboard.coinsSold'), value: `${totalCoinsSold.toLocaleString(locale)} ${t('legacy.coins')}`, icon: ShoppingBagStat },
    { label: t('dashboard.totalProfits'), value: `$${totalProfits.toLocaleString(locale)}`, icon: ListOrdered },
  ];

  const heroSlides = useMemo(() => ([
    {
      id: 'hero-games',
      image: gamesChargingImage,
      alt: language === 'ar' ? 'صورة شحن ألعاب' : 'Game topup banner',
    },
    {
      id: 'hero-apps',
      image: chatAppsImage,
      alt: language === 'ar' ? 'صورة اشتراكات رقمية' : 'Digital subscriptions banner',
    },
    {
      id: 'hero-cards',
      image: buyCardsImage,
      alt: language === 'ar' ? 'صورة بطاقات رقمية' : 'Digital cards banner',
    },
  ]), [language]);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, { language, userGroup: user?.group || 'Normal' }),
    [language, products, user?.group]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language),
    [categories, storefrontProducts, language]
  );

  const visibleHomepageCategories = useMemo(
    () => storefrontCategories.filter((category) => category.id !== 'all'),
    [storefrontCategories]
  );

  const announcementItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({
      id: `announcement-${index}`,
      text: language === 'ar'
        ? 'مرحبا بك في IBRA ارخص سعر وامان'
        : 'Welcome to IBRA, lowest prices and secure shopping',
    })),
    [language]
  );

  const tickerItems = useMemo(
    () => [
      {
        id: 'ticker-welcome',
        text: language === 'ar' ? 'مرحبًا بك في IBRA' : 'Welcome to IBRA',
      },
      {
        id: 'ticker-price',
        text: language === 'ar' ? 'أسعار مناسبة كل يوم' : 'Fair prices every day',
      },
      {
        id: 'ticker-secure',
        text: language === 'ar' ? 'شراء آمن وتنفيذ سريع' : 'Secure checkout and fast delivery',
      }
    ],
    [language]
  );

  const handleCategorySelect = (categoryId) => {
    navigate(categoryId === 'all' ? '/products' : `/products?category=${encodeURIComponent(categoryId)}`);
  };

  const renderCustomerDashboard = () => (
    <div className="space-y-6 pb-4">
      <HeroSlider
        slides={heroSlides}
      />

      <section
        className="py-1"
      >
        <AnnouncementTicker
          items={tickerItems}
          durationMs={7000}
          direction="ltr"
          ariaLabel={language === 'ar' ? 'شريط ترحيبي متحرك' : 'Moving welcome strip'}
        />
      </section>

      <section id="categories" className="scroll-mt-28 space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-primary-soft)]">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                {language === 'ar' ? 'اكتشف أقسام المتجر' : 'Explore store collections'}
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-4 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.36)] hover:text-[var(--color-primary-hover)]"
            >
              {language === 'ar' ? 'كل المنتجات' : 'All products'}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {visibleHomepageCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              active={false}
              index={index}
              onSelect={handleCategorySelect}
            />
          ))}
        </div>
      </section>

      <StoreFooter
        title={language === 'ar' ? 'واجهة تجارة رقمية فاخرة' : 'A premium digital commerce experience'}
        description={language === 'ar'
          ? 'تمت إعادة ترتيب الصفحة الرئيسية لتكون أكثر أناقة، أسرع في التصفح، وأكثر راحة على الهاتف مع الحفاظ على الهوية الذهبية لـ IBRA.'
          : 'The homepage now prioritizes cleaner hierarchy, stronger luxury presence, and better mobile ergonomics while staying aligned with IBRA’s gold identity.'}
        chips={[
          { label: language === 'ar' ? 'المحفظة' : 'Wallet', to: '/wallet' },
          { label: language === 'ar' ? 'المنتجات' : 'Products', to: '/products' },
          { label: language === 'ar' ? 'الإعدادات' : 'Settings', to: '/settings' },
        ]}
        copyright={language === 'ar' ? '© 2026 IBRA Store. جميع الحقوق محفوظة.' : '© 2026 IBRA Store. All rights reserved.'}
        metaLine={language === 'ar' ? 'تنفيذ فوري • منتجات رقمية مختارة • دفع آمن' : 'Instant fulfilment • Curated digital goods • Secure checkout'}
      />
    </div>
  );

  const renderOperationsDashboard = () => (
    <div className="space-y-6">
      <section className="premium-card-premium p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="section-kicker">
              {language === 'ar' ? 'تشغيل IBRA' : 'IBRA Operations'}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[var(--color-text)]">
              {t('home.welcome')}, {user?.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
              {isAdmin
                ? (language === 'ar'
                  ? 'نظرة تشغيلية على المستخدمين والطلبات والأرصدة والأداء العام.'
                  : 'Administrative overview for users, orders, balances, and performance.')
                : (language === 'ar'
                  ? 'نظرة تشغيلية على طلبات الشحن وآخر حركة للطلبات.'
                  : 'Operational overview for topups and recent order flow.')}
            </p>
          </div>
          <Link to="/products">
            <Button variant="secondary">
              {t('dashboard.browse')}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
        </div>
      </section>

      {isAdmin && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {adminStats.map((stat) => (
            <Card key={stat.label} variant="elevated" className="p-5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:rgb(var(--color-primary-rgb)/0.22)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)]">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">{stat.label}</p>
              <p className="mt-3 text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
            </Card>
          ))}
        </section>
      )}

      {(isAdmin || isManager) && (
        <section className="grid gap-6 xl:grid-cols-2">
          <Card variant="elevated" className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">{t('dashboard.latestTopups')}</h3>
              <Badge variant="premium">{recentTopups.length}</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('legacy.date')}</TableHead>
                  <TableHead>{t('legacy.users')}</TableHead>
                  <TableHead>{t('legacy.amount')}</TableHead>
                  <TableHead>{t('legacy.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTopups.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell>{item.userName || item.userId}</TableCell>
                    <TableCell>{item.requestedCoins || item.amount}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'approved' || item.status === 'completed' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentTopups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {t('dashboard.noTopups')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card variant="elevated" className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">{t('dashboard.latestOrders')}</h3>
              <Badge variant="premium">{recentOrders.length}</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('legacy.date')}</TableHead>
                  <TableHead>{t('legacy.products')}</TableHead>
                  <TableHead>{t('legacy.users')}</TableHead>
                  <TableHead>{t('dashboard.supplier')}</TableHead>
                  <TableHead>{t('dashboard.sync')}</TableHead>
                  <TableHead>{t('legacy.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell>{item.productName || item.productId}</TableCell>
                    <TableCell>{item.userName || item.userId}</TableCell>
                    <TableCell>{item.supplierName || '-'}</TableCell>
                    <TableCell>
                      {item.supplierId && item.externalOrderId ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncOrderSupplierStatus(item.id, user)}
                        >
                          {t('dashboard.updateStatus')}
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'completed' ? 'success' : item.status === 'rejected' ? 'error' : 'warning'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {t('dashboard.noOrders')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}
    </div>
  );

  return isCustomer ? renderCustomerDashboard() : renderOperationsDashboard();
};

const ShoppingBagStat = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 2v4" />
    <path d="M18 2v4" />
    <path d="M3 7h18" />
    <path d="M5 7 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L19 7" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

export default Dashboard;
