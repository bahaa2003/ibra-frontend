import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCcw } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import accountSecurityApi from '../../services/accountSecurityApi';
import useAuthStore from '../../store/useAuthStore';

const copyText = async (value) => {
  const text = String(value || '');
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
};

const ApiAccessCard = ({ user }) => {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const updateUserSession = useAuthStore((state) => state.updateUserSession);
  const isEnglish = language === 'en';

  const text = useMemo(
    () =>
      isEnglish
        ? {
            title: 'API Access',
            description: 'Use this token to authenticate requests to the reseller API.',
            enabled: 'Enabled',
            tokenLabel: 'Access token',
            noToken: 'Token hidden for security. Regenerate it if you need a new copy.',
            reveal: 'Reveal token',
            hide: 'Hide token',
            copy: 'Copy',
            regenerate: 'Regenerate Token',
            copyingDone: 'Token copied!',
            copyFailed: 'Could not copy token.',
            regenerated: 'Token regenerated successfully.',
            regenerateFailed: 'Could not regenerate token.',
            warning:
              '⚠️ Please copy this token and store it somewhere safe. It will not be shown again after refreshing the page for security reasons. If you lose it, generate a new token.',
          }
        : {
            title: 'الوصول عبر API',
            description: 'استخدم هذا التوكن لتوثيق طلباتك مع واجهة الموزعين.',
            enabled: 'مفعل',
            tokenLabel: 'توكن الوصول',
            noToken: 'التوكن مخفي لدواعي أمنية. قم بتوليد توكن جديد إذا كنت تحتاج نسخة منه.',
            reveal: 'إظهار التوكن',
            hide: 'إخفاء التوكن',
            copy: 'نسخ',
            regenerate: 'إعادة توليد التوكن',
            copyingDone: 'تم نسخ التوكن!',
            copyFailed: 'تعذر نسخ التوكن.',
            regenerated: 'تم إنشاء توكن جديد بنجاح.',
            regenerateFailed: 'تعذر إنشاء توكن جديد.',
            warning:
              '⚠️ يرجى نسخ التوكن وحفظه في مكان آمن. لن يتم عرض هذا التوكن مرة أخرى عند تحديث الصفحة لدواعي أمنية. إذا فقدته، قم بتوليد توكن جديد.',
          },
    [isEnglish]
  );

  const [token, setToken] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setToken('');
    setIsRevealed(false);
  }, [user?.id]);

  const handleCopy = async () => {
    try {
      const copied = await copyText(token);
      addToast(copied ? text.copyingDone : text.copyFailed, copied ? 'success' : 'error');
    } catch {
      addToast(text.copyFailed, 'error');
    }
  };

  const handleRegenerate = async () => {
    if (!user?.id || isRegenerating) return;

    setIsRegenerating(true);
    try {
      const response = await accountSecurityApi.regenerateApiToken({ userId: user.id });
      const nextToken = response?.apiToken || response?.user?.apiToken || '';
      setToken(nextToken);
      setIsRevealed(Boolean(nextToken));
      updateUserSession(response?.user || { apiToken: nextToken, isApiEnabled: true });
      addToast(text.regenerated, 'success');
    } catch (error) {
      addToast(error?.message || text.regenerateFailed, 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const displayValue = token ? token : text.noToken;

  return (
    <Card className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] p-5 shadow-[var(--shadow-subtle)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text)]">
            <KeyRound className="h-[18px] w-[18px] text-[var(--color-primary)]" />
            {text.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{text.description}</p>
        </div>
        <Badge variant="success">{text.enabled}</Badge>
      </div>

      <div className="mb-4 flex gap-3 rounded-xl border border-amber-400/45 bg-amber-50 px-3 py-3 text-sm text-amber-900 shadow-[var(--shadow-subtle)] dark:border-red-400/35 dark:bg-red-950/25 dark:text-red-100">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-red-300" />
        <p className="leading-6">{text.warning}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <Input
          label={text.tokenLabel}
          readOnly
          type={token && !isRevealed ? 'password' : 'text'}
          value={displayValue}
          className="font-mono text-xs"
          onFocus={(event) => event.target.select()}
          suffix={(
            <button
              type="button"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)] hover:text-[var(--color-primary)]"
              onClick={() => setIsRevealed((prev) => !prev)}
              disabled={!token}
              aria-label={isRevealed ? text.hide : text.reveal}
              title={isRevealed ? text.hide : text.reveal}
            >
              {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleCopy} disabled={!token}>
            <Copy className="h-4 w-4" />
            {text.copy}
          </Button>
          <Button type="button" onClick={handleRegenerate} disabled={isRegenerating}>
            {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            {text.regenerate}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ApiAccessCard;
