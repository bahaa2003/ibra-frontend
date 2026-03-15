const getStatusCopy = (language = 'ar') => {
  const isEnglish = String(language || '').toLowerCase().startsWith('en');

  if (isEnglish) {
    return {
      productHiddenReason: 'Product is hidden from the store',
      pausedLabel: 'Temporarily Paused',
      pausedHelper: 'This product is temporarily paused',
      pausedReason: 'Sales are temporarily paused',
      unavailableLabel: 'Unavailable',
      unavailableHelper: 'Sorry, this product is currently unavailable',
      unavailableReason: 'Product unavailable',
      pausedStatusReason: 'Product status is paused',
      outOfStockLabel: 'Out of Stock',
      outOfStockHelper: 'Sorry, this item is out of stock',
      outOfStockReason: 'Out of stock',
      comingSoonLabel: 'Coming Soon',
      comingSoonHelper: 'This product will be available soon',
      comingSoonReason: 'Product not started yet',
      expiredLabel: 'Offer Ended',
      expiredHelper: 'This product availability period has ended',
      expiredReason: 'Product period expired',
      lowStockLabel: 'Low Stock',
      lowStockHelper: (count) => `Remaining stock: ${count}`,
      availableLabel: 'Available'
    };
  }

  return {
    productHiddenReason: 'المنتج غير ظاهر في المتجر',
    pausedLabel: 'موقوف مؤقتاً',
    pausedHelper: 'هذا المنتج موقوف مؤقتاً',
    pausedReason: 'البيع موقوف مؤقتاً',
    unavailableLabel: 'غير متوفر',
    unavailableHelper: 'عذراً، هذا المنتج غير متوفر حالياً',
    unavailableReason: 'المنتج غير متوفر',
    pausedStatusReason: 'حالة المنتج موقوف',
    outOfStockLabel: 'نفد المخزون',
    outOfStockHelper: 'عذراً، انقضى المخزون',
    outOfStockReason: 'المنتج نفد من المخزون',
    comingSoonLabel: 'قريباً',
    comingSoonHelper: 'هذا المنتج سيكون متاحاً قريباً',
    comingSoonReason: 'المنتج لم يبدأ بعد',
    expiredLabel: 'انتهى العرض',
    expiredHelper: 'انتهت فترة توفر هذا المنتج',
    expiredReason: 'انتهت فترة المنتج',
    lowStockLabel: 'مخزون منخفض',
    lowStockHelper: (count) => `المخزون المتبقي: ${count}`,
    availableLabel: 'متوفر'
  };
};

export function getProductStatus(product, language = 'ar') {
  const copy = getStatusCopy(language);
  const defaults = {
    productStatus: 'available',
    isVisibleInStore: true,
    showWhenUnavailable: false,
    enableSchedule: false,
    scheduledStartAt: null,
    scheduledEndAt: null,
    scheduleVisibilityMode: 'hide',
    pauseSales: false,
    pauseReason: '',
    trackInventory: false,
    stockQuantity: 999,
    hideWhenOutOfStock: false,
    showOutOfStockLabel: true
  };

  const p = { ...defaults, ...product };
  const now = new Date();

  const isInSchedule = () => {
    if (!p.enableSchedule) return true;
    const startTime = p.scheduledStartAt ? new Date(p.scheduledStartAt) : null;
    const endTime = p.scheduledEndAt ? new Date(p.scheduledEndAt) : null;
    if (startTime && now < startTime) return false;
    if (endTime && now > endTime) return false;
    return true;
  };

  const getScheduleStatus = () => {
    if (!p.enableSchedule) return null;
    const startTime = p.scheduledStartAt ? new Date(p.scheduledStartAt) : null;
    const endTime = p.scheduledEndAt ? new Date(p.scheduledEndAt) : null;
    if (startTime && now < startTime) return 'coming_soon';
    if (endTime && now > endTime) return 'expired';
    return 'in_schedule';
  };

  const isOutOfStock = () => p.trackInventory && p.stockQuantity <= 0;
  const isLowStock = () => p.trackInventory && p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;

  const isHiddenByUser = !p.isVisibleInStore;
  const isHiddenBySchedule = !isInSchedule() && p.scheduleVisibilityMode === 'hide';
  const isHiddenByStock = isOutOfStock() && p.hideWhenOutOfStock;

  const isVisible = !isHiddenByUser && !isHiddenBySchedule && !isHiddenByStock && p.isVisibleInStore;

  let isPurchasable = isVisible;
  let badge = null;
  let badgeLabel = '';
  let badgeColor = 'default';
  let helperText = '';
  let reason = '';
  let isDisabled = false;

  if (!p.isVisibleInStore) {
    isPurchasable = false;
    isDisabled = true;
    reason = copy.productHiddenReason;
  } else if (p.pauseSales) {
    isPurchasable = false;
    badge = 'paused';
    badgeLabel = copy.pausedLabel;
    badgeColor = 'warning';
    helperText = p.pauseReason || copy.pausedHelper;
    reason = copy.pausedReason;
  } else if (p.productStatus === 'unavailable') {
    isPurchasable = false;
    if (p.showWhenUnavailable) {
      badge = 'unavailable';
      badgeLabel = copy.unavailableLabel;
      badgeColor = 'danger';
      helperText = copy.unavailableHelper;
    }
    reason = copy.unavailableReason;
  } else if (p.productStatus === 'paused') {
    isPurchasable = false;
    if (p.showWhenUnavailable) {
      badge = 'paused';
      badgeLabel = copy.pausedLabel;
      badgeColor = 'warning';
      helperText = copy.pausedHelper;
    }
    reason = copy.pausedStatusReason;
  } else if (isOutOfStock()) {
    isPurchasable = false;
    if (p.showOutOfStockLabel) {
      badge = 'out_of_stock';
      badgeLabel = copy.outOfStockLabel;
      badgeColor = 'danger';
      helperText = copy.outOfStockHelper;
    } else if (!p.hideWhenOutOfStock) {
      isDisabled = true;
    }
    reason = copy.outOfStockReason;
  } else if (getScheduleStatus() === 'coming_soon') {
    isPurchasable = false;
    if (p.scheduleVisibilityMode === 'coming_soon') {
      badge = 'coming_soon';
      badgeLabel = copy.comingSoonLabel;
      badgeColor = 'info';
      helperText = copy.comingSoonHelper;
    }
    reason = copy.comingSoonReason;
  } else if (getScheduleStatus() === 'expired') {
    isPurchasable = false;
    if (p.scheduleVisibilityMode === 'expired') {
      badge = 'expired';
      badgeLabel = copy.expiredLabel;
      badgeColor = 'secondary';
      helperText = copy.expiredHelper;
    }
    reason = copy.expiredReason;
  } else if (isLowStock()) {
    isPurchasable = true;
    badge = 'low_stock';
    badgeLabel = copy.lowStockLabel;
    badgeColor = 'warning';
    helperText = copy.lowStockHelper(p.stockQuantity);
  } else if (p.productStatus === 'available') {
    badge = 'available';
    badgeLabel = copy.availableLabel;
    badgeColor = 'success';
  }

  return {
    isVisible,
    isPurchasable,
    isDisabled,
    badge,
    badgeLabel,
    badgeColor,
    helperText,
    reason,
    scheduleStatus: getScheduleStatus(),
    isOutOfStock: isOutOfStock(),
    isLowStock: isLowStock(),
    inSchedule: isInSchedule(),
    isSalesEnabled: !p.pauseSales
  };
}

