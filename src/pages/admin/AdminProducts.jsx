import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Image as ImageIcon, Plus, RefreshCw, Trash2, AlertCircle, Info, Search, Check, Package } from 'lucide-react';
<<<<<<< HEAD
import { resolveImageUrl } from '../../utils/imageUrl';
import { uploadImage } from '../../services/realApi';
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
import useMediaStore from '../../store/useMediaStore';
import apiClient from '../../services/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { inputBaseClassName, selectClassName } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { formatNumber } from '../../utils/intl';
import { validateProductForm, getProductStatus, getAvailableProductStatuses, getScheduleVisibilityModes } from '../../utils/productStatus';

const getProviderProductSearchToken = (product) =>
    `${product?.name || ''} ${product?.priceCoins || ''}`.toLowerCase();

const formatProviderProductPrice = (value, language) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        return '';
    }

    const formatted = formatNumber(amount, language === 'en' ? 'en-US' : 'ar-EG');
    return language === 'en' ? `$${formatted} USD` : `${formatted} دولار`;
};

const AdminProducts = () => {
    const {
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        loadProducts,
        resetProducts,
    } = useMediaStore();
    const { addToast } = useToast();
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';

    const [activeTab, setActiveTab] = useState('products');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [providers, setProviders] = useState([]);
    const [providerProducts, setProviderProducts] = useState([]);
    const [providerProductQuery, setProviderProductQuery] = useState('');
    const [isSyncingPrice, setIsSyncingPrice] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        category: '',
        providerId: '',
        providerProductId: '',
        supplierId: '',
        externalProductId: '',
        externalProductName: '',
        autoFulfillmentEnabled: true,
        externalPricingMode: 'use_local_price',
        supplierMarginType: 'fixed',
        supplierMarginValue: 0,
        fallbackSupplierId: '',
        supplierNotes: '',
        supplierFieldMappingsText: 'playerId:uid\nquantity:qty',
<<<<<<< HEAD
        syncPriceWithProvider: false,
=======
        syncPriceWithProvider: true,
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        enableManualPrice: false,
        manualPriceAdjustment: '',
        basePriceCoins: '',
        minQty: 1,
        maxQty: 999,
        displayOrder: 0,
        image: '',
        status: 'active',
        // =====================================================
        // إعدادات المنتج - Product Settings
        // =====================================================
        productStatus: 'available',
        isVisibleInStore: true,
        showWhenUnavailable: false,
        pauseSales: false,
        pauseReason: '',
<<<<<<< HEAD
=======
        internalNotes: '',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        // =====================================================
        // جدولة الظهور - Schedule
        // =====================================================
        enableSchedule: false,
        scheduledStartAt: '',
        scheduledEndAt: '',
        scheduleVisibilityMode: 'hide',
        // =====================================================
        // حدود الطلب - Order Limits
        // =====================================================
        minimumOrderQty: 1,
        maximumOrderQty: 999,
        stepQty: 1,
        // =====================================================
        // إدارة المخزون - Inventory Management
        // =====================================================
        trackInventory: false,
        stockQuantity: 999,
        lowStockThreshold: 50,
        hideWhenOutOfStock: false,
        showOutOfStockLabel: true,
    });
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        nameAr: '',
        image: '',
    });

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        if (isProductModalOpen && !productForm.category && categories.length > 0) {
            setProductForm((prev) => ({ ...prev, category: categories[0].id }));
        }
    }, [isProductModalOpen, categories, productForm.category]);

    useEffect(() => {
        if (!isProductModalOpen) return;
        apiClient.suppliers
            .list()
            .then((data) => setProviders(Array.isArray(data) ? data.filter((s) => s.isActive).map((s) => ({ id: s.id, name: s.supplierName })) : []))
            .catch(() => {
                setProviders([]);
                addToast('فشل تحميل المزودين', 'error');
            });
    }, [isProductModalOpen, addToast]);

    useEffect(() => {
        const selectedSupplier = productForm.supplierId || productForm.providerId;
        if (!isProductModalOpen || !selectedSupplier) {
            setProviderProducts([]);
            return;
        }
        apiClient.products
            .listProviderProducts(selectedSupplier)
            .then((items) => {
                const nextItems = Array.isArray(items) ? items : [];
                setProviderProducts(nextItems);
                if (!nextItems.some((p) => p.id === (productForm.externalProductId || productForm.providerProductId))) {
                    setProductForm((prev) => ({ ...prev, externalProductId: '', providerProductId: '', externalProductName: '' }));
                }
            })
            .catch(() => {
                setProviderProducts([]);
                addToast('فشل تحميل منتجات المزود', 'error');
            });
    }, [isProductModalOpen, productForm.providerId, productForm.providerProductId, productForm.supplierId, productForm.externalProductId, addToast]);

    useEffect(() => {
        setProviderProductQuery('');
    }, [isProductModalOpen, productForm.providerId, productForm.supplierId]);

    const selectedSupplierId = productForm.supplierId || productForm.providerId;
    const selectedProviderProductId = productForm.externalProductId || productForm.providerProductId;
