import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronDown, Smartphone, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatWalletAmount } from '../utils/storefront';
import { getActivePaymentGroups } from '../utils/paymentSettings';

const getMethodsCountLabel = (count, isRTL) => {
    const safeCount = Number(count) || 0;

    if (!isRTL) {
        return `${safeCount} methods`;
    }

    if (safeCount === 1) return 'وسيلة واحدة';
    if (safeCount === 2) return 'وسيلتان';
    if (safeCount >= 3 && safeCount <= 10) return `${safeCount} وسائل`;
    return `${safeCount} وسيلة`;
};

const getGroupSummary = (group, isRTL) => {
    if (group?.description) return group.description;

    return isRTL
        ? `اختر من ${getMethodsCountLabel(group?.methods?.length, true)} المتاحة للشحن اليدوي.`
        : `Choose from ${getMethodsCountLabel(group?.methods?.length, false)} available for manual top-up.`;
};

const getMethodPresentation = (method) => {
    const token = `${method?.id || ''} ${method?.name || ''}`.toLowerCase();

    if (token.includes('vodafone')) {
        return { icon: Smartphone, color: 'from-red-500 to-pink-500' };
    }
    if (token.includes('etisalat')) {
        return { icon: Smartphone, color: 'from-green-500 to-teal-500' };
    }
    if (token.includes('orange')) {
        return { icon: Smartphone, color: 'from-orange-500 to-red-500' };
    }
    if (String(method?.type || '') === 'bank_transfer') {
        return { icon: Building2, color: 'from-blue-500 to-purple-500' };
    }

    return { icon: Smartphone, color: 'from-emerald-500 to-cyan-500' };
};

const CompactPaymentMethodTile = ({ method, presentation, onSelect, index }) => {
    const IconComponent = presentation.icon;
    const hasImage = Boolean(method?.image);

    return (
        <motion.button
            type="button"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.28, delay: index * 0.03 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method)}
            className="group relative isolate flex flex-col items-center overflow-hidden rounded-[14px] border border-[#d7bc8d]/70 bg-[linear-gradient(145deg,rgba(93,72,33,0.14),rgba(246,215,148,0.16)_44%,rgba(255,251,236,0.96)_100%)] p-2 text-center shadow-[0_14px_22px_-22px_rgba(125,92,33,0.58)] transition-all hover:-translate-y-0.5 hover:border-[#caa159]/80 hover:brightness-[1.02] sm:rounded-[16px] sm:p-2.5"
        >
            {hasImage ? (
                <img
                    src={resolveImageUrl(method.image)}
                    alt={method.name}
                    className="h-9 w-9 rounded-[12px] border border-[#d8bd8b]/75 object-cover shadow-[0_10px_18px_-16px_rgba(125,92,33,0.7)] transition-transform group-hover:scale-105 sm:h-10 sm:w-10 sm:rounded-[13px]"
                    loading="lazy"
                    decoding="async"
                />
            ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#d8b36b]/60 bg-[linear-gradient(180deg,rgba(255,246,218,0.95),rgba(242,214,150,0.62))] text-[#8c631f] shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] transition-transform group-hover:scale-105 sm:h-10 sm:w-10 sm:rounded-[13px]">
                    <IconComponent className="h-4 w-4" />
                </div>
            )}
            <span className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-4 text-[#6f4f18]">
                {method.name}
            </span>
        </motion.button>
    );
};

