import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  Package2,
  ShoppingBag,
  X,
  Zap,
} from 'lucide-react';
import Button, { cn } from '../ui/Button';
import Badge from '../ui/Badge';
import { useToast } from '../ui/Toast';
import useAuthStore from '../../store/useAuthStore';
import useGroupStore from '../../store/useGroupStore';
import useOrderStore from '../../store/useOrderStore';
import useSystemStore from '../../store/useSystemStore';
import { useLanguage } from '../../context/LanguageContext';
import {
  calculateProductPrice,
  formatCurrencyAmount,
  getCurrencyMeta,
  resolveProductUnitPrice,
} from '../../utils/pricing';
import { normalizeMoneyAmount } from '../../utils/money';
import { formatGroupedNumberString } from '../../utils/intl';
import { getProductStatus } from '../../utils/productStatus';
import {
  clampProductQuantity,
  getProductQuantityMeta,
  resolveProductDynamicFields,
  resolveProductOrderFields,
  sanitizeOrderFieldValue,
} from '../../utils/productPurchase';
import { isApprovedAccountStatus } from '../../utils/accountStatus';
import { devLogger } from '../../utils/devLogger';
import purchaseBrandImage from '../../assets/coins-optimized.webp';

const getCopy = (language = 'ar') => {
  if (language === 'en') {
    return {
      closeLabel: 'Close',
      quickOrder: 'Quick Order',
      unitPrice: 'Unit Price',
      available: 'Available',
      unavailable: 'Unavailable',
      orderFields: 'Order Fields',
      orderFieldsHint: 'Fill in the required details before purchase.',
      quantityTitle: 'Quantity',
      countTitle: 'Count',
      min: 'Min',
      max: 'Max',
      step: 'Step',
      total: 'Total',
      totalHint: 'Updated automatically based on quantity.',
      buy: 'Buy',
      cancel: 'Cancel',
      processing: 'Processing...',
      insufficientTitle: 'Insufficient balance',
      insufficientMessage: (amount) => `You need ${amount} more to complete this order.`,
      pendingTitle: 'Account pending approval',
      pendingMessage: 'Your account must be approved before placing orders.',
      unavailableTitle: 'Product unavailable',
      unavailableMessage: 'This product is currently unavailable for purchase.',
      preparingTitle: 'Preparing sheet',
      preparingMessage: 'Loading pricing and currency details...',
      successTitle: 'Order placed',
      successMessage: 'Your order has been submitted successfully.',
      successDone: 'Completed successfully',
      successViewOrder: 'Order details',
      failedTitle: 'Unable to complete order',
      failedMessage: 'Something went wrong while placing this order.',
      invalidAmountMessage: 'Unable to place this order because the amount is invalid.',
      invalidQuantity: 'Selected quantity is not valid for this product.',
      userIdRequired: 'Enter the User ID in the field above to complete your purchase.',
      fieldRequired: (label) => `${label} is required.`,
      placeholder: (label) => `Enter ${label}`,
    };
  }

  return {
    closeLabel: 'إغلاق',
    quickOrder: 'طلب سريع',
    unitPrice: 'سعر الوحدة',
    available: 'متوفر',
    unavailable: 'غير متوفر',
    orderFields: 'بيانات الطلب',
    orderFieldsHint: 'أدخل البيانات المطلوبة قبل تنفيذ عملية الشراء.',
    quantityTitle: 'الكمية',
    countTitle: 'العدد',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    step: 'الزيادة',
    total: 'الإجمالي',
    totalHint: 'يتحدث تلقائيًا حسب الكمية المختارة.',
    buy: 'شراء',
    cancel: 'إلغاء',
    processing: 'جارٍ تنفيذ الطلب...',
    insufficientTitle: 'الرصيد غير كافٍ',
    insufficientMessage: (amount) => `تحتاج إلى ${amount} إضافية لإتمام الطلب.`,
    pendingTitle: 'الحساب بانتظار التفعيل',
    pendingMessage: 'لا يمكنك تنفيذ الطلبات قبل تفعيل الحساب من الإدارة.',
    unavailableTitle: 'المنتج غير متاح',
    unavailableMessage: 'هذا المنتج غير متاح للشراء حاليًا.',
    preparingTitle: 'جارٍ تجهيز النافذة',
    preparingMessage: 'يتم تحميل تفاصيل السعر والعملة الآن...',
    successTitle: 'تم إرسال الطلب',
    successMessage: 'تم تنفيذ طلبك بنجاح وسيظهر في طلباتك مباشرة.',
    successDone: 'تمت العملية بنجاح',
    successViewOrder: 'تفاصيل الطلب',
    failedTitle: 'تعذر تنفيذ الطلب',
    failedMessage: 'حدث خطأ أثناء تنفيذ الطلب. حاول مرة أخرى.',
    invalidAmountMessage: 'لا يمكن تنفيذ الطلب لأن قيمة الشراء غير صالحة.',
    invalidQuantity: 'الكمية الحالية غير صالحة لهذا المنتج.',
    userIdRequired: 'أدخل آيدي المستخدم في الخانة بالأعلى لإكمال عملية الشراء.',
    fieldRequired: (label) => `يرجى إدخال ${label}`,
    placeholder: (label) => `أدخل ${label}`,
  };
};

