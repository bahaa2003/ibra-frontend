import React, { useEffect, useState } from 'react';
import { AlertTriangle, CircleX } from 'lucide-react';

const REFUND_NOTICE_KEY = 'ibra-first-visit-notice-seen';
const COMMUNITY_NOTICE_KEY = 'ibra-community-notice-seen';
const COMMUNITY_LINK = 'https://chat.whatsapp.com/FqEYPVChqXB7CFS7hbN5D8';

const FirstVisitNotice = () => {
  const [activeNotice, setActiveNotice] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(REFUND_NOTICE_KEY) !== 'true') {
      setActiveNotice('refund');
      return;
    }
    if (localStorage.getItem(COMMUNITY_NOTICE_KEY) !== 'true') {
      setActiveNotice('community');
    }
  }, []);

  const handleClose = () => {
    if (activeNotice === 'refund') {
      localStorage.setItem(REFUND_NOTICE_KEY, 'true');
      if (localStorage.getItem(COMMUNITY_NOTICE_KEY) !== 'true') {
        setActiveNotice('community');
        return;
      }
    }

    if (activeNotice === 'community') {
      localStorage.setItem(COMMUNITY_NOTICE_KEY, 'true');
    }

    setActiveNotice(null);
  };

  if (!activeNotice) return null;

  const isCommunityNotice = activeNotice === 'community';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/58 p-4 backdrop-blur-sm" dir="rtl">
      <div className="flex w-full max-w-[22rem] flex-col items-center">
        <div className="w-full overflow-hidden rounded-[1.6rem] border border-[#d5ad57]/30 bg-[linear-gradient(145deg,rgba(255,251,236,0.98),rgba(255,255,255,0.95))] shadow-[0_24px_70px_-40px_rgba(0,0,0,0.66)] dark:border-[#f0c66f]/22 dark:bg-[linear-gradient(145deg,rgba(36,23,13,0.96),rgba(17,19,24,0.97))]">
          <div className="border-b border-[#d5ad57]/22 px-4 py-3.5 dark:border-[#f0c66f]/14">
            <div className="flex items-center justify-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d5ad57]/18 text-[#8a5a18] dark:bg-[#f0c66f]/12 dark:text-[#f8dfab]">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <h2 className="text-center text-base font-black leading-6 text-[#3a2411] dark:text-white">
                {isCommunityNotice ? 'تنويه المجتمع' : 'تنويه 📢 هام'}
              </h2>
            </div>
          </div>

          <div className="space-y-3 px-4 py-4 text-center">
            <p className="text-sm font-bold leading-7 text-[#5a3818] dark:text-[#f7e8c8]">
              {isCommunityNotice
                ? 'عدم متابعتك للمجتمع مسؤوليتك الشخصية'
                : 'لا يوجد استرداد لأي منتج لدينا'}
            </p>
            <p className="text-xs font-medium leading-6 text-[#6e4519]/78 dark:text-[#f7e8c8]/72">
              {isCommunityNotice
                ? 'واي اهمال في المتابعة تعرضك للمخاطر دون اي مسؤولية علينا'
                : 'يرجى قراءة شروط الخدمة قبل إجراء أي عملية تحويل ♻️'}
            </p>
          </div>

          <div className="space-y-2 px-4 pb-4">
            {isCommunityNotice && (
              <a
                href={COMMUNITY_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full items-center justify-center rounded-[1.1rem] border border-[#25d366]/28 bg-[#25d366] px-5 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(37,211,102,0.72)] transition-all hover:-translate-y-0.5 hover:bg-[#20bd5a]"
              >
                مجتمع الواتساب
              </a>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-full items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,#b9781f,#f0c66f_52%,#fff0bd)] px-5 text-sm font-black text-[#251609] shadow-[0_16px_34px_-22px_rgba(185,120,31,0.72)] transition-all hover:-translate-y-0.5 hover:brightness-105"
            >
              فهمت
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="إغلاق التنويه"
          className="group relative mt-4 flex h-14 w-14 items-center justify-center rounded-full text-red-600 transition-all hover:scale-110 dark:text-red-400"
        >
          <span className="absolute inset-0 rounded-full bg-red-500/22 blur-xl transition-all group-hover:bg-red-500/34" />
          <span className="absolute inset-1 rounded-full border border-red-500/32 bg-red-500/10 shadow-[0_0_28px_rgba(239,68,68,0.55)] animate-pulse" />
          <CircleX className="relative h-9 w-9 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]" />
        </button>
      </div>
    </div>
  );
};

export default FirstVisitNotice;