<<<<<<< HEAD
    const canSyncWithProvider = Boolean(productForm.syncPriceWithProvider && selectedSupplierId && selectedProviderProductId);
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    const selectedProviderProduct = useMemo(
        () => providerProducts.find((product) => product.id === selectedProviderProductId) || null,
        [providerProducts, selectedProviderProductId]
    );
    const filteredProviderProducts = useMemo(() => {
        const normalizedQuery = String(providerProductQuery || '').trim().toLowerCase();
        if (!normalizedQuery) {
            return providerProducts;
        }

        return providerProducts.filter((product) => getProviderProductSearchToken(product).includes(normalizedQuery));
    }, [providerProducts, providerProductQuery]);

    const syncProviderPrice = async (manualOverride, supplierIdOverride, externalProductIdOverride) => {
        const supplierId = supplierIdOverride || productForm.supplierId || productForm.providerId;
        const externalProductId = externalProductIdOverride || productForm.externalProductId || productForm.providerProductId;
        if (!supplierId || !externalProductId) return;
        try {
            setIsSyncingPrice(true);
            const synced = await apiClient.products.getSyncedPrice(supplierId, externalProductId);
            const syncedBase = Number(synced?.basePriceCoins || 0);
            const extraRaw = manualOverride ?? productForm.manualPriceAdjustment;
            const extra = Number(extraRaw || 0);
            const finalPrice = productForm.enableManualPrice ? syncedBase + extra : syncedBase;
            setProductForm((prev) => ({ ...prev, basePriceCoins: finalPrice }));
        } catch {
            addToast('تعذر مزامنة سعر المزود', 'error');
        } finally {
            setIsSyncingPrice(false);
        }
    };

    const handleProviderProductSelect = (value) => {
        const selected = providerProducts.find((product) => product.id === value);
        setProductForm((prev) => ({
            ...prev,
            externalProductId: value,
            providerProductId: value,
            externalProductName: selected?.name || '',
        }));

        if (productForm.syncPriceWithProvider && value && selectedSupplierId) {
            setTimeout(() => {
                syncProviderPrice(undefined, selectedSupplierId, value);
            }, 0);
        }
    };

    const parseSupplierMappings = (text) => String(text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [internalField, externalField] = line.split(':').map((v) => String(v || '').trim());
            return { internalField, externalField };
        })
        .filter((m) => m.internalField && m.externalField);

    const handleResetData = () => {
        if (window.confirm('This will restore default products and categories. Continue?')) {
            resetProducts();
            addToast('تمت إعادة ضبط البيانات بنجاح، وسيتم عرض الحقول بشكل صحيح', 'success');
            // مسح localStorage أيضاً
            localStorage.removeItem('products-storage');
            window.location.reload();
        }
    };

<<<<<<< HEAD
    const handleImageUpload = async (e, setForm, uploadCategory = 'products') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            addToast('يجب أن يكون حجم الصورة أقل من 5 ميجابايت', 'error');
            return;
        }
        try {
            const path = await uploadImage(uploadCategory, file);
            setForm((prev) => ({ ...prev, image: path }));
        } catch {
            addToast('فشل رفع الصورة', 'error');
        }
