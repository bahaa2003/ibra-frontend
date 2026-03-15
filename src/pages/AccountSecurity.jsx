import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import TwoFactorCard from '../components/account/TwoFactorCard';
import useAuthStore from '../store/useAuthStore';
import { useLanguage } from '../context/LanguageContext';

const AccountSecurity = () => {
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  const text = useMemo(
    () =>
      isEnglish
        ? {
            title: 'Account Protection',
            subtitle: 'Manage advanced security settings for your account.',
            securityOverview: 'Security Overview',
            securityHint:
              'Keep two-factor authentication enabled to protect your account from unauthorized access.'
          }
        : {
            title: 'حماية الحساب',
            subtitle: 'إدارة إعدادات الأمان المتقدمة الخاصة بحسابك.',
            securityOverview: 'ملخص الأمان',
            securityHint:
              'الحفاظ على تفعيل المصادقة الثنائية يساعد في حماية حسابك من الوصول غير المصرح به.'
          },
    [isEnglish]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-gray-950/35 p-5 backdrop-blur-md"
      >
        <h1 className="text-2xl font-bold text-white">{text.title}</h1>
        <p className="mt-1 text-sm text-gray-300">{text.subtitle}</p>
      </motion.header>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-white/10 bg-gray-950/35 p-5">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-white">
            <ShieldCheck className="h-[18px] w-[18px] text-indigo-300" />
            {text.securityOverview}
          </h2>
          <p className="text-sm text-gray-300">{text.securityHint}</p>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <TwoFactorCard userId={user?.id} email={String(user?.email || '')} emailChangedPending={false} />
      </motion.section>
    </div>
  );
};

export default AccountSecurity;
