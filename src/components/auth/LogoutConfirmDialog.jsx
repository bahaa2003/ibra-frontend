import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

const LogoutConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title = 'هل تريد تسجيل الخروج؟',
  description = 'سيتم إنهاء جلستك الحالية والعودة إلى صفحة تسجيل الدخول.',
  confirmLabel = 'موافق',
  cancelLabel = 'إلغاء',
}) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/58 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          initial={{ opacity: 0, y: 22, scale: 0.92, rotateX: -8 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: 14, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[1.7rem] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[linear-gradient(145deg,rgb(var(--color-card-rgb)/0.98),rgb(var(--color-surface-rgb)/0.94))] p-5 text-right shadow-[0_28px_90px_-38px_rgba(0,0,0,0.48)]"
          dir="rtl"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(var(--color-primary-rgb)/0.18),transparent_42%)]" />
          <button
            type="button"
            onClick={onCancel}
            className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[color:rgb(var(--color-primary-rgb)/0.09)] hover:text-[var(--color-text)]"
            aria-label={cancelLabel}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-300/38 bg-rose-500/12 text-rose-600 dark:text-rose-200">
              <LogOut className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 id="logout-confirm-title" className="text-base font-bold text-[var(--color-text)]">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">
                {description}
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.72)] text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:text-[var(--color-text)]"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-10 rounded-full bg-[linear-gradient(135deg,#b42323,#f97316)] text-sm font-bold text-white shadow-[0_18px_34px_-22px_rgba(244,63,94,0.85)] transition-all hover:-translate-y-0.5 hover:brightness-105"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default LogoutConfirmDialog;