=======
    const handleImageUpload = (e, setForm) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 500000) {
            addToast('يجب أن يكون حجم الصورة أقل من 500 كيلوبايت', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setForm((prev) => ({ ...prev, image: reader.result }));
        reader.readAsDataURL(file);
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    };

    const openProductModal = (product = null) => {
        if (product) {
            const hasLinkedProvider = Boolean(product.providerId && product.providerProductId);
            setEditingProduct(product);
            setProductForm({
                name: product.name || '',
                nameAr: product.nameAr || '',
                description: product.description || '',
                descriptionAr: product.descriptionAr || '',
                category: product.category || categories[0]?.id || '',
                providerId: product.providerId || '',
                providerProductId: product.providerProductId || '',
                supplierId: product.supplierId || product.providerId || '',
                externalProductId: product.externalProductId || product.providerProductId || '',
                externalProductName: product.externalProductName || '',
                autoFulfillmentEnabled: product.autoFulfillmentEnabled !== false,
                externalPricingMode: product.externalPricingMode || 'use_local_price',
                supplierMarginType: product.supplierMarginType || 'fixed',
                supplierMarginValue: product.supplierMarginValue ?? 0,
                fallbackSupplierId: product.fallbackSupplierId || '',
                supplierNotes: product.supplierNotes || '',
                supplierFieldMappingsText: Array.isArray(product.supplierFieldMappings) ? product.supplierFieldMappings.map((m) => `${m.internalField}:${m.externalField}`).join('\n') : 'playerId:uid\nquantity:qty',
                syncPriceWithProvider: hasLinkedProvider ? product.syncPriceWithProvider !== false : false,
                enableManualPrice: Number(product.manualPriceAdjustment || 0) !== 0,
                manualPriceAdjustment: product.manualPriceAdjustment ?? '',
                basePriceCoins: product.basePriceCoins ?? '',
                minQty: product.minQty ?? 1,
                maxQty: product.maxQty ?? 999,
                displayOrder: product.displayOrder ?? 0,
                image: product.image || '',
                status: product.status || 'active',
                productStatus: product.productStatus || 'available',
                isVisibleInStore: product.isVisibleInStore !== false,
                showWhenUnavailable: product.showWhenUnavailable || false,
                pauseSales: product.pauseSales || false,
                pauseReason: product.pauseReason || '',
<<<<<<< HEAD
=======
                internalNotes: product.internalNotes || '',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                enableSchedule: product.enableSchedule || false,
                scheduledStartAt: product.scheduledStartAt || '',
                scheduledEndAt: product.scheduledEndAt || '',
                scheduleVisibilityMode: product.scheduleVisibilityMode || 'hide',
                minimumOrderQty: product.minimumOrderQty ?? 1,
                maximumOrderQty: product.maximumOrderQty ?? 999,
                stepQty: product.stepQty ?? 1,
                trackInventory: product.trackInventory || false,
                stockQuantity: product.stockQuantity ?? 999,
                lowStockThreshold: product.lowStockThreshold ?? 50,
                hideWhenOutOfStock: product.hideWhenOutOfStock || false,
                showOutOfStockLabel: product.showOutOfStockLabel !== false,
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                name: '',
                nameAr: '',
                description: '',
                descriptionAr: '',
                category: categories[0]?.id || '',
                providerId: '',
                providerProductId: '',
                supplierId: '',
                externalProductId: '',
                externalProductName: '',
                autoFulfillmentEnabled: true,
                externalPricingMode: 'use_local_price',
                supplierMarginType: 'fixed',
                supplierMarginValue: 0,
                fallbackSupplierId: '',
                supplierNotes: '',
                supplierFieldMappingsText: 'playerId:uid\nquantity:qty',
<<<<<<< HEAD
                syncPriceWithProvider: false,
=======
                syncPriceWithProvider: true,
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                enableManualPrice: false,
                manualPriceAdjustment: '',
                basePriceCoins: '',
                minQty: 1,
                maxQty: 999,
                displayOrder: 0,
                image: '',
                status: 'active',
                productStatus: 'available',
                isVisibleInStore: true,
                showWhenUnavailable: false,
                pauseSales: false,
                pauseReason: '',
<<<<<<< HEAD
=======
                internalNotes: '',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                enableSchedule: false,
                scheduledStartAt: '',
                scheduledEndAt: '',
                scheduleVisibilityMode: 'hide',
                minimumOrderQty: 1,
                maximumOrderQty: 999,
                stepQty: 1,
                trackInventory: false,
                stockQuantity: 999,
                lowStockThreshold: 50,
                hideWhenOutOfStock: false,
                showOutOfStockLabel: true,
            });
        }
        setIsProductModalOpen(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        // validation شامل
<<<<<<< HEAD
        const validationErrors = validateProductForm(productForm, { requireImage: !editingProduct });
=======
        const validationErrors = validateProductForm(productForm);
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => addToast(error, 'error'));
            return;
        }

<<<<<<< HEAD
        const selectedSupplierId = String(productForm.supplierId || productForm.providerId || '').trim();
        const selectedExternalProductId = String(productForm.externalProductId || productForm.providerProductId || '').trim();
        const hasProviderLink = Boolean(selectedSupplierId && selectedExternalProductId);
        const shouldSyncWithProvider = Boolean(productForm.syncPriceWithProvider && hasProviderLink);
        const fallbackName = String(productForm.name || productForm.nameAr || '').trim();
        const fallbackNameAr = String(productForm.nameAr || productForm.name || '').trim();
        const fallbackCategory = String(productForm.category || categories[0]?.id || '').trim();
        const productImage = String(productForm.image || editingProduct?.image || '').trim();

        const minQty = Number(productForm.minimumOrderQty === '' || productForm.minimumOrderQty == null ? 1 : productForm.minimumOrderQty);
        const maxQty = Number(productForm.maximumOrderQty === '' || productForm.maximumOrderQty == null ? 999 : productForm.maximumOrderQty);
        const stepQty = Number(productForm.stepQty === '' || productForm.stepQty == null ? 1 : productForm.stepQty);
=======
        const shouldSyncWithProvider = Boolean(productForm.syncPriceWithProvider);
        const selectedSupplierId = String(productForm.supplierId || productForm.providerId || '').trim();
        const selectedExternalProductId = String(productForm.externalProductId || productForm.providerProductId || '').trim();

        // Validation إضافي للمورد (فقط عند تفعيل مزامنة السعر)
        if (shouldSyncWithProvider && (!selectedSupplierId || !selectedExternalProductId)) {
            addToast('المزود ومنتج المزود حقول مطلوبة', 'error');
            return;
        }

        const minQty = Number(productForm.minimumOrderQty || 1);
        const maxQty = Number(productForm.maximumOrderQty || 999);
        const stepQty = Number(productForm.stepQty || 1);
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

        let basePriceCoins = Number(productForm.basePriceCoins || 0);
        let syncedProviderBasePrice = null;
        const manualPriceAdjustment = productForm.enableManualPrice ? Number(productForm.manualPriceAdjustment || 0) : 0;

        if (shouldSyncWithProvider) {
            try {
                const synced = await apiClient.products.getSyncedPrice(selectedSupplierId, selectedExternalProductId);
                syncedProviderBasePrice = Number(synced?.basePriceCoins || 0);
                basePriceCoins = syncedProviderBasePrice + manualPriceAdjustment;
            } catch {
                addToast('فشل مزامنة سعر المزود قبل الحفظ', 'error');
                return;
            }
        } else if (Number.isNaN(basePriceCoins) || basePriceCoins <= 0) {
            addToast('يرجى إدخال سعر يدوي صحيح', 'error');
            return;
        }

        const payload = {
            // معلومات أساسية
<<<<<<< HEAD
            name: fallbackName,
            nameAr: fallbackNameAr,
            description: productForm.description,
            descriptionAr: productForm.descriptionAr,
            category: fallbackCategory,
            image: productImage,
=======
            name: productForm.name,
            nameAr: productForm.nameAr,
            description: productForm.description,
            descriptionAr: productForm.descriptionAr,
            category: String(productForm.category || '').trim(),
            image: productForm.image || 'https://via.placeholder.com/300x200',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            status: productForm.status,
            displayOrder: Number(productForm.displayOrder || 0),
            
            // التسعير والمورد
            providerId: selectedSupplierId,
            providerProductId: selectedExternalProductId,
            supplierId: selectedSupplierId,
            externalProductId: selectedExternalProductId,
            externalProductName: String(productForm.externalProductName || '').trim(),
            autoFulfillmentEnabled: Boolean(productForm.autoFulfillmentEnabled),
<<<<<<< HEAD
=======
            fallbackSupplierId: String(productForm.fallbackSupplierId || '').trim(),
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            supplierFieldMappings: parseSupplierMappings(productForm.supplierFieldMappingsText),
            externalPricingMode: String(productForm.externalPricingMode || 'use_local_price'),
            supplierMarginType: String(productForm.supplierMarginType || 'fixed'),
            supplierMarginValue: Number(productForm.supplierMarginValue || 0),
<<<<<<< HEAD
=======
            supplierNotes: String(productForm.supplierNotes || '').trim(),
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            syncPriceWithProvider: shouldSyncWithProvider,
            enableManualPrice: productForm.enableManualPrice,
            manualPriceAdjustment,
            syncedProviderBasePrice,
            basePriceCoins,
            
            // الكميات والحدود
            minimumOrderQty: minQty,
            maximumOrderQty: maxQty,
            stepQty,
            minQty: minQty,
            maxQty: maxQty,
            providerQuantity: maxQty,
            
            // إعدادات المنتج
            productStatus: productForm.productStatus,
            isVisibleInStore: productForm.isVisibleInStore,
            showWhenUnavailable: productForm.showWhenUnavailable,
            pauseSales: productForm.pauseSales,
            pauseReason: productForm.pauseReason,
<<<<<<< HEAD
=======
            internalNotes: productForm.internalNotes,
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            
            // الجدولة
            enableSchedule: productForm.enableSchedule,
            scheduledStartAt: productForm.scheduledStartAt || null,
            scheduledEndAt: productForm.scheduledEndAt || null,
            scheduleVisibilityMode: productForm.scheduleVisibilityMode,
            
            // المخزون
            trackInventory: productForm.trackInventory,
            stockQuantity: productForm.trackInventory ? Number(productForm.stockQuantity || 0) : 999,
            lowStockThreshold: productForm.trackInventory ? Number(productForm.lowStockThreshold || 0) : 0,
            hideWhenOutOfStock: productForm.hideWhenOutOfStock,
            showOutOfStockLabel: productForm.showOutOfStockLabel,
        };

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                addToast(t('productUpdated') || 'تم تحديث المنتج', 'success');
            } else {
                await addProduct(payload);
                addToast(t('productAdded') || 'تمت إضافة المنتج', 'success');
            }

            loadProducts();
            setIsProductModalOpen(false);
        } catch (error) {
            addToast(error?.message || 'فشل حفظ المنتج', 'error');
        }
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (!categoryForm.name) {
            addToast('اسم القسم مطلوب', 'error');
            return;
        }

        let safeId = categoryForm.name.trim().toLowerCase().replace(/\s+/g, '-');
        if (!safeId) safeId = `cat-${Date.now()}`;
        if (categories.some((c) => c.id === safeId)) safeId = `${safeId}-${Date.now()}`;

        addCategory({
            id: safeId,
            name: categoryForm.name,
            nameAr: categoryForm.nameAr,
            image: categoryForm.image || 'https://via.placeholder.com/300x200',
        });

        addToast('تمت إضافة القسم بنجاح', 'success');
        setCategoryForm({ name: '', nameAr: '', image: '' });
        setIsCategoryModalOpen(false);
    };

    const handleDeleteCategory = (category) => {
        const impacted = (products || []).filter((p) => {
            const raw = String(p.category || '').trim();
            return raw === category.id || raw === category.name || raw === category.nameAr;
        }).length;

        const confirmed = window.confirm(
            `هل تريد حذف القسم "${category.name}"؟ سيتم حذف ${impacted} منتج من هذا القسم أيضًا.`
        );

        if (!confirmed) return;

        deleteCategory(category.id);
        addToast(`تم حذف القسم ومعه ${impacted} منتج`, 'success');
    };

    return (
<<<<<<< HEAD
        <div className="min-w-0 space-y-6">
            <section className="admin-premium-hero">
=======
        <div className="space-y-6">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('productsManager')}</h1>
                    <button
                        onClick={handleResetData}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500"
                        title="Reset to defaults"
                    >
                        <RefreshCw className="h-3 w-3" /> Reset
                    </button>
                </div>

                <div className="flex gap-2">
                    <Button variant={activeTab === 'products' ? 'primary' : 'outline'} onClick={() => setActiveTab('products')}>
                        {t('products')}
                    </Button>
                    <Button variant={activeTab === 'categories' ? 'primary' : 'outline'} onClick={() => setActiveTab('categories')}>
                        {t('categories') || 'الأقسام'}
                    </Button>
                </div>
            </div>