const AddBalance = () => {
    const { dir } = useLanguage();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { paymentSettings, loadPaymentSettings } = useSystemStore();
    const isRTL = dir === 'rtl';

    const [openGroupId, setOpenGroupId] = useState(null);

    useEffect(() => {
        loadPaymentSettings();
    }, [loadPaymentSettings]);

    const currentBalance = Number(user?.coins || 0);
    const currentCurrency = String(user?.currency || 'USD').toUpperCase();
    const balanceDisplayValue = formatWalletAmount(currentBalance, currentCurrency);
    const isNegativeBalance = currentBalance < 0;

    const paymentGroups = useMemo(
        () => getActivePaymentGroups(paymentSettings),
        [paymentSettings]
    );

    useEffect(() => {
        if (!paymentGroups.length) {
            setOpenGroupId(null);
            return;
        }

        setOpenGroupId((previous) => (
            paymentGroups.some((group) => group.id === previous) ? previous : paymentGroups[0].id
        ));
    }, [paymentGroups]);

    const handleMethodSelect = (method) => {
        navigate(`/wallet/payment-details/${method.id}`);
    };

    return (
        <div className="space-y-4 sm:space-y-5" dir={dir}>
            <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5">
                <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-[22px] border border-gray-200 bg-white/85 p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:rounded-[24px] sm:p-5 dark:border-gray-800 dark:bg-gray-900/65"
                    >
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                            <span className="inline-flex items-center rounded-full border border-[#d8bd8b]/70 bg-[linear-gradient(180deg,rgba(255,248,227,0.92),rgba(255,255,255,0.82))] px-3 py-1 text-[11px] font-semibold text-[#8c631f]">
                                {isRTL ? 'شحن يدوي' : 'Manual top-up'}
                            </span>
                            <h1 className="mt-3 text-[1.45rem] font-bold tracking-[-0.02em] text-gray-900 sm:text-3xl dark:text-white">{t('wallet.addBalance')}</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">{t('payments.manualOnly')}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.94, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.18 }}
                        className="relative overflow-hidden rounded-[22px] border border-[#b98d3e]/55 bg-[linear-gradient(145deg,rgba(88,61,18,0.34),rgba(176,128,43,0.3)_42%,rgba(234,200,121,0.72)_100%)] p-4 shadow-[0_16px_30px_-22px_rgba(92,62,14,0.7)] sm:rounded-[24px]"
                    >
                        <div className={`relative z-10 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                                <p className="text-[10px] font-bold tracking-[0.14em] text-[#fff1c9]">{t('wallet.currentBalance')}</p>
                                <p className={`mt-2 text-[1.35rem] font-black tracking-[-0.03em] leading-none sm:text-[1.6rem] ${isNegativeBalance ? 'text-[#ffb4b4]' : 'text-[#fff8e8]'}`}>
                                    {balanceDisplayValue}
                                </p>
                            </div>
                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-[#f1d089]/35 bg-[linear-gradient(180deg,rgba(255,239,194,0.34),rgba(189,133,35,0.3))] text-[#fff1c9] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                                <Wallet className="h-[1.15rem] w-[1.15rem]" />
                            </span>
                        </div>
                    </motion.div>
                </div>

                <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="rounded-[22px] border border-gray-200 bg-white/85 p-3.5 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:rounded-[24px] sm:p-4 dark:border-gray-800 dark:bg-gray-900/65"
                >
                    <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">{t('payments.chooseMethod')}</h2>
                        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {isRTL ? 'اختر الوسيلة الأنسب ثم أكمل الطلب بخطوات واضحة ومنظمة على الهاتف.' : 'Choose the best payment method and continue with a cleaner mobile flow.'}
                        </p>
                    </div>

                    <div className="space-y-3 sm:space-y-3.5">
                        {paymentGroups.map((group, index) => {
                            const isOpen = openGroupId === group.id;

                            return (
                                <motion.div
                                    key={group.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.1 * index }}
                                    className="relative isolate overflow-hidden rounded-[20px] border border-[#d3b171]/55 bg-[linear-gradient(145deg,rgba(93,72,33,0.14),rgba(246,215,148,0.12)_38%,rgba(255,251,236,0.94)_100%)] p-2.5 shadow-[0_18px_34px_-28px_rgba(125,92,33,0.66)] sm:rounded-[22px] sm:p-3"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenGroupId((previous) => (previous === group.id ? null : group.id))}
                                        className="flex w-full flex-col items-start gap-3 rounded-[16px] border border-white/35 bg-white/25 px-3 py-3 text-start transition-all hover:bg-white/35 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                    >
                                        <div className={`flex min-w-0 items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            {group.image ? (
                                                <img
                                                    src={resolveImageUrl(group.image)}
                                                    alt={group.name}
                                                    className="h-10 w-10 shrink-0 rounded-[14px] border border-[#d8bd8b]/75 object-cover shadow-[0_10px_20px_-16px_rgba(125,92,33,0.7)] sm:h-12 sm:w-12 sm:rounded-[16px]"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#d8b36b]/60 bg-[linear-gradient(180deg,rgba(255,246,218,0.95),rgba(242,214,150,0.62))] text-[#8c631f] shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] sm:h-12 sm:w-12 sm:rounded-[16px]">
                                                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <h3 className="truncate text-[0.96rem] font-semibold text-[#6f4f18] sm:text-lg">{group.name}</h3>
                                                    {group.currency && (
                                                        <span className="shrink-0 rounded-md border border-[#c9a44e]/50 bg-[linear-gradient(180deg,rgba(255,248,225,0.95),rgba(245,220,160,0.6))] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#7a5a1e]">
                                                            {String(group.currency).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs leading-5 text-[#8f6e36] sm:text-sm">
                                                    {getGroupSummary(group, isRTL)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <span className="rounded-full border border-[#d8bd8b]/70 bg-[linear-gradient(180deg,rgba(255,246,218,0.94),rgba(242,214,150,0.52))] px-3 py-1 text-xs font-semibold text-[#8a6528]">
                                                {getMethodsCountLabel(group.methods.length, isRTL)}
                                            </span>
                                            <ChevronDown className={`h-5 w-5 text-[#8f6e36] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid grid-cols-2 gap-2 px-0.5 pb-0.5 pt-2.5 min-[430px]:grid-cols-3 xl:grid-cols-4">
                                                    {group.methods.map((method, methodIndex) => {
                                                        const presentation = getMethodPresentation(method);
                                                        const mappedMethod = {
                                                            ...method,
                                                            icon: presentation.icon,
                                                            color: presentation.color,
                                                            available: method.isActive !== false,
                                                        };

                                                        return (
                                                            <CompactPaymentMethodTile
                                                                key={method.id}
                                                                method={mappedMethod}
                                                                presentation={presentation}
                                                                onSelect={handleMethodSelect}
                                                                index={methodIndex}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}

                        {!paymentGroups.length && (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400">
                                {isRTL ? `لا توجد طرق دفع متاحة حاليًا لعملتك (${currentCurrency}). يرجى التواصل مع الدعم.` : `No payment methods are currently available for your currency (${currentCurrency}). Please contact support.`}
                            </div>
                        )}
                    </div>
                </motion.section>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="rounded-2xl border border-gray-200 bg-white/80 p-4 backdrop-blur-xl sm:p-5 dark:border-gray-800 dark:bg-gray-900/65"
                >
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">{t('payments.importantInfo')}</h3>
                    <div className="space-y-2.5 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:text-base">
                        {[t('payments.infoItem1'), t('payments.infoItem2'), t('payments.infoItem3')].map((item, idx) => (
                            <div key={item} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div
                                    className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${idx === 0 ? 'bg-orange-400' : idx === 1 ? 'bg-pink-400' : 'bg-purple-400'}`}
                                />
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddBalance;
