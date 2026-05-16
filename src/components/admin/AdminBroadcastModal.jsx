import React, { useEffect, useMemo, useState } from 'react';
import { Megaphone, SendHorizontal } from 'lucide-react';
import apiClient from '../../services/client';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input, { selectClassName, textareaClassName } from '../ui/Input';
import { useToast } from '../ui/Toast';

const defaultForm = {
  title: '',
  message: '',
  type: 'system',
  priority: 'normal',
};

const AdminBroadcastModal = ({ isOpen, onClose, onSent }) => {
  const { language, dir } = useLanguage();
  const { addToast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArabic = dir === 'rtl' || String(language || '').toLowerCase().startsWith('ar');

  const text = useMemo(() => ({
    title: isArabic ? 'إرسال إشعار عام' : 'Send Broadcast Alert',
    subtitle: isArabic
      ? 'سيظهر هذا الإشعار لجميع المستخدمين داخل التطبيق.'
      : 'This notification will appear for all users in the app.',
    titleLabel: isArabic ? 'العنوان' : 'Title',
    titlePlaceholder: isArabic ? 'مثال: تحديث مهم' : 'Example: Important update',
    messageLabel: isArabic ? 'الرسالة' : 'Message',
    messagePlaceholder: isArabic ? 'اكتب نص الإشعار هنا...' : 'Write the alert message...',
    typeLabel: isArabic ? 'النوع' : 'Type',
    priorityLabel: isArabic ? 'الأولوية' : 'Priority',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    send: isArabic ? 'إرسال الإشعار' : 'Send Alert',
    sending: isArabic ? 'جارٍ الإرسال...' : 'Sending...',
    requiredTitle: isArabic ? 'عنوان الإشعار مطلوب.' : 'Notification title is required.',
    requiredMessage: isArabic ? 'رسالة الإشعار مطلوبة.' : 'Notification message is required.',
    success: isArabic ? 'تم إرسال الإشعار العام بنجاح.' : 'Broadcast notification sent successfully.',
    error: isArabic ? 'تعذّر إرسال الإشعار العام.' : 'Unable to send broadcast notification.',
  }), [isArabic]);

  const typeOptions = useMemo(() => [
    { value: 'system', label: isArabic ? 'النظام' : 'System' },
    { value: 'order', label: isArabic ? 'الطلبات' : 'Orders' },
    { value: 'wallet', label: isArabic ? 'المحفظة' : 'Wallet' },
    { value: 'account', label: isArabic ? 'الحسابات' : 'Accounts' },
    { value: 'admin', label: isArabic ? 'إداري' : 'Admin' },
  ], [isArabic]);

  const priorityOptions = useMemo(() => [
    { value: 'low', label: isArabic ? 'منخفضة' : 'Low' },
    { value: 'normal', label: isArabic ? 'عادية' : 'Normal' },
    { value: 'high', label: isArabic ? 'عالية' : 'High' },
  ], [isArabic]);

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = text.requiredTitle;
    if (!form.message.trim()) nextErrors.message = text.requiredMessage;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      if (!apiClient?.notifications?.createBroadcast) {
        throw new Error(text.error);
      }
      const result = await apiClient.notifications.createBroadcast({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        priority: form.priority,
      });
      addToast(text.success, 'success');
      onSent?.(result);
      onClose?.();
    } catch (error) {
      addToast(error?.message || text.error, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose?.();
      }}
      title={text.title}
      size="lg"
      footer={(
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {text.cancel}
          </Button>
          <Button type="submit" form="admin-broadcast-form" disabled={isSubmitting}>
            <SendHorizontal className="h-4 w-4" />
            {isSubmitting ? text.sending : text.send}
          </Button>
        </div>
      )}
    >
      <form id="admin-broadcast-form" dir={isArabic ? 'rtl' : 'ltr'} onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] p-3 text-[var(--color-text)]">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.14)] text-[var(--color-primary)]">
              <Megaphone className="h-4 w-4" />
            </span>
            <p className="text-xs leading-6 text-[var(--color-text-secondary)] sm:text-sm">
              {text.subtitle}
            </p>
          </div>
        </div>

        <Input
          label={text.titleLabel}
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder={text.titlePlaceholder}
          error={errors.title}
          disabled={isSubmitting}
          maxLength={160}
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm">
            {text.messageLabel}
          </label>
          <textarea
            className={textareaClassName}
            value={form.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder={text.messagePlaceholder}
            disabled={isSubmitting}
            maxLength={1000}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.message}</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm">
              {text.typeLabel}
            </label>
            <select
              className={`${selectClassName} dark:[color-scheme:dark]`}
              value={form.type}
              onChange={(event) => updateField('type', event.target.value)}
              disabled={isSubmitting}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm">
              {text.priorityLabel}
            </label>
            <select
              className={`${selectClassName} dark:[color-scheme:dark]`}
              value={form.priority}
              onChange={(event) => updateField('priority', event.target.value)}
              disabled={isSubmitting}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AdminBroadcastModal;