<<<<<<< HEAD
            </section>
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

            {activeTab === 'products' ? (
                <>
                    <div className="flex justify-end">
                        <Button onClick={() => openProductModal()}>
                            <Plus className="mr-2 h-4 w-4" /> {t('addProduct')}
                        </Button>
                    </div>

<<<<<<< HEAD
                    <div className="admin-premium-panel overflow-hidden">
=======
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('products')}</TableHead>
                                    <TableHead className="text-center">المزود</TableHead>
                                    <TableHead className="text-center">{t('category') || 'القسم'}</TableHead>
                                    <TableHead className="text-center">{t('basePrice')}</TableHead>
<<<<<<< HEAD
                                    <TableHead className="text-center">{t('common.status', { defaultValue: 'الحالة' })}</TableHead>
=======
                                    <TableHead className="text-center">{t('status') || 'الحالة'}</TableHead>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                    <TableHead className="text-end">{t('actions') || 'الإجراءات'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(products || []).map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
<<<<<<< HEAD
                                                    <img src={resolveImageUrl(product.image)} alt={product.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
=======
                                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.nameAr}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{providers.find((p) => p.id === product.providerId)?.name || product.providerId || '-'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{categories.find((c) => c.id === product.category)?.name || product.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{product.basePriceCoins}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>{product.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => openProductModal(product)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => deleteProduct(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex justify-end">
                        <Button onClick={() => setIsCategoryModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> {t('addCategory') || 'إضافة قسم'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {(categories || []).map((cat) => (
<<<<<<< HEAD
                            <div key={cat.id} className="group admin-premium-panel relative overflow-hidden">
                                <div className="aspect-video bg-gray-100">
                                    <img src={resolveImageUrl(cat.image)} alt={cat.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
=======
                            <div key={cat.id} className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
                                <div className="aspect-video bg-gray-100">
                                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                </div>
                                <div className="bg-white p-4 dark:bg-gray-800">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.nameAr || cat.name}</h3>
                                    <p className="text-sm text-gray-500">{cat.name}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteCategory(cat)}
                                    className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingProduct ? t('editProduct') : t('addProduct')} size="xl">
                <form onSubmit={handleProductSubmit} className="space-y-6">
                    {/* ========== 1. المعلومات الأساسية ========== */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
                            المعلومات الأساسية
                        </h3>
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <div className="grid grid-cols-2 gap-4">
<<<<<<< HEAD
                                <Input label="English Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                                <Input label="Arabic Name" value={productForm.nameAr} onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })} />
=======
                                <Input label="English Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                                <Input label="Arabic Name" value={productForm.nameAr} onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })} required />
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                            </div>

                            <Input label="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                            <Input label="Arabic Description" value={productForm.descriptionAr} onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })} />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">القسم</label>
                                <select
                                    className={`${selectClassName} h-11 dark:[color-scheme:dark]`}
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                >
                                    {(categories || []).map((c) => (
                                        <option key={c.id} value={c.id} className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">{`${c.name} - ${c.nameAr}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">صورة المنتج (رفع)</label>
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800/50">
<<<<<<< HEAD
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageUpload(e, setProductForm)} className="hidden" id="product-image-upload" />
                                    <label htmlFor="product-image-upload" className="flex cursor-pointer flex-col items-center gap-2">
                                        {productForm.image ? <img src={resolveImageUrl(productForm.image)} alt="معاينة" decoding="async" referrerPolicy="no-referrer" className="h-32 rounded object-contain" /> : <><ImageIcon className="h-8 w-8 text-gray-400" /><span className="text-sm text-gray-500">اضغط لرفع الصورة</span></>}
=======
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setProductForm)} className="hidden" id="product-image-upload" />
                                    <label htmlFor="product-image-upload" className="flex cursor-pointer flex-col items-center gap-2">
                                        {productForm.image ? <img src={productForm.image} alt="معاينة" className="h-32 rounded object-contain" /> : <><ImageIcon className="h-8 w-8 text-gray-400" /><span className="text-sm text-gray-500">اضغط لرفع الصورة</span></>}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== 2. الكمية والتسعير ========== */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</span>
                            الكمية والتسعير
                        </h3>
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اختر المورد</label>
                                    <select
                                        className={`${selectClassName} h-11 dark:[color-scheme:dark]`}
                                        value={productForm.supplierId || productForm.providerId}
<<<<<<< HEAD
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setProductForm((prev) => ({
                                                ...prev,
                                                supplierId: value,
                                                providerId: value,
                                                externalProductId: '',
                                                providerProductId: '',
                                                syncPriceWithProvider: value ? prev.syncPriceWithProvider : false,
                                            }));
                                        }}
=======
                                        onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value, providerId: e.target.value, externalProductId: '', providerProductId: '' })}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                    >
                                        <option value="" className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">اختر المزود</option>
                                        {providers.map((provider) => (
                                            <option key={provider.id} value={provider.id} className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">{provider.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اختر المنتج من المورد</label>
                                    <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.92)] p-3 shadow-[var(--shadow-subtle)]">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-elevated-rgb)/0.74)] p-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                                        {selectedProviderProduct?.name || (isEnglish ? 'No provider product selected yet' : 'لم يتم اختيار منتج من المورد بعد')}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                                                        {selectedProviderProduct?.priceCoins
                                                            ? formatProviderProductPrice(selectedProviderProduct.priceCoins, language)
                                                            : (isEnglish ? 'Choose a supplier first, then select a product' : 'اختر المورد أولاً ثم اختر المنتج المناسب')}
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedSupplierId ? (
                                                <>
                                                    <div className="relative">
                                                        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                                                        <input
                                                            type="text"
                                                            value={providerProductQuery}
                                                            onChange={(e) => setProviderProductQuery(e.target.value)}
                                                            placeholder={isEnglish ? 'Search supplier products by name' : 'ابحث داخل منتجات المورد بالاسم'}
                                                            className={`${inputBaseClassName} h-11 pr-10`}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3 px-1 text-xs text-[var(--color-muted)]">
                                                        <span>
                                                            {isEnglish ? `${filteredProviderProducts.length} products found` : `${filteredProviderProducts.length} منتج متاح`}
                                                        </span>
                                                        {selectedProviderProduct ? (
                                                            <span className="truncate text-[var(--color-primary)]">
                                                                {isEnglish ? `Selected: ${selectedProviderProduct.name}` : `المحدد: ${selectedProviderProduct.name}`}
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                                        {filteredProviderProducts.length ? filteredProviderProducts.map((providerProduct) => {
                                                            const isSelected = providerProduct.id === selectedProviderProductId;
                                                            const providerPrice = formatProviderProductPrice(providerProduct.priceCoins, language);

                                                            return (
                                                                <button
                                                                    key={providerProduct.id}
                                                                    type="button"
                                                                    onClick={() => handleProviderProductSelect(providerProduct.id)}
                                                                    className={`flex w-full items-start gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-start transition-all ${
                                                                        isSelected
                                                                            ? 'border-[color:rgb(var(--color-primary-rgb)/0.4)] bg-[color:rgb(var(--color-primary-rgb)/0.12)] shadow-[0_14px_28px_-24px_rgb(var(--color-primary-rgb)/0.55)]'
                                                                            : 'border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.88)] hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.06)]'
                                                                    }`}
                                                                >
                                                                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                                                                        isSelected
                                                                            ? 'border-[color:rgb(var(--color-primary-rgb)/0.34)] bg-[color:rgb(var(--color-primary-rgb)/0.14)] text-[var(--color-primary)]'
                                                                            : 'border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-elevated-rgb)/0.88)] text-[var(--color-text-secondary)]'
                                                                    }`}>
                                                                        <Package className="h-4 w-4" />
                                                                    </span>

                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">{providerProduct.name || providerProduct.id}</p>
                                                                        {providerPrice ? (
                                                                            <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                                                                                {providerPrice}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>

                                                                    {isSelected ? (
                                                                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.16)] text-[var(--color-primary)]">
                                                                            <Check className="h-4 w-4" />
                                                                        </span>
                                                                    ) : null}
                                                                </button>
                                                            );
                                                        }) : (
                                                            <div className="rounded-[var(--radius-md)] border border-dashed border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-elevated-rgb)/0.68)] px-4 py-5 text-center text-sm text-[var(--color-text-secondary)]">
                                                                {isEnglish ? 'No matching supplier products were found.' : 'لا توجد منتجات مطابقة لهذا البحث.'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="rounded-[var(--radius-md)] border border-dashed border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-elevated-rgb)/0.68)] px-4 py-5 text-center text-sm text-[var(--color-text-secondary)]">
                                                    {isEnglish ? 'Select a supplier first to load its products here.' : 'اختر المورد أولاً حتى تظهر منتجاته هنا بشكل منظم.'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
<<<<<<< HEAD
=======
                                    label="External Product Name"
                                    value={productForm.externalProductName}
                                    onChange={(e) => setProductForm({ ...productForm, externalProductName: e.target.value })}
                                />
                                <Input
                                    label="Fallback Supplier ID"
                                    value={productForm.fallbackSupplierId}
                                    onChange={(e) => setProductForm({ ...productForm, fallbackSupplierId: e.target.value })}
                                />
                                <Input
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                    label="supplierMarginValue"
                                    type="number"
                                    value={productForm.supplierMarginValue}
                                    onChange={(e) => setProductForm({ ...productForm, supplierMarginValue: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">وضع التسعير الخارجي</label>
                                    <select
                                        className={`${selectClassName} h-11 dark:[color-scheme:dark]`}
                                        value={productForm.externalPricingMode}
                                        onChange={(e) => setProductForm({ ...productForm, externalPricingMode: e.target.value })}
                                    >
                                        <option value="use_supplier_price" className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">استخدام سعر المزود</option>
                                        <option value="use_local_price" className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">استخدام السعر المحلي</option>
                                        <option value="supplier_price_plus_margin" className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">سعر المزود + هامش</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نوع هامش المزود</label>
                                    <select
                                        className={`${selectClassName} h-11 dark:[color-scheme:dark]`}
                                        value={productForm.supplierMarginType}
                                        onChange={(e) => setProductForm({ ...productForm, supplierMarginType: e.target.value })}
                                    >
                                        <option value="fixed" className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">ثابت</option>
                                        <option value="percentage" className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">نسبة مئوية</option>
                                    </select>
                                </div>
                            </div>

                            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={Boolean(productForm.autoFulfillmentEnabled)}
                                    onChange={(e) => setProductForm({ ...productForm, autoFulfillmentEnabled: e.target.checked })}
                                />
                                autoFulfillmentEnabled
                            </label>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ربط حقول المزود (داخلي:خارجي)</label>
                                <textarea
                                    className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900 min-h-[90px]"
                                    value={productForm.supplierFieldMappingsText}
                                    onChange={(e) => setProductForm({ ...productForm, supplierFieldMappingsText: e.target.value })}
                                />
                            </div>

<<<<<<< HEAD
=======
                            <Input
                                label="supplierNotes"
                                value={productForm.supplierNotes}
                                onChange={(e) => setProductForm({ ...productForm, supplierNotes: e.target.value })}
                            />

>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <div className="flex flex-wrap items-center gap-4">
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(productForm.syncPriceWithProvider)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setProductForm({ ...productForm, syncPriceWithProvider: checked });
                                            }}
                                        />
                                        مزامنة السعر من المورد
                                    </label>

                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(productForm.enableManualPrice)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setProductForm((prev) => ({
                                                    ...prev,
                                                    enableManualPrice: checked,
                                                    manualPriceAdjustment: checked ? prev.manualPriceAdjustment : '',
                                                }));
                                                if (productForm.syncPriceWithProvider) {
                                                    setTimeout(() => {
                                                        syncProviderPrice(checked ? productForm.manualPriceAdjustment : 0);
                                                    }, 0);
                                                }
                                            }}
                                            disabled={!productForm.syncPriceWithProvider}
                                        />
                                        إضافة سعر يدوي
                                    </label>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => syncProviderPrice()}
                                        disabled={isSyncingPrice || !productForm.providerId || !productForm.providerProductId || !productForm.syncPriceWithProvider}
                                    >
                                        {isSyncingPrice ? 'Syncing...' : 'مزامنة الآن'}
                                    </Button>
                                </div>

                                {productForm.syncPriceWithProvider && productForm.enableManualPrice ? (
                                    <div className="mt-3">
                                        <Input
                                            label="Manual Price Add (+/-)"
                                            type="number"
                                            value={productForm.manualPriceAdjustment}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setProductForm({ ...productForm, manualPriceAdjustment: value });
                                                setTimeout(() => {
                                                    syncProviderPrice(value);
                                                }, 0);
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Input
                                    label="الحد الأدنى للطلب (Qty)"
                                    type="number"
                                    value={productForm.minimumOrderQty}
                                    onChange={(e) => setProductForm({ ...productForm, minimumOrderQty: e.target.value })}
<<<<<<< HEAD
=======
                                    required
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                />
                                <Input
                                    label="الحد الأقصى للطلب (Qty)"
                                    type="number"
                                    value={productForm.maximumOrderQty}
                                    onChange={(e) => setProductForm({ ...productForm, maximumOrderQty: e.target.value })}
<<<<<<< HEAD
=======
                                    required
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                />
                                <div className="w-full">
                                    <Input
                                        label={isEnglish ? 'Final Price' : 'السعر النهائي'}
                                        type="number"
                                        value={productForm.basePriceCoins}
                                        onChange={(e) => setProductForm({ ...productForm, basePriceCoins: e.target.value })}
<<<<<<< HEAD
                                        readOnly={Boolean(canSyncWithProvider)}
                                        disabled={Boolean(canSyncWithProvider)}
=======
                                        readOnly={Boolean(productForm.syncPriceWithProvider)}
                                        disabled={Boolean(productForm.syncPriceWithProvider)}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                        required
                                        suffix={(
                                            <span className="text-xs font-semibold text-[var(--color-muted)]">
                                                {isEnglish ? 'USD' : 'دولار'}
                                            </span>
                                        )}
                                    />
                                    <p className="mt-1 text-xs text-[var(--color-muted)]">
<<<<<<< HEAD
                                        {canSyncWithProvider
                                            ? (isEnglish ? 'This final price is synced automatically from the pricing settings above.' : 'هذا السعر النهائي يتم تحديثه تلقائيًا من إعدادات التسعير الموجودة بالأعلى.')
                                            : productForm.syncPriceWithProvider
                                                ? (isEnglish ? 'Sync is enabled, but supplier/product is not selected yet. You can still enter a local final price.' : 'المزامنة مفعلة، لكن لم يتم اختيار المورد/منتج المورد بعد. يمكنك إدخال السعر النهائي يدويًا.')
                                                : (isEnglish ? 'Enter the final price here when the product is not linked to a supplier.' : 'أدخل السعر النهائي هنا عندما لا يكون المنتج مربوطًا بمورد.')}
=======
                                        {productForm.syncPriceWithProvider
                                            ? (isEnglish ? 'This final price is synced automatically from the pricing settings above.' : 'هذا السعر النهائي يتم تحديثه تلقائيًا من إعدادات التسعير الموجودة بالأعلى.')
                                            : (isEnglish ? 'Enter the final price here when the product is not linked to a supplier.' : 'أدخل السعر النهائي هنا عندما لا يكون المنتج مربوطًا بمورد.')}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== 3. إعدادات المنتج ========== */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</span>
                            إعدادات المنتج
                        </h3>
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">حالة التوفر</label>
                                    <Info className="h-4 w-4 text-gray-400" title="تحديد ما إذا كان المنتج متاحاً للشراء أو متوقفاً" />
                                </div>
                                <div className="flex gap-2">
                                    {getAvailableProductStatuses().map((status) => (
                                        <label key={status.value} className="flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors" style={{
                                            borderColor: productForm.productStatus === status.value ? '#4f46e5' : '#e5e7eb',
                                            backgroundColor: productForm.productStatus === status.value ? 'rgba(79, 70, 229, 0.05)' : '',
                                        }}>
                                            <input
                                                type="radio"
                                                name="productStatus"
                                                value={status.value}
                                                checked={productForm.productStatus === status.value}
                                                onChange={(e) => setProductForm({ ...productForm, productStatus: e.target.value })}
                                            />
                                            <span className="text-sm font-medium">{status.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(productForm.isVisibleInStore)}
                                    onChange={(e) => setProductForm({ ...productForm, isVisibleInStore: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إظهار المنتج في المتجر</span>
                            </label>

                            {productForm.productStatus !== 'available' && (
                                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(productForm.showWhenUnavailable)}
                                        onChange={(e) => setProductForm({ ...productForm, showWhenUnavailable: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إذا كان غير متوفر، أظهره كمعطل بدل إخفائه</span>
                                </label>
                            )}

                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(productForm.pauseSales)}
                                    onChange={(e) => setProductForm({ ...productForm, pauseSales: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إيقاف البيع مؤقتاً</span>
                            </label>

                            {productForm.pauseSales && (
                                <Input
                                    label="سبب الإيقاف (اختياري)"
                                    placeholder="مثال: جاري التحديث..."
                                    value={productForm.pauseReason}
                                    onChange={(e) => setProductForm({ ...productForm, pauseReason: e.target.value })}
                                />
                            )}

<<<<<<< HEAD
                            {false && <Input
=======
                            <Input
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                label="ملاحظات الإدارة (لا يراها العميل)"
                                placeholder="ملاحظات داخلية..."
                                value={productForm.internalNotes}
                                onChange={(e) => setProductForm({ ...productForm, internalNotes: e.target.value })}
<<<<<<< HEAD
                            />}
=======
                            />
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                        </div>
                    </div>

                    {/* ========== 4. جدولة الظهور ========== */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">4</span>
                            جدولة الظهور
                        </h3>
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(productForm.enableSchedule)}
                                    onChange={(e) => setProductForm({ ...productForm, enableSchedule: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">تفعيل جدولة ظهور المنتج</span>
                            </label>

                            {productForm.enableSchedule && (
                                <>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Input
                                            label="وقت البداية"
                                            type="datetime-local"
                                            value={productForm.scheduledStartAt}
                                            onChange={(e) => setProductForm({ ...productForm, scheduledStartAt: e.target.value })}
<<<<<<< HEAD
=======
                                            required
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                        />
                                        <Input
                                            label="وقت النهاية"
                                            type="datetime-local"
                                            value={productForm.scheduledEndAt}
                                            onChange={(e) => setProductForm({ ...productForm, scheduledEndAt: e.target.value })}
<<<<<<< HEAD
=======
                                            required
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">طريقة التعامل خارج فترة الجدولة</label>
                                        <select
                                            className={`${selectClassName} h-11 dark:[color-scheme:dark]`}
                                            value={productForm.scheduleVisibilityMode}
                                            onChange={(e) => setProductForm({ ...productForm, scheduleVisibilityMode: e.target.value })}
                                        >
                                            {getScheduleVisibilityModes().map((mode) => (
                                                <option key={mode.value} value={mode.value} className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">{mode.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ========== 5. إدارة المخزون ========== */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">5</span>
                            إدارة المخزون
                        </h3>
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(productForm.trackInventory)}
                                    onChange={(e) => setProductForm({ ...productForm, trackInventory: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">تفعيل تتبع المخزون</span>
                            </label>

                            {productForm.trackInventory && (
                                <>
                                    {Number(productForm.stockQuantity || 0) <= Number(productForm.lowStockThreshold || 50) && (
                                        <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-900/20">
                                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                                            <span className="text-sm text-yellow-600 dark:text-yellow-500">تحذير: المخزون منخفض!</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Input
                                            label="كمية المخزون"
                                            type="number"
                                            value={productForm.stockQuantity}
                                            onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
<<<<<<< HEAD
=======
                                            required
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                        />
                                        <Input
                                            label="حد المخزون المنخفض"
                                            type="number"
                                            value={productForm.lowStockThreshold}
                                            onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
<<<<<<< HEAD
=======
                                            required
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                                        />
                                    </div>

                                    <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(productForm.hideWhenOutOfStock)}
                                            onChange={(e) => setProductForm({ ...productForm, hideWhenOutOfStock: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إخفاء المنتج عند نفاد المخزون</span>
                                    </label>

                                    {!productForm.hideWhenOutOfStock && (
                                        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(productForm.showOutOfStockLabel)}
                                                onChange={(e) => setProductForm({ ...productForm, showOutOfStockLabel: e.target.checked })}
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إظهار المنتج كنفد مخزون</span>
                                        </label>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Preview حالة المنتج النهائية */}
                    <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">معاينة: كيف سيبدو المنتج للعميل</h4>
                        {(() => {
                            const status = getProductStatus(productForm);
                            return (
                                <div className="space-y-2 text-sm">
                                    <p className="text-blue-700 dark:text-blue-300">
                                        {status.isVisible ? '✓ المنتج سيكون ظاهراً' : '✗ المنتج لن يكون ظاهراً'}
                                    </p>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        {status.isPurchasable ? '✓ يمكن شراء المنتج' : '✗ لا يمكن شراء المنتج'}
                                    </p>
                                    {status.badge && (
                                        <p className="text-blue-700 dark:text-blue-300">
                                            Badge: <Badge variant={status.badgeColor}>{status.badgeLabel}</Badge>
                                        </p>
                                    )}
                                    {status.helperText && (
                                        <p className="text-blue-700 dark:text-blue-300">النص: {status.helperText}</p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">حفظ المنتج</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={t('addCategory') || 'إضافة قسم'}>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <Input label="الاسم بالعربية" value={categoryForm.nameAr} onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })} required />
                    <Input label="الاسم بالإنجليزية" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">صورة القسم (رفع)</label>
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
<<<<<<< HEAD
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageUpload(e, setCategoryForm, 'categories')} className="hidden" id="category-image-upload" />
                            <label htmlFor="category-image-upload" className="flex cursor-pointer flex-col items-center gap-2">
                                {categoryForm.image ? <img src={resolveImageUrl(categoryForm.image)} alt="معاينة" decoding="async" referrerPolicy="no-referrer" className="h-32 rounded object-contain" /> : <><ImageIcon className="h-8 w-8 text-gray-400" /><span className="text-sm text-gray-500">اضغط لرفع الصورة</span></>}
=======
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCategoryForm)} className="hidden" id="category-image-upload" />
                            <label htmlFor="category-image-upload" className="flex cursor-pointer flex-col items-center gap-2">
                                {categoryForm.image ? <img src={categoryForm.image} alt="معاينة" className="h-32 rounded object-contain" /> : <><ImageIcon className="h-8 w-8 text-gray-400" /><span className="text-sm text-gray-500">اضغط لرفع الصورة</span></>}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">حفظ القسم</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminProducts;
