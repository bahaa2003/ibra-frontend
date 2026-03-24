import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Home, MessageCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { buildWhatsAppLink, getAdminWhatsAppNumber } from '../utils/whatsapp';

const SUCCESS_MESSAGE = 'مرحبًا، تم تأكيد بريدي الإلكتروني في IBRA Store وأحتاج تفعيل الحساب من الإدارة.';
const SUPPORT_MESSAGE = 'مرحبًا، أواجه مشكلة في تأكيد البريد الإلكتروني لحسابي في IBRA Store وأحتاج مساعدة من الدعم.';

const includesAny = (value, patterns) => patterns.some((pattern) => value.includes(pattern));

const getVerificationErrorMeta = (rawMessage) => {
  const message = String(rawMessage || '').trim();
  const normalized = message.toLowerCase();

  if (
    includesAny(normalized, [
      'expired',
      'token expired',
      'link expired',
      'has expired',
      'منتهي',
      'انتهت',
      'منتهية',
    ])
  ) {
    return {
      type: 'expired',
      label: 'نوع الخطأ: رابط منتهي',
      title: 'رابط التحقق منتهي الصلاحية',
      description: 'انتهت صلاحية رابط التحقق. سجّل الدخول مرة أخرى ثم اطلب إرسال رابط تحقق جديد إلى بريدك.',
      shouldContactSupport: false,
    };
  }

  if (
    includesAny(normalized, [
      'invalid token',
      'invalid verification',
      'invalid or expired',
      'malformed',
      'not valid',
      'غير صالح',
      'غير صحيح',
      'رابط غير صالح',
    ])
  ) {
    return {
      type: 'invalid',
      label: 'نوع الخطأ: رابط غير صالح',
      title: 'رابط التحقق غير صالح',
      description: 'رابط التحقق غير صالح أو تم تعديله. افتح أحدث رسالة بريد وصالح التحقق من جديد.',
      shouldContactSupport: false,
    };
  }

  if (
    includesAny(normalized, [
      'already verified',
      'already confirmed',
      'verified already',
      'already used',
      'تم التحقق بالفعل',
      'مؤكد بالفعل',
      'مفعل بالفعل',
    ])
  ) {
    return {
      type: 'already_verified',
      label: 'نوع الخطأ: البريد مؤكد مسبقًا',
      title: 'البريد الإلكتروني مؤكد بالفعل',
      description: 'تم تأكيد هذا البريد سابقًا. يمكنك تسجيل الدخول الآن، ثم انتظار موافقة الإدارة إذا كان الحساب ما زال بانتظار التفعيل.',
      shouldContactSupport: false,
    };
  }

  if (
    includesAny(normalized, [
      'user not found',
      'account not found',
      'no user',
      'not found',
      'الحساب غير موجود',
      'المستخدم غير موجود',
    ])
  ) {
    return {
      type: 'account_not_found',
      label: 'نوع الخطأ: الحساب غير موجود',
      title: 'الحساب المرتبط بالرابط غير موجود',
      description: 'لم يتم العثور على الحساب المرتبط بهذا الرابط. تأكد أنك تستخدم الرابط الصحيح أو تواصل مع الدعم إذا استمرت المشكلة.',
      shouldContactSupport: true,
    };
  }

  if (
    includesAny(normalized, [
      'missing token',
      'token required',
      'verification token required',
      'token is required',
      'مطلوب',
      'بدون رمز',
    ])
  ) {
    return {
      type: 'missing_token',
      label: 'نوع الخطأ: رابط ناقص',
      title: 'رابط التحقق ناقص',
      description: 'الرابط الذي تم فتحه لا يحتوي على بيانات التحقق الكاملة. افتح الرابط مباشرة من البريد الإلكتروني مرة أخرى.',
      shouldContactSupport: false,
    };
  }

  return {
    type: 'unknown',
    label: 'نوع الخطأ: غير معروف',
    title: 'تعذر تحديد نوع المشكلة',
    description: 'حدث خطأ غير معروف أثناء تأكيد البريد الإلكتروني. إذا استمرت المشكلة، يرجى التواصل مع الدعم.',
    shouldContactSupport: true,
  };
};

