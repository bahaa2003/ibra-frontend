import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, MailCheck, RefreshCcw, Shield, ShieldAlert } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OtpInput from './OtpInput';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import accountSecurityApi from '../../services/accountSecurityApi';

const STATUS = {
  DISABLED: 'disabled',
  SENDING: 'sending',
  CODE_SENT: 'code_sent',
  VERIFYING: 'verifying',
  ENABLED: 'enabled',
  ERROR_INVALID: 'error_invalid',
  ERROR_EXPIRED: 'error_expired'
};

const maskEmailForDisplay = (value) => {
  const raw = String(value || '').trim();
  const [name, domain] = raw.split('@');
  if (!name || !domain) return raw;
  if (name.length <= 2) return `${name.slice(0, 1)}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
};

const TwoFactorCard = ({ userId, email, emailChangedPending = false }) => {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const isEnglish = language === 'en';

  const text = useMemo(
    () =>
      isEnglish
        ? {
            title: 'Two-Factor Authentication',
            description:
              'Enable an extra security layer with a one-time code sent to your email at sign in.',
            enabled: 'Enabled',
            disabled: 'Disabled',
            sending: 'Sending code',
            codeSent: 'Code sent',
            verifying: 'Verifying',
            invalidCode: 'Invalid code',
            expiredCode: 'Code expired',
            enableBtn: 'Enable 2FA',
            disableBtn: 'Disable 2FA',
            sendCode: 'Send verification code',
            verifyBtn: 'Confirm activation',
            resendBtn: 'Resend code',
            sentTo: 'A verification code will be sent to',
            countdown: 'Resend available in',
            sentSuccess: 'Verification code has been sent to your email',
            invalidMsg: 'The code is incorrect. Please try again.',
            expiredMsg: 'The code has expired. Request a new one.',
            activatedMsg: 'Two-factor authentication is enabled successfully.',
            deactivatedMsg: 'Two-factor authentication has been disabled.',
            verifyHint: 'Enter the 6-digit code',
            saveEmailFirst: 'Save your email changes first before enabling 2FA.',
            disableTitle: 'Disable two-factor authentication?',
            disableDesc: 'For security, confirm your current password before disabling 2FA.',
            currentPassword: 'Current password',
            currentPasswordPlaceholder: 'Enter your current password',
            cancel: 'Cancel',
            confirmDisable: 'Disable now'
          }
        : {
            title: 'المصادقة الثنائية',
            description:
              'فعّل طبقة أمان إضافية لحسابك باستخدام رمز تحقق يُرسل إلى بريدك الإلكتروني عند تسجيل الدخول.',
            enabled: 'مفعلة',
            disabled: 'غير مفعلة',
            sending: 'جاري الإرسال',
            codeSent: 'الرمز تم إرساله',
            verifying: 'التحقق جاري',
            invalidCode: 'خطأ في الرمز',
            expiredCode: 'انتهاء صلاحية الرمز',
            enableBtn: 'تفعيل المصادقة الثنائية',
            disableBtn: 'إيقاف المصادقة الثنائية',
            sendCode: 'إرسال رمز التحقق',
            verifyBtn: 'تأكيد التفعيل',
            resendBtn: 'إعادة إرسال الرمز',
            sentTo: 'سيتم إرسال رمز التحقق إلى',
            countdown: 'إعادة الإرسال خلال',
            sentSuccess: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
            invalidMsg: 'الرمز غير صحيح، حاول مرة أخرى.',
            expiredMsg: 'انتهت صلاحية الرمز، اطلب رمزًا جديدًا.',
            activatedMsg: 'تم تفعيل المصادقة الثنائية بنجاح.',
            deactivatedMsg: 'تم إيقاف المصادقة الثنائية.',
            verifyHint: 'أدخل رمز التحقق المكوّن من 6 أرقام',
            saveEmailFirst: 'احفظ تعديل البريد الإلكتروني أولًا قبل تفعيل المصادقة الثنائية.',
            disableTitle: 'إيقاف المصادقة الثنائية؟',
            disableDesc: 'لأمان حسابك، أدخل كلمة المرور الحالية لتأكيد الإيقاف.',
            currentPassword: 'كلمة المرور الحالية',
            currentPasswordPlaceholder: 'أدخل كلمة المرور الحالية',
            cancel: 'إلغاء',
            confirmDisable: 'تأكيد الإيقاف'
          },
    [isEnglish]
  );

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [status, setStatus] = useState(STATUS.DISABLED);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isFlowOpen, setIsFlowOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const previewMaskedEmail = useMemo(() => maskEmailForDisplay(email), [email]);

  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      if (!userId) return;
      setIsLoadingStatus(true);
      try {
        const response = await accountSecurityApi.getSecurityStatus(userId);
        if (!mounted) return;

        const enabled = Boolean(response.twoFactorEnabled);
        setIsEnabled(enabled);
        setStatus(enabled ? STATUS.ENABLED : STATUS.DISABLED);
      } catch {
        if (!mounted) return;
        setIsEnabled(false);
        setStatus(STATUS.DISABLED);
      } finally {
        if (mounted) setIsLoadingStatus(false);
      }
    };

    loadStatus();
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== 0 || !isFlowOpen) return;
    if (status === STATUS.CODE_SENT || status === STATUS.ERROR_INVALID) {
      setStatus(STATUS.ERROR_EXPIRED);
      setFeedback({ type: 'error', message: text.expiredMsg });
    }
  }, [countdown, isFlowOpen, status, text.expiredMsg]);

  const badgeState = useMemo(() => {
    if (isLoadingStatus) return { label: '...', variant: 'info' };
    if (status === STATUS.SENDING) return { label: text.sending, variant: 'info' };
    if (status === STATUS.CODE_SENT) return { label: text.codeSent, variant: 'warning' };
    if (status === STATUS.VERIFYING) return { label: text.verifying, variant: 'info' };
    if (status === STATUS.ERROR_INVALID) return { label: text.invalidCode, variant: 'danger' };
    if (status === STATUS.ERROR_EXPIRED) return { label: text.expiredCode, variant: 'warning' };
    if (isEnabled) return { label: text.enabled, variant: 'success' };
    return { label: text.disabled, variant: 'default' };
  }, [isEnabled, isLoadingStatus, status, text]);

  const sendCode = async () => {
    if (!email || !String(email).includes('@')) {
      setFeedback({ type: 'error', message: isEnglish ? 'Invalid email for verification.' : 'البريد الإلكتروني غير صالح للتحقق.' });
      return;
    }

    setStatus(STATUS.SENDING);
    setFeedback({ type: 'info', message: '' });

    try {
      const response = await accountSecurityApi.sendEmailCode({ userId, email });
      setMaskedEmail(response.maskedEmail);
      setRequestId(response.requestId);
      setOtp('');
      setCountdown(response.expiresIn);
      setStatus(STATUS.CODE_SENT);
      setFeedback({ type: 'success', message: text.sentSuccess });
      addToast(text.sentSuccess, 'success');
    } catch (error) {
      setStatus(STATUS.DISABLED);
      const message = error?.message || (isEnglish ? 'Unable to send code.' : 'تعذّر إرسال الرمز.');
      setFeedback({ type: 'error', message });
      addToast(message, 'error');
    }
  };

  const verifyCode = async () => {
    if (otp.length !== 6) {
      setStatus(STATUS.ERROR_INVALID);
      setFeedback({
        type: 'error',
        message: isEnglish ? 'Please enter a complete 6-digit code.' : 'أدخل رمزًا كاملاً مكوّنًا من 6 أرقام.'
      });
      return;
    }

    setStatus(STATUS.VERIFYING);
    setFeedback({ type: 'info', message: '' });

    try {
      await accountSecurityApi.verifyEmailCode({ userId, email, requestId, code: otp });
      setIsEnabled(true);
      setStatus(STATUS.ENABLED);
      setFeedback({ type: 'success', message: text.activatedMsg });
      setIsFlowOpen(false);
      setOtp('');
      setRequestId('');
      setCountdown(0);
      addToast(text.activatedMsg, 'success');
    } catch (error) {
      if (error?.code === 'OTP_EXPIRED') {
        setStatus(STATUS.ERROR_EXPIRED);
        setFeedback({ type: 'error', message: text.expiredMsg });
        addToast(text.expiredMsg, 'warning');
        return;
      }
      setStatus(STATUS.ERROR_INVALID);
      setFeedback({ type: 'error', message: text.invalidMsg });
      addToast(text.invalidMsg, 'error');
    }
  };

  const handleToggle = () => {
    if (emailChangedPending) {
      setFeedback({ type: 'warning', message: text.saveEmailFirst });
      return;
    }

    if (isEnabled) {
      setDisablePassword('');
      setIsDisableDialogOpen(true);
      return;
    }

    setIsFlowOpen((prev) => !prev);
    setFeedback({ type: 'info', message: '' });
    setStatus(STATUS.DISABLED);
  };

  const disableTwoFactor = async () => {
    if (!disablePassword.trim()) {
      setFeedback({
        type: 'error',
        message: isEnglish ? 'Current password is required.' : 'كلمة المرور الحالية مطلوبة.'
      });
      return;
    }

    setIsDisabling(true);
    try {
      await accountSecurityApi.disableTwoFactor({ userId, currentPassword: disablePassword });
      setIsEnabled(false);
      setStatus(STATUS.DISABLED);
      setIsDisableDialogOpen(false);
      setFeedback({ type: 'success', message: text.deactivatedMsg });
      addToast(text.deactivatedMsg, 'success');
    } catch (error) {
      const message = error?.message || (isEnglish ? 'Could not disable 2FA.' : 'تعذّر إيقاف المصادقة الثنائية.');
      setFeedback({ type: 'error', message });
      addToast(message, 'error');
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <>
      <Card className="rounded-2xl border border-white/10 bg-gray-950/35 p-5 dark:border-white/10 dark:bg-gray-900/60">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Shield className="h-[18px] w-[18px] text-indigo-300" />
              {text.title}
            </h3>
            <p className="mt-1 text-sm text-gray-300/85">{text.description}</p>
          </div>
          <Badge variant={badgeState.variant}>{badgeState.label}</Badge>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleToggle}
            disabled={isLoadingStatus || (status === STATUS.SENDING || status === STATUS.VERIFYING)}
            variant={isEnabled ? 'danger' : 'primary'}
          >
            {isEnabled ? <ShieldAlert className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}
            {isEnabled ? text.disableBtn : text.enableBtn}
          </Button>
        </div>

        {emailChangedPending ? (
          <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            {text.saveEmailFirst}
          </div>
        ) : null}

        {feedback?.message ? (
          <div
            className={`mb-3 rounded-xl border p-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                : feedback.type === 'error'
                  ? 'border-rose-400/25 bg-rose-500/10 text-rose-200'
                  : feedback.type === 'warning'
                    ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                    : 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {isFlowOpen && !isEnabled ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-4 rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-200">
                {text.sentTo} <span className="font-semibold text-indigo-200">{maskedEmail || previewMaskedEmail || email}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={sendCode}
                  disabled={status === STATUS.SENDING || status === STATUS.VERIFYING}
                >
                  {status === STATUS.SENDING ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {text.sendCode}
                </Button>

                {countdown > 0 ? (
                  <span className="text-xs text-gray-300">
                    {text.countdown} {countdown}s
                  </span>
                ) : null}
              </div>

              {(requestId || status === STATUS.ERROR_INVALID || status === STATUS.ERROR_EXPIRED) ? (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-sm text-gray-200">{text.verifyHint}</p>
                  <OtpInput value={otp} onChange={setOtp} disabled={status === STATUS.VERIFYING} />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" onClick={verifyCode} disabled={status === STATUS.VERIFYING || otp.length !== 6}>
                      {status === STATUS.VERIFYING ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {text.verifyBtn}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={sendCode}
                      disabled={status === STATUS.SENDING || countdown > 0}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      {text.resendBtn}
                    </Button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>

      <ConfirmDialog
        open={isDisableDialogOpen}
        title={text.disableTitle}
        description={text.disableDesc}
        confirmLabel={text.confirmDisable}
        cancelLabel={text.cancel}
        isLoading={isDisabling}
        onConfirm={disableTwoFactor}
        onCancel={() => !isDisabling && setIsDisableDialogOpen(false)}
      >
        <Input
          type="password"
          value={disablePassword}
          onChange={(event) => setDisablePassword(event.target.value)}
          label={text.currentPassword}
          placeholder={text.currentPasswordPlaceholder}
        />
      </ConfirmDialog>
    </>
  );
};

export default TwoFactorCard;