export function validateProductForm(productForm) {
  const errors = [];

  if (!productForm.name || !productForm.name.trim()) errors.push('اسم المنتج مطلوب');
  if (!productForm.category || !productForm.category.trim()) errors.push('التصنيف مطلوب');

  const minQty = Number(productForm.minimumOrderQty || 1);
  const maxQty = Number(productForm.maximumOrderQty || 999);
  const stepQty = Number(productForm.stepQty || 1);

  if (minQty < 1) errors.push('الحد الأدنى للطلب يجب أن يكون 1 على الأقل');
  if (maxQty < 1) errors.push('الحد الأقصى للطلب يجب أن يكون 1 على الأقل');
  if (maxQty < minQty) errors.push('الحد الأقصى لا يمكن أن يكون أقل من الحد الأدنى');
  if (stepQty < 1) errors.push('خطوة الزيادة يجب أن تكون 1 على الأقل');

  if (productForm.trackInventory) {
    const stock = Number(productForm.stockQuantity || 0);
    const threshold = Number(productForm.lowStockThreshold || 0);

    if (stock < 0) errors.push('كمية المخزون لا يمكن أن تكون سالبة');
    if (threshold < 0) errors.push('حد التنبيه لا يمكن أن يكون سالبًا');
    if (threshold > stock) errors.push('حد التنبيه يجب أن يكون أقل من كمية المخزون');
  }

  if (productForm.enableSchedule) {
    if (!productForm.scheduledStartAt) errors.push('تاريخ البداية مطلوب عند تفعيل الجدولة');
    if (!productForm.scheduledEndAt) errors.push('تاريخ النهاية مطلوب عند تفعيل الجدولة');

    if (
      productForm.scheduledStartAt &&
      productForm.scheduledEndAt &&
      new Date(productForm.scheduledStartAt) >= new Date(productForm.scheduledEndAt)
    ) {
      errors.push('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
    }
  }

  return errors;
}

export function getAvailableProductStatuses() {
  return [
    { value: 'available', label: 'متوفر', labelEn: 'Available', color: 'success' },
    { value: 'unavailable', label: 'غير متوفر', labelEn: 'Unavailable', color: 'danger' },
    { value: 'paused', label: 'موقوف مؤقتاً', labelEn: 'Paused', color: 'warning' }
  ];
}

export function getScheduleVisibilityModes() {
  return [
    { value: 'hide', label: 'إخفاء', labelEn: 'Hide' },
    { value: 'coming_soon', label: 'عرض "قريباً"', labelEn: 'Show as "Coming Soon"' },
    { value: 'expired', label: 'عرض "انتهى العرض"', labelEn: 'Show as "Expired"' }
  ];
}
