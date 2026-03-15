import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Copy, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UploadReceiptBox from '../components/wallet/UploadReceiptBox';
import { useLanguage } from '../context/LanguageContext';
import useSystemStore from '../store/useSystemStore';
import useTopupStore from '../store/useTopupStore';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/ui/Toast';
import { findPaymentMethodById } from '../utils/paymentSettings';

const getMethodPresentation = (method) => {
  const token = `${method?.id || ''} ${method?.name || ''}`.toLowerCase();

  if (token.includes('vodafone')) return { icon: 'VC', color: 'from-red-500 to-pink-500' };
  if (token.includes('etisalat')) return { icon: 'EC', color: 'from-green-500 to-teal-500' };
  if (token.includes('orange')) return { icon: 'OC', color: 'from-orange-500 to-red-500' };
  if (String(method?.type || '') === 'bank_transfer') return { icon: 'BT', color: 'from-blue-500 to-purple-500' };
  if (String(method?.type || '') === 'paypal') return { icon: 'PP', color: 'from-cyan-500 to-blue-600' };
  if (String(method?.type || '') === 'credit_card') return { icon: 'CC', color: 'from-amber-500 to-orange-600' };

  return { icon: 'PM', color: 'from-emerald-500 to-teal-600' };
};

const PaymentDetails = () => {
  const { methodId } = useParams();
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { paymentSettings, loadPaymentSettings } = useSystemStore();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';

  const [formData, setFormData] = useState({
    amount: '',
    senderNumber: '',
    transactionId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    notes: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    loadPaymentSettings();
  }, [loadPaymentSettings]);

  const selectedMethodEntry = useMemo(
    () => findPaymentMethodById(paymentSettings, methodId),
    [paymentSettings, methodId]
  );

  const group = selectedMethodEntry?.group || null;
  const method = selectedMethodEntry?.method || null;

  const methodPresentation = useMemo(
    () => getMethodPresentation(method),
    [method]
  );

  const methodFields = method?.fields || ['amount', 'senderNumber', 'transactionId'];
  const methodInstructions = method?.instructions || paymentSettings?.instructions || t('payments.chooseMethod');
  const requiresReceipt = Boolean(method?.accountNumber);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyAccount = async () => {
    const value = String(method?.accountNumber || '').trim();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      addToast(
        t('payments.copySuccess', { defaultValue: dir === 'rtl' ? 'تم نسخ الرقم' : 'Number copied' }),
        'success'
      );
    } catch (_error) {
      addToast(
        t('payments.copyFailed', { defaultValue: dir === 'rtl' ? 'تعذر نسخ الرقم' : 'Unable to copy number' }),
        'error'
      );
    }
  };

  const validate = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) return t('payments.validationAmount');
    if (methodFields.includes('senderNumber') && !formData.senderNumber) return t('payments.validationSenderNumber');
    if (methodFields.includes('transactionId') && !formData.transactionId) return t('payments.validationTransactionId');
    if (requiresReceipt && !uploadedFile) return t('payments.validationReceipt');
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      window.alert(validationMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('UI Form Submitted', { formData, uploadedFile });

      const { user } = useAuthStore.getState();
      const { requestTopup } = useTopupStore.getState();

      await requestTopup({
        requestedAmount: parseFloat(formData.amount),
        amount: parseFloat(formData.amount),
        senderWalletNumber: formData.senderNumber || '',
        transferredFromNumber: formData.senderNumber || '',
        proofImage: uploadedFile || null,
        paymentChannel: method?.name || methodId || '',
        currencyCode: user?.currency || 'USD',
        userId: user?.id || '',
        userName: user?.name || '',
        type: 'regular',
      });

      setSubmitStatus('success');
      setTimeout(() => navigate('/wallet'), 3000);
    } catch (error) {
      console.error('Topup submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldConfigs = {
    amount: {
      label: t('payments.fields.amount'),
      placeholder: t('payments.fields.amountPlaceholder'),
      type: 'number',
      min: '1',
    },
    senderNumber: {
      label: t('payments.fields.senderNumber'),
      placeholder: t('payments.fields.senderNumberPlaceholder'),
      type: 'tel',
    },
    transactionId: {
      label: t('payments.fields.transactionId'),
      placeholder: t('payments.fields.transactionIdPlaceholder'),
      type: 'text',
    },
    cardNumber: {
      label: t('payments.fields.cardNumber'),
      placeholder: t('payments.fields.cardNumberPlaceholder'),
      type: 'text',
    },
    expiryDate: {
      label: t('payments.fields.expiryDate'),
      placeholder: t('payments.fields.expiryDatePlaceholder'),
      type: 'text',
    },
    cvv: {
      label: t('payments.fields.cvv'),
      placeholder: t('payments.fields.cvvPlaceholder'),
      type: 'text',
    },
  };

  if (!method) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-gray-200 bg-white/80 p-8 text-center dark:border-gray-800 dark:bg-gray-900/70">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{t('payments.invalidMethodTitle')}</h1>
          <button
            type="button"
            onClick={() => navigate('/wallet/add-balance')}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            {t('payments.invalidMethodAction')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={isRTL ? 'text-right' : 'text-left'}
        >
          <div className={`mb-2 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${methodPresentation.color}`}>
              <span className="text-xs font-bold text-white">{methodPresentation.icon}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{method.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{methodInstructions}</p>
              {group?.name && (
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-primary)]">
                  {group.name}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {method.accountNumber && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-gray-200 bg-white/80 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/70"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('payments.accountDetails')}</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50/90 p-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className={`mb-2 text-sm text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                {methodInstructions}
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className={`flex w-full items-center justify-between gap-3 rounded border border-gray-200 bg-white px-3 py-2 font-mono text-gray-900 transition-colors hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-indigo-500/40 dark:hover:bg-gray-900 ${
                  isRTL ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                <span className="truncate">{method.accountNumber}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t('payments.copyAccount', { defaultValue: dir === 'rtl' ? 'نسخ الرقم' : 'Copy number' })}</span>
                </span>
              </button>
              {method.bankName && (
                <div className={`mt-2 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {method.bankName}
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-gray-200 bg-white/82 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/72"
        >
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{t('payments.paymentDetails')}</h3>

          {methodFields.map((field) => {
            const config = fieldConfigs[field];
            if (!config) return null;

            return (
              <div key={field} className="mb-4">
                <label className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {config.label}
                </label>
                <input
                  type={config.type}
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={config.placeholder}
                  min={config.min}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
            );
          })}

          <div className="mb-6">
            <label className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('payments.notesOptional')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('payments.notesPlaceholder')}
              rows={3}
              className={`w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
              disabled={isSubmitting}
            />
          </div>

          {requiresReceipt && (
            <div className="mb-6">
              <label className={`mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('payments.uploadReceipt')}
              </label>
              <UploadReceiptBox onFileUpload={setUploadedFile} />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>{t('common.processing')}</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>{t('payments.confirmPayment')}</span>
              </>
            )}
          </button>
        </motion.form>

        {submitStatus === 'success' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-green-500/30 bg-green-500/20 p-6 text-center"
          >
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
            <h3 className="mb-2 text-xl font-semibold text-green-500 dark:text-green-400">{t('payments.submitSuccessTitle')}</h3>
            <p className="text-green-700 dark:text-green-300">{t('payments.submitSuccessDesc')}</p>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-red-500/30 bg-red-500/20 p-6 text-center"
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h3 className="mb-2 text-xl font-semibold text-red-500 dark:text-red-400">{t('payments.submitErrorTitle')}</h3>
            <p className="text-red-700 dark:text-red-300">{t('payments.submitErrorDesc')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;
