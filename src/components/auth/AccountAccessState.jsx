import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  Home,
  MessageCircle,
  RefreshCcw,
  ShieldX,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useAuthStore from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { buildWhatsAppLink, getAdminWhatsAppNumber } from '../../utils/whatsapp';
import {
  getAccountAccessRoute,
  getAccountStatusBadgeVariant,
  getAccountStatusLabel,
  isApprovedAccountStatus,
  normalizeAccountStatus,
} from '../../utils/accountStatus';
import { getDefaultRouteForRole } from '../../utils/authRoles';

const PENDING_MESSAGE = 'مرحبًا، قمت بإنشاء حساب جديد في IBRA Store عبر Google وأحتاج تفعيل الحساب.';
const REJECTED_MESSAGE = 'مرحبًا، تم رفض تفعيل حسابي في IBRA Store وأحتاج معرفة التفاصيل.';

const ACCOUNT_UI = {
  pending: {
    icon: Clock3,
    title: 'انتظار تفعيل الحساب',
    description: 'تم إنشاء حسابك بنجاح، ولكن يحتاج إلى تفعيل من قبل الإدارة. يرجى التواصل مع الأدمن لتفعيل حسابك.',
    badge: 'بانتظار التفعيل',
    accent:
      'border-[color:rgb(var(--color-warning-rgb)/0.22)] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_55%),rgba(255,255,255,0.82)] text-[var(--color-warning)] dark:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_52%),rgba(15,23,42,0.9)]',
    message: PENDING_MESSAGE,
  },
  rejected: {
    icon: ShieldX,
    title: 'تم رفض الحساب',
    description: 'عذرًا، لم يتم تفعيل حسابك. يرجى التواصل مع الإدارة للمزيد من التفاصيل.',
    badge: 'مرفوض',
    accent:
      'border-[color:rgb(var(--color-error-rgb)/0.22)] bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.16),transparent_55%),rgba(255,255,255,0.82)] text-[var(--color-error)] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.14),transparent_52%),rgba(15,23,42,0.9)]',
    message: REJECTED_MESSAGE,
  },
};

const AccountAccessState = ({ variant = 'pending' }) => {
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const { user, blockedStatus, blockedUser, refreshProfile, logout } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentStatus = normalizeAccountStatus(user?.status || blockedStatus || variant);
  const displayVariant = currentStatus === 'rejected' ? 'rejected' : variant;
  const config = ACCOUNT_UI[displayVariant] || ACCOUNT_UI.pending;
  const Icon = config.icon;
  const activeUser = user || blockedUser || null;

  const whatsappLink = useMemo(
    () => buildWhatsAppLink({
      number: getAdminWhatsAppNumber(),
      message: config.message,
    }),
    [config.message]
  );

  const handleRefresh = async () => {
    if (!user) return;

    setIsRefreshing(true);
    const profile = await refreshProfile();
    setIsRefreshing(false);

    const nextStatus = normalizeAccountStatus(profile?.status || user?.status);
    const nextRoute = getAccountAccessRoute(nextStatus);

    if (nextRoute) {
      navigate(nextRoute, { replace: true });
      return;
    }

    navigate(getDefaultRouteForRole(profile?.role || user?.role), { replace: true });
  };

  useEffect(() => {
    if (isApprovedAccountStatus(currentStatus) && user) {
      navigate(getDefaultRouteForRole(user?.role), { replace: true });
    }
  }, [currentStatus, navigate, user]);

  if (isApprovedAccountStatus(currentStatus) && user) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.84),transparent_46%),linear-gradient(180deg,rgba(241,245,249,0.92),rgba(248,250,252,0.98))] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]" />
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.72),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_68%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-xl"
      >
        <Card variant="premium" className="overflow-hidden rounded-[2rem] border border-[color:rgb(var(--color-border-rgb)/0.84)] p-6 sm:p-8">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.78)] px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${displayVariant === 'rejected' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-warning)]'}`} />
              {config.badge}
            </div>

            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border shadow-[var(--shadow-subtle)] ${config.accent}`}>
              <Icon className="h-9 w-9" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                {config.title}
              </h1>
              <p className="mx-auto max-w-lg text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
                {config.description}
              </p>
            </div>

            {activeUser && (
              <div className="rounded-[1.5rem] border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-4 text-start">
                <div className="flex items-center gap-3">
                  <img
                    src={activeUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeUser?.name || activeUser?.email || 'User')}&background=random`}
                    alt={activeUser?.name || 'User'}
                    className="h-12 w-12 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.84)] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {activeUser?.name || 'IBRA Store User'}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {activeUser?.email || 'account@ibrastore.app'}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    getAccountStatusBadgeVariant(currentStatus) === 'danger'
                      ? 'bg-[color:rgb(var(--color-error-rgb)/0.14)] text-[var(--color-error)]'
                      : 'bg-[color:rgb(var(--color-warning-rgb)/0.16)] text-[var(--color-warning)]'
                  }`}>
                    {getAccountStatusLabel(currentStatus)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-emerald-500/25 bg-emerald-500/12 px-5 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-500/16 dark:text-emerald-300"
              >
                <MessageCircle className="h-4 w-4" />
                التواصل مع الأدمن عبر واتساب
              </a>

              {user && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'جاري تحديث الحالة...' : 'تحديث حالة الحساب'}
                </Button>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/" className="block">
                  <Button variant="secondary" className="w-full">
                    <Home className="h-4 w-4" />
                    العودة للصفحة الرئيسية
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    logout();
                    navigate('/auth', { replace: true });
                  }}
                >
                  <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AccountAccessState;