const resolveFieldLabel = (field, language = 'ar') => {
  if (field?.key === 'playerId') {
    return language === 'en' ? 'User ID' : 'ايدي مستخدم';
  }
  return field?.label || field?.key || '';
};

const statusToneStyles = {
  info: 'border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-white',
  warning: 'border-[color:rgb(var(--color-warning-rgb)/0.34)] bg-[color:rgb(var(--color-warning-rgb)/0.15)] text-white',
  danger: 'border-[color:rgb(var(--color-error-rgb)/0.34)] bg-[color:rgb(var(--color-error-rgb)/0.15)] text-white',
  success: 'border-[color:rgb(var(--color-success-rgb)/0.34)] bg-[color:rgb(var(--color-success-rgb)/0.16)] text-white',
};

const statusToneIcon = {
  info: LoaderCircle,
  warning: AlertCircle,
  danger: AlertCircle,
  success: CheckCircle2,
};

const ProductPurchaseSheet = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { language, dir } = useLanguage();
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const updateUserSession = useAuthStore((state) => state.updateUserSession);
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const addOrder = useOrderStore((state) => state.addOrder);
  const currencies = useSystemStore((state) => state.currencies);
  const loadCurrencies = useSystemStore((state) => state.loadCurrencies);

  const locale = language === 'en' ? 'en-US' : 'ar-EG';
  const isRTL = dir === 'rtl';
  const copy = useMemo(() => getCopy(language), [language]);

  const [isPreparing, setIsPreparing] = useState(false);
  const [fieldValues, setFieldValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [dynamicValues, setDynamicValues] = useState({});
  const [dynamicErrors, setDynamicErrors] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [quantityError, setQuantityError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusCard, setStatusCard] = useState({ tone: 'info', title: '', message: '' });
  const [successfulOrderId, setSuccessfulOrderId] = useState(null);
  const [successMeta, setSuccessMeta] = useState({ amount: '', identifier: '', orderNumber: '' });

  const orderFields = useMemo(
    () => resolveProductOrderFields(product, language),
    [language, product]
  );

  const dynamicFields = useMemo(
    () => resolveProductDynamicFields(product),
    [product]
  );

  const quantityMeta = useMemo(
    () => getProductQuantityMeta(product),
    [product]
  );

  const productTitle = useMemo(() => {
    if (language === 'en') return product?.name || product?.nameAr || '';
    return product?.nameAr || product?.name || '';
  }, [language, product]);

  const productSubtitle = useMemo(() => {
    if (language === 'en' && product?.nameAr && product?.nameAr !== productTitle) return product.nameAr;
    if (language !== 'en' && product?.name && product?.name !== productTitle) return product.name;
    if (product?.externalProductId) return product.externalProductId;
    if (product?.sku) return product.sku;
    return '';
  }, [language, product, productTitle]);

  const productDescription = useMemo(() => {
    if (language === 'en') return String(product?.description || product?.descriptionAr || '').trim();
    return String(product?.descriptionAr || product?.description || '').trim();
  }, [language, product?.description, product?.descriptionAr]);

  useEffect(() => {
    if (!product) return;

    const nextFields = {};
    orderFields.forEach((field) => {
      nextFields[field.key] = '';
    });

    const nextDynamicFields = {};
    dynamicFields.forEach((field) => {
      nextDynamicFields[field.name] = '';
    });

    setFieldValues(nextFields);
    setFieldErrors({});
    setDynamicValues(nextDynamicFields);
    setDynamicErrors({});
    setQuantity(quantityMeta.minQty);
    setQuantityInput(formatGroupedNumberString(quantityMeta.minQty));
    setQuantityError('');
    setIsSubmitting(false);
    setStatusCard({ tone: 'info', title: '', message: '' });
    setSuccessfulOrderId(null);
    setSuccessMeta({ amount: '', identifier: '', orderNumber: '' });
  }, [dynamicFields, orderFields, product?.id, quantityMeta.minQty]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    let active = true;
    if (!isOpen) return undefined;

    if (Array.isArray(currencies) && currencies.length > 0) {
      setIsPreparing(false);
      return () => {
        active = false;
      };
    }

    setIsPreparing(true);
    Promise.resolve(loadCurrencies())
      .finally(() => {
        if (active) setIsPreparing(false);
      });

    return () => {
      active = false;
    };
  }, [currencies, isOpen, loadCurrencies]);

  const userCurrencyCode = String(user?.currency || 'USD').toUpperCase();
  const pricingGroup = user?.groupId || user?.group || 'Normal';
  const pricingGroupPercentage = user?.groupPercentage ?? null;
  const pricingSnapshot = useMemo(() => {
    if (!product) {
      return { unitPriceBase: 0, unitPrice: 0 };
    }

    return {
      unitPriceBase: calculateProductPrice(product, pricingGroup, pricingGroupPercentage),
      unitPrice: resolveProductUnitPrice(product, userCurrencyCode, currencies, pricingGroup, pricingGroupPercentage),
    };
  }, [currencies, groupsLastLoadedAt, pricingGroup, pricingGroupPercentage, product, userCurrencyCode]);

  if (!isOpen || !product) return null;

  const productState = getProductStatus(product, language);
  const isApproved = isApprovedAccountStatus(user?.status);
  const userCurrency = getCurrencyMeta(userCurrencyCode, currencies);
  const unitPriceBase = pricingSnapshot.unitPriceBase;
  const unitPrice = pricingSnapshot.unitPrice;
  const totalPrice = normalizeMoneyAmount(unitPrice * quantity);
  const hasValidAmount = Number.isFinite(totalPrice) && totalPrice > 0;
  const balance = normalizeMoneyAmount(user?.coins || 0);
  const creditLimit = normalizeMoneyAmount(Math.max(0, Number(user?.creditLimit || 0)));
  const spendableBalance = normalizeMoneyAmount(balance + creditLimit);
  const canAfford = spendableBalance >= totalPrice;

  const formattedUnitPrice = formatCurrencyAmount(unitPrice, userCurrencyCode, currencies, locale);
  const formattedTotalPrice = formatCurrencyAmount(totalPrice, userCurrencyCode, currencies, locale);
  const missingAmount = formatCurrencyAmount(Math.max(0, totalPrice - spendableBalance), userCurrencyCode, currencies, locale);

  const hasQuantityInput = String(quantityInput ?? '').trim().length > 0;
  const selectedQuantityIsValid = (
    hasQuantityInput
    && !quantityError
    && quantity === clampProductQuantity(quantity, product)
  );
  const canSubmit = (
    productState.isPurchasable
    && isApproved
    && canAfford
    && hasValidAmount
    && selectedQuantityIsValid
    && !isPreparing
    && !isSubmitting
    && statusCard.tone !== 'success'
  );

  const availabilityLabel = productState.isPurchasable
    ? (productState.badgeLabel || copy.available)
    : (productState.badgeLabel || copy.unavailable);

  const availabilityVariant = productState.isPurchasable ? 'success' : (productState.badgeColor || 'warning');
  const StatusIcon = statusToneIcon[statusCard.tone] || AlertCircle;
  const purchaseFieldClassName = 'purchase-neon-field h-10 w-full rounded-lg border border-[#d8b86b]/20 bg-[#080907]/70 px-3 text-[12px] font-medium text-[#fffaf0] outline-none transition placeholder:text-white/28 hover:border-[#d8b86b]/30 focus:border-[#e7cb82]/65 focus:bg-black/80 focus:ring-2 focus:ring-[#d8b86b]/10 disabled:cursor-not-allowed disabled:opacity-50';

  const handleClose = () => {
    if (isSubmitting) return;
    setSuccessfulOrderId(null);
    setSuccessMeta({ amount: '', identifier: '', orderNumber: '' });
    onClose();
  };

  const handleSuccessDismiss = () => {
    setSuccessfulOrderId(null);
    setSuccessMeta({ amount: '', identifier: '', orderNumber: '' });
    onClose();
  };

  const handleOpenOrderDetails = () => {
    const orderId = String(successfulOrderId || '').trim();
    if (!orderId) {
      handleSuccessDismiss();
      return;
    }

    setSuccessfulOrderId(null);
    setSuccessMeta({ amount: '', identifier: '', orderNumber: '' });
    onClose();
    navigate(`/orders?orderId=${encodeURIComponent(orderId)}`);
  };

  const handleCopyOrderNumber = async () => {
    const orderNumber = String(successMeta.orderNumber || successfulOrderId || '').trim();
    if (!orderNumber) return;

    try {
      await navigator.clipboard.writeText(orderNumber);
      addToast(language === 'en' ? 'Order number copied' : 'تم نسخ رقم الطلب', 'success');
    } catch (_error) {
      addToast(language === 'en' ? 'Unable to copy order number' : 'تعذر نسخ رقم الطلب', 'error');
    }
  };

  const handleFieldChange = (fieldKey, value) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldKey]: sanitizeOrderFieldValue(value),
    }));

    setFieldErrors((prev) => {
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicValues((prev) => ({
      ...prev,
      [fieldName]: sanitizeOrderFieldValue(value),
    }));

    setDynamicErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const applyQuantity = (rawValue) => {
    const raw = String(rawValue ?? '');
    const normalizedRaw = raw.replace(/[^\d]/g, '');
    const formattedRaw = normalizedRaw ? formatGroupedNumberString(normalizedRaw) : '';
    setQuantityInput(formattedRaw);

    const trimmed = normalizedRaw.trim();
    if (!trimmed) {
      setQuantityError('');
      return;
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      setQuantityError(copy.invalidQuantity);
      return;
    }

    const normalized = clampProductQuantity(numeric, product);
    if (normalized !== numeric) {
      setQuantityError(copy.invalidQuantity);
      return;
    }

    setQuantity(numeric);
    setQuantityError('');
  };

  const handleQuantityBlur = () => {
    const trimmed = String(quantityInput ?? '').replace(/[^\d]/g, '').trim();
    if (!trimmed) {
      setQuantityInput('');
      setQuantityError('');
      return;
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      setQuantityInput(String(quantity));
      setQuantityError('');
      return;
    }

    const normalized = clampProductQuantity(numeric, product);
    setQuantity(normalized);
    setQuantityInput(formatGroupedNumberString(normalized));
    setQuantityError(normalized !== numeric ? copy.invalidQuantity : '');
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    orderFields.forEach((field) => {
      const label = resolveFieldLabel(field, language);
      if (!String(fieldValues[field.key] || '').trim()) {
        nextErrors[field.key] = field.key === 'playerId'
          ? copy.userIdRequired
          : copy.fieldRequired(label);
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const nextDynamicErrors = {};
    dynamicFields.forEach((field) => {
      const rawValue = String(dynamicValues[field.name] || '').trim();
      if (field.required !== false && !rawValue) {
        nextDynamicErrors[field.name] = copy.fieldRequired(field.label);
      } else if (rawValue && field.type === 'number' && !Number.isFinite(Number(rawValue))) {
        nextDynamicErrors[field.name] = `${field.label} must be a number.`;
      }
    });

    if (Object.keys(nextDynamicErrors).length > 0) {
      setDynamicErrors(nextDynamicErrors);
      return;
    }

    if (!selectedQuantityIsValid) {
      setQuantityError(copy.invalidQuantity);
      return;
    }

    if (!productState.isPurchasable) {
      const message = productState.helperText || copy.unavailableMessage;
      setStatusCard({ tone: 'warning', title: copy.unavailableTitle, message });
      addToast(message, 'warning');
      return;
    }

    if (!isApproved) {
      setStatusCard({ tone: 'warning', title: copy.pendingTitle, message: copy.pendingMessage });
      addToast(copy.pendingMessage, 'warning');
      return;
    }

    if (!canAfford) {
      const message = copy.insufficientMessage(missingAmount);
      setStatusCard({ tone: 'danger', title: copy.insufficientTitle, message });
      addToast(copy.insufficientTitle, 'error');
      return;
    }

    if (!hasValidAmount) {
      addToast(copy.invalidAmountMessage, 'error');
      return;
    }

    setIsSubmitting(true);
    setStatusCard({ tone: 'info', title: copy.preparingTitle, message: copy.preparingMessage });

    try {
      const normalizedFields = Object.fromEntries(
        orderFields.map((field) => [
          field.key,
          sanitizeOrderFieldValue(fieldValues[field.key]).trim(),
        ])
      );
      const dynamicData = Object.fromEntries(
        dynamicFields.map((field) => [
          field.name,
          field.type === 'number'
            ? Number(dynamicValues[field.name])
            : sanitizeOrderFieldValue(dynamicValues[field.name]).trim(),
        ]).filter(([, value]) => value !== '' && value !== null && value !== undefined && !(typeof value === 'number' && Number.isNaN(value)))
      );

      const userIdentifier = String(
        normalizedFields.playerId
        || normalizedFields.uid
        || Object.values(normalizedFields).find((value) => String(value || '').trim())
        || Object.values(dynamicData).find((value) => String(value || '').trim())
        || ''
      ).trim();
      const fieldsSnapshot = Array.isArray(product?.orderFields) && product.orderFields.length > 0
        ? product.orderFields.map((field) => ({ ...field }))
        : orderFields.map((field) => ({
          key: field.key,
          label: field.label,
          placeholder: field.placeholder,
          type: field.type,
        }));

      const createResult = await addOrder({
        id: `ord-${Date.now()}`,
        userId: user.id,
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr,
        quantity,
        unitPrice,
        unitPriceBase,
        priceCoins: totalPrice,
        currencyCode: userCurrencyCode,
        exchangeRateAtExecution: userCurrency.rate,
        playerId: userIdentifier,
        orderFields: normalizedFields,
        orderFieldsValues: normalizedFields,
        dynamicData,
        customerInput: {
          values: Object.keys(dynamicData).length ? dynamicData : normalizedFields,
          fieldsSnapshot: Object.keys(dynamicData).length ? dynamicFields.map((field) => ({ ...field })) : fieldsSnapshot,
          quantitySnapshot: quantityMeta,
        },
        quantitySnapshot: quantityMeta,
        status: 'pending',
        createdAt: new Date().toISOString(),
        idempotencyKey: `${user.id}-${product.id}-${userIdentifier}-${Date.now()}`,
      });

      const nextBalance = Number(createResult?.updatedBalance);
      if (Number.isFinite(nextBalance)) {
        updateUserSession({ coins: normalizeMoneyAmount(nextBalance) });
      } else {
        updateUserSession({ coins: normalizeMoneyAmount(balance - totalPrice) });
      }

      const createdOrder = createResult?.order || createResult || {};
      const createdOrderId = String(createdOrder?.id || createdOrder?.orderId || '').trim();
      const createdOrderNumber = String(
        createdOrder?.siteOrderNumber
        || createdOrder?.orderNumber
        || createdOrder?.id
        || createdOrderId
      ).trim();
      setSuccessfulOrderId(createdOrderId || `ord-${Date.now()}`);
      setSuccessMeta({
        amount: formattedTotalPrice,
        identifier: userIdentifier,
        orderNumber: createdOrderNumber,
      });
      setStatusCard({ tone: 'success', title: copy.successTitle, message: copy.successMessage });
      addToast(copy.successMessage, 'success');
    } catch (error) {
      if (String(error?.code || '').toUpperCase() === 'PROVIDER_PRICE_INCREASED') {
        const priceMsg = language === 'en'
          ? 'The price for this service has been updated by the provider. Please refresh and review the new price.'
          : 'عفواً، تم تحديث سعر هذه الخدمة من المصدر. برجاء تحديث الصفحة لرؤية السعر الجديد.';
        setStatusCard({ tone: 'warning', title: language === 'en' ? 'Price Updated' : 'تم تحديث السعر', message: priceMsg });
        addToast(priceMsg, 'warning');
      } else {
        const message = '\u062a\u0639\u0630\u0631 \u062a\u0646\u0641\u064a\u0630 \u0627\u0644\u0637\u0644\u0628 \u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u0645\u0633\u0624\u0648\u0644';
        if (String(error?.code || '').toUpperCase() !== 'INVALID_ORDER_AMOUNT') {
          devLogger.warnUnlessBenign('Order submit error:', error);
        }
        setStatusCard({ tone: 'danger', title: copy.failedTitle, message });
        addToast(message, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            className="absolute inset-0 w-full bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-label={copy.closeLabel}
          />

          <div className="absolute inset-0 flex items-center justify-center p-2.5">
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label={productTitle}
              initial={{ opacity: 0, y: 40, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 22, scale: 0.99 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ fontFamily: language === 'en' ? '"Plus Jakarta Sans", sans-serif' : '"IBM Plex Sans Arabic", sans-serif' }}
              className="purchase-sheet purchase-neon-border relative flex max-h-[min(92vh,38rem)] w-full max-w-[21rem] flex-col overflow-hidden rounded-[1.25rem] border border-[#d8b86b]/25 bg-[radial-gradient(circle_at_50%_-12%,rgba(216,184,107,0.16),transparent_38%),linear-gradient(160deg,#181713_0%,#0d0e0d_52%,#070807_100%)] text-white shadow-[0_26px_80px_-28px_rgba(0,0,0,0.95),0_0_42px_-28px_rgba(216,184,107,0.72)]"
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="absolute right-2.5 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-slate-950/40 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                aria-label={copy.closeLabel}
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              <header className="purchase-sheet__header border-b border-white/8 px-3 pb-2.5 pt-2.5">
                <div className="flex items-center gap-1.5 [direction:ltr]">
                  <Badge variant={availabilityVariant} className="px-2 py-0.5 text-[9px]">{availabilityLabel}</Badge>
                  <Badge variant="premium" className="gap-1 border-[#d8b86b]/20 bg-[#d8b86b]/10 px-2 py-0.5 text-[9px] text-[#ecd28f]">
                    <Zap className="h-3 w-3" />
                    {copy.quickOrder}
                  </Badge>
                </div>

                <div className="text-center">
                  <img
                    src={purchaseBrandImage}
                    alt="IBRA"
                    loading="eager"
                    decoding="async"
                    className="-mt-2 mx-auto h-11 w-full max-w-[9rem] object-contain opacity-90"
                  />

                  <div className="mt-1 flex items-center gap-2.5 [direction:ltr]">
                    {product?.image ? (
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#d8b86b]/20 bg-[#d8b86b]/8">
                        <img
                          src={product.image}
                          alt={productTitle}
                          loading="eager"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d8b86b]/20 bg-[#d8b86b]/8">
                        <Package2 className="h-4 w-4 text-[#e5c878]" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 text-right [direction:rtl]">
                      <h2 className="line-clamp-1 text-right text-sm font-bold leading-5 text-white">
                        {productTitle}
                      </h2>
                      {productSubtitle ? (
                        <p className="truncate text-right text-[9px] text-[#ead9a8]/55">
                          {productSubtitle}
                        </p>
                      ) : null}
                      {productDescription ? (
                        <p className="mt-0.5 line-clamp-1 text-right text-[9px] text-white/45">
                          {productDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
                {!canAfford && isApproved && productState.isPurchasable ? (
                  <div className="rounded-xl border border-[color:rgb(var(--color-error-rgb)/0.38)] bg-[color:rgb(var(--color-error-rgb)/0.14)] p-2.5 sm:rounded-2xl sm:p-3">
                    <p className="text-[11px] font-semibold text-white sm:text-xs">{copy.insufficientTitle}</p>
                    <p className="mt-0.5 text-[11px] text-white/80 sm:text-xs">{copy.insufficientMessage(missingAmount)}</p>
                  </div>
                ) : null}

                {!isApproved ? (
                  <div className="rounded-xl border border-[color:rgb(var(--color-warning-rgb)/0.36)] bg-[color:rgb(var(--color-warning-rgb)/0.14)] p-2.5 sm:rounded-2xl sm:p-3">
                    <p className="text-[11px] font-semibold text-white sm:text-xs">{copy.pendingTitle}</p>
                    <p className="mt-0.5 text-[11px] text-white/80 sm:text-xs">{copy.pendingMessage}</p>
                  </div>
                ) : null}

                {!productState.isPurchasable ? (
                  <div className="rounded-xl border border-[color:rgb(var(--color-warning-rgb)/0.36)] bg-[color:rgb(var(--color-warning-rgb)/0.14)] p-2.5 sm:rounded-2xl sm:p-3">
                    <p className="text-[11px] font-semibold text-white sm:text-xs">{copy.unavailableTitle}</p>
                    <p className="mt-0.5 text-[11px] text-white/80 sm:text-xs">{productState.helperText || copy.unavailableMessage}</p>
                  </div>
                ) : null}

                <section className="purchase-sheet__quantity rounded-[0.9rem] border border-[#d8b86b]/18 bg-[#d8b86b]/[0.045]">
                  <div className={cn('flex items-center justify-between gap-2 border-b border-white/6 px-3 py-2', isRTL && '[direction:rtl]')}>
                    <div>
                      <p className="text-[10px] font-bold text-white">{copy.quantityTitle}</p>
                      <p className="mt-0.5 text-[8px] text-white/40">
                        {copy.min} {formatGroupedNumberString(quantityMeta.minQty)} · {copy.max} {formatGroupedNumberString(quantityMeta.maxQty)}
                      </p>
                    </div>
                    <span className="rounded-md border border-[#d8b86b]/15 bg-[#d8b86b]/8 px-1.5 py-0.5 text-[8px] font-bold text-[#e7cb82]">
                      {copy.step} {formatGroupedNumberString(quantityMeta.stepQty)}
                    </span>
                  </div>

                  <div className={cn('grid gap-2 px-3 pb-3 pt-2.5', isRTL && '[direction:rtl]')}>
                    <div className="purchase-sheet__quantity-input purchase-neon-field flex h-10 items-center overflow-hidden rounded-[0.7rem] border border-[#d8b86b]/18 bg-black/25 px-2 focus-within:border-[#d8b86b]/50 focus-within:ring-2 focus-within:ring-[#d8b86b]/8">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={quantityInput}
                        onChange={(event) => applyQuantity(event.target.value)}
                        onBlur={handleQuantityBlur}
                        disabled={isSubmitting}
                        placeholder={language === 'en' ? 'Enter quantity' : 'ادخل العدد'}
                        className="h-full min-w-0 flex-1 bg-transparent px-2 text-center text-sm font-bold text-white outline-none placeholder:text-[10px] placeholder:font-medium placeholder:text-white/30"
                      />
                    </div>

                    <div className="purchase-sheet__total relative overflow-hidden rounded-[0.7rem] border border-[#d8b86b]/25 bg-[linear-gradient(135deg,rgba(216,184,107,0.16),rgba(216,184,107,0.035))] px-3 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#f1d78e]/65 to-transparent" />
                      <p className="text-[9px] font-semibold tracking-[0.08em] text-[#d8b86b]">{copy.total}</p>
                      <p className="mt-0.5 break-words text-xl font-bold leading-tight text-[#fff8e5]" dir="ltr">{formattedTotalPrice}</p>
                    </div>
                    {quantityError ? (
                      <p className="rounded-md border border-red-400/15 bg-red-500/8 px-2 py-1.5 text-center text-[10px] font-medium text-[#ffb4b4]">{quantityError}</p>
                    ) : null}
                  </div>
                </section>

                <section className="purchase-sheet__fields space-y-2 rounded-xl border border-[#d8b86b]/12 bg-white/[0.025] p-2.5">
                  {dynamicFields.map((field) => {
                    const label = field.label || field.name;
                    if (field.type === 'select') {
                      return (
                        <div key={field.name} className="space-y-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                          <label className="block px-0.5 text-[10px] font-semibold text-[#ead9a8]">{label}</label>
                          <select
                            value={dynamicValues[field.name] || ''}
                            onChange={(event) => handleDynamicFieldChange(field.name, event.target.value)}
                            disabled={isSubmitting || statusCard.tone === 'success'}
                            className={`${purchaseFieldClassName} cursor-pointer appearance-none dark:[color-scheme:dark]`}
                          >
                            <option value="" className="bg-[#120b06] text-white">{copy.placeholder(label)}</option>
                            {(field.options || []).map((option) => (
                              <option key={option} value={option} className="bg-[#120b06] text-white">{option}</option>
                            ))}
                          </select>
                          {dynamicErrors[field.name] ? (
                            <p className="px-0.5 text-[10px] font-medium text-[#ff9f9f]">{dynamicErrors[field.name]}</p>
                          ) : null}
                        </div>
                      );
                    }

                    return (
                      <div key={field.name} className="space-y-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                        <label className="block px-0.5 text-[10px] font-semibold text-[#ead9a8]">{label}</label>
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          inputMode={field.type === 'number' ? 'numeric' : 'text'}
                          value={dynamicValues[field.name] || ''}
                          onChange={(event) => handleDynamicFieldChange(field.name, event.target.value)}
                          placeholder={copy.placeholder(label)}
                          autoComplete="off"
                          spellCheck={false}
                          disabled={isSubmitting || statusCard.tone === 'success'}
                          className={cn(purchaseFieldClassName, dynamicErrors[field.name] && 'border-red-400/70 focus:border-red-400 focus:ring-red-400/10')}
                        />
                        {dynamicErrors[field.name] ? (
                          <p className="px-0.5 text-[10px] font-medium text-[#ff9f9f]">{dynamicErrors[field.name]}</p>
                        ) : null}
                      </div>
                    );
                  })}

                  {orderFields.map((field) => {
                    const label = resolveFieldLabel(field, language);
                    return (
                      <div key={field.key} className="space-y-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                        <label className="block px-0.5 text-[10px] font-semibold text-[#ead9a8]">{label}</label>
                        <input
                          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                          inputMode={field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email' : 'text'}
                          value={fieldValues[field.key] || ''}
                          onChange={(event) => handleFieldChange(field.key, event.target.value)}
                          placeholder={field.placeholder || copy.placeholder(label)}
                          autoComplete="off"
                          spellCheck={false}
                          disabled={isSubmitting || statusCard.tone === 'success'}
                          className={cn(purchaseFieldClassName, fieldErrors[field.key] && 'border-red-400/70 focus:border-red-400 focus:ring-red-400/10')}
                        />
                        {fieldErrors[field.key] ? (
                          <p className="flex items-start gap-1.5 rounded-md border border-red-400/20 bg-red-500/10 px-2 py-1.5 text-[10px] font-semibold leading-4 text-[#ffadad]">
                            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>{fieldErrors[field.key]}</span>
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </section>
              </div>

              <footer className="purchase-sheet__footer border-t border-white/8 bg-slate-950/35 px-3 py-3 backdrop-blur-xl">
                {statusCard.message && !successfulOrderId ? (
                  <div className={`mb-2 flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[11px] sm:mb-2.5 sm:gap-2.5 sm:rounded-xl sm:py-2 sm:text-xs ${statusToneStyles[statusCard.tone] || statusToneStyles.info}`}>
                    <StatusIcon className={cn('mt-0.5 h-4 w-4 shrink-0', statusCard.tone === 'info' && isSubmitting && 'animate-spin')} />
                    <div>
                      {statusCard.title ? <p className="font-semibold">{statusCard.title}</p> : null}
                      <p className="mt-0.5 text-[11px] leading-4 text-white/90 sm:text-xs sm:leading-5">{statusCard.message}</p>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="h-9 rounded-lg border-[#d8b86b]/15 bg-white/[0.03] text-xs font-bold text-white/75 hover:bg-white/8"
                  >
                    {copy.cancel}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="h-9 gap-1.5 rounded-lg bg-[linear-gradient(135deg,#f0d58a,#bd9140)] text-xs font-bold text-[#17130b] shadow-[0_12px_26px_-14px_rgba(216,184,107,0.9)] hover:brightness-110 disabled:shadow-none"
                  >
                    {!isSubmitting ? <ShoppingBag className="h-4 w-4" /> : null}
                    {isSubmitting ? copy.processing : copy.buy}
                  </Button>
                </div>
              </footer>
            </motion.section>
          </div>

          <AnimatePresence>
            {successfulOrderId ? (
              <div className="absolute inset-0 z-[90] flex items-center justify-center p-4">
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleSuccessDismiss}
                  aria-label={copy.closeLabel}
                />

                <motion.section
                  role="dialog"
                  aria-modal="true"
                  initial={{ opacity: 0, scale: 0.94, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 14 }}
                  className="purchase-neon-border relative z-10 w-full max-w-sm overflow-hidden rounded-[1.6rem] border border-emerald-400/24 bg-[linear-gradient(180deg,rgba(9,20,18,0.98),rgba(7,14,13,0.98))] p-5 text-white shadow-[0_28px_80px_-36px_rgba(16,185,129,0.55)]"
                >
                  <button
                    type="button"
                    onClick={handleSuccessDismiss}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/80 transition hover:bg-white/12"
                    aria-label={copy.closeLabel}
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/14 text-emerald-400 shadow-[0_18px_40px_-24px_rgba(16,185,129,0.72)]">
                      <CheckCircle2 className="h-11 w-11" />
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-white">{copy.successDone}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">{copy.successMessage}</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-start">
                        <p className="text-[10px] font-semibold text-white/45">
                          {language === 'en' ? 'Amount' : 'المبلغ'}
                        </p>
                        <p className="mt-0.5 text-[13px] font-bold text-emerald-300">{successMeta.amount || formattedTotalPrice}</p>
                      </div>

                      <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-start">
                        <p className="text-[10px] font-semibold text-white/45">
                          {language === 'en' ? 'User ID' : 'معرف المستخدم'}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-white/85" dir="ltr">
                          {successMeta.identifier || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-start">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-white/45">
                            {language === 'en' ? 'Order No.' : 'رقم الطلب'}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] font-semibold text-white/85" dir="ltr">
                            {successMeta.orderNumber || successfulOrderId || '-'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyOrderNumber}
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12] hover:text-white"
                          aria-label={language === 'en' ? 'Copy order number' : 'نسخ رقم الطلب'}
                          title={language === 'en' ? 'Copy order number' : 'نسخ رقم الطلب'}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuccessDismiss}
                      className="h-11 rounded-[0.95rem] border-white/14 bg-white/6 text-white hover:bg-white/10"
                    >
                      {copy.cancel}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleOpenOrderDetails}
                      className="h-11 rounded-[0.95rem] bg-[linear-gradient(135deg,#10b981,#22c55e)] text-white shadow-[0_20px_32px_-24px_rgba(34,197,94,0.8)] hover:brightness-[1.04]"
                    >
                      {copy.successViewOrder}
                    </Button>
                  </div>
                </motion.section>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default ProductPurchaseSheet;