const EmailVerified = () => {
  const location = useLocation();
  const { dir } = useLanguage();

  const { status, message } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      status: String(params.get('status') || '').trim().toLowerCase(),
      message: String(params.get('message') || '').trim(),
    };
  }, [location.search]);

  const isSuccess = status === 'success';
  const errorMeta = useMemo(() => getVerificationErrorMeta(message), [message]);
  const whatsappLink = useMemo(
    () => buildWhatsAppLink({
      number: getAdminWhatsAppNumber(),
      message: SUCCESS_MESSAGE,
    }),
    []
  );
  const supportWhatsAppLink = useMemo(
    () => buildWhatsAppLink({
      number: getAdminWhatsAppNumber(),
      message: `${SUPPORT_MESSAGE}${message ? `\nتفاصيل الخطأ: ${message}` : ''}`,
    }),
    [message]
  );

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
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-[var(--color-error)]'}`} />
              {isSuccess ? 'تم التحقق بنجاح' : 'تعذر تأكيد البريد'}
            </div>

            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border shadow-[var(--shadow-subtle)] ${
              isSuccess
                ? 'border-emerald-500/25 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_55%),rgba(255,255,255,0.82)] text-emerald-600 dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_52%),rgba(15,23,42,0.9)] dark:text-emerald-300'
                : 'border-[color:rgb(var(--color-error-rgb)/0.22)] bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.16),transparent_55%),rgba(255,255,255,0.82)] text-[var(--color-error)] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.14),transparent_52%),rgba(15,23,42,0.9)]'
            }`}>
              {isSuccess ? <CheckCircle2 className="h-9 w-9" /> : <ShieldAlert className="h-9 w-9" />}
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                {isSuccess ? 'تم تأكيد البريد الإلكتروني' : errorMeta.title}
              </h1>
              <p className="mx-auto max-w-lg text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
                {isSuccess
                  ? 'تم تأكيد بريدك الإلكتروني بنجاح. الخطوة التالية هي التواصل مع الأدمن عبر واتساب حتى يتم تفعيل الحساب من الإدارة.'
                  : errorMeta.description}
              </p>
            </div>

            {isSuccess ? (
              <div className="rounded-[1.5rem] border border-emerald-500/18 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.08))] p-4 text-start shadow-[0_18px_40px_-28px_rgba(5,150,105,0.45)]">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  الرجاء التواصل مع الأدمن عبر واتساب لتفعيل الحساب
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                  بعد الضغط على الزر سيتم فتح واتساب برسالة جاهزة لطلب تفعيل الحساب بعد نجاح تأكيد البريد الإلكتروني.
                </p>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-[color:rgb(var(--color-error-rgb)/0.16)] bg-[linear-gradient(135deg,rgba(248,113,113,0.1),rgba(239,68,68,0.06))] p-4 text-start shadow-[0_18px_40px_-28px_rgba(239,68,68,0.24)]">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {errorMeta.label}
                </p>
                {message ? (
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                    رسالة الخادم: {message}
                  </p>
                ) : null}
                {errorMeta.shouldContactSupport ? (
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                    إذا لم تكن متأكدًا من السبب أو تكرر الخطأ، تواصل مع الدعم.
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {isSuccess ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-[1.2rem] border border-emerald-500/24 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(5,150,105,0.12))] px-5 py-4 text-start shadow-[0_22px_40px_-30px_rgba(5,150,105,0.55)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/36 hover:shadow-[0_28px_50px_-28px_rgba(5,150,105,0.62)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_14px_30px_-18px_rgba(16,185,129,0.95)]">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--color-text)]">
                        التواصل مع الأدمن عبر واتساب
                      </span>
                      <span className="mt-1 block text-xs leading-6 text-[var(--color-text-secondary)]">
                        افتح المحادثة مباشرة وأرسل طلب تفعيل الحساب الجاهز.
                      </span>
                    </span>
                    <ArrowRight className={`h-5 w-5 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0' : ''}`} />
                  </div>
                </a>
              ) : (
                <>
                  {errorMeta.shouldContactSupport ? (
                    <a
                      href={supportWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-[1.2rem] border border-emerald-500/24 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(5,150,105,0.12))] px-5 py-4 text-start shadow-[0_22px_40px_-30px_rgba(5,150,105,0.55)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/36 hover:shadow-[0_28px_50px_-28px_rgba(5,150,105,0.62)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_14px_30px_-18px_rgba(16,185,129,0.95)]">
                          <MessageCircle className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-[var(--color-text)]">
                            التواصل مع الدعم عبر واتساب
                          </span>
                          <span className="mt-1 block text-xs leading-6 text-[var(--color-text-secondary)]">
                            افتح المحادثة وأرسل الخطأ الحالي للدعم مباشرة.
                          </span>
                        </span>
                        <ArrowRight className={`h-5 w-5 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0' : ''}`} />
                      </div>
                    </a>
                  ) : null}

                  <Link to="/auth" className="block">
                    <Button className="w-full">
                      <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
                      العودة لتسجيل الدخول
                    </Button>
                  </Link>
                </>
              )}

              <div className={`grid gap-3 ${isSuccess ? 'sm:grid-cols-2' : ''}`}>
                <Link to="/" className="block">
                  <Button variant="secondary" className="w-full">
                    <Home className="h-4 w-4" />
                    العودة للصفحة الرئيسية
                  </Button>
                </Link>
                {isSuccess ? (
                  <Link to="/auth" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
                      الذهاب لتسجيل الدخول
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerified;
