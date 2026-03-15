import React, { useEffect, useState } from 'react';
import { Edit, Image as ImageIcon, Plus, RefreshCw, Trash2, AlertCircle, Info } from 'lucide-react';
import useMediaStore from '../../store/useMediaStore';
import apiClient from '../../services/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { validateProductForm, getProductStatus, getAvailableProductStatuses, getScheduleVisibilityModes } from '../../utils/productStatus';

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
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('products');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [providers, setProviders] = useState([]);
    const [providerProducts, setProviderProducts] = useState([]);
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
        syncPriceWithProvider: true,
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
        internalNotes: '',
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
                    setProductForm((prev) => ({ ...prev, externalProductId: '', providerProductId: '' }));
                }
            })
            .catch(() => {
                setProviderProducts([]);
                addToast('فشل تحميل منتجات المزود', 'error');
            });
    }, [isProductModalOpen, productForm.providerId, productForm.providerProductId, productForm.supplierId, productForm.externalProductId, addToast]);

    const syncProviderPrice = async (manualOverride) => {
        const supplierId = productForm.supplierId || productForm.providerId;
        const externalProductId = productForm.externalProductId || productForm.providerProductId;
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
                internalNotes: product.internalNotes || '',
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
                syncPriceWithProvider: true,
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
                internalNotes: '',
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
        const validationErrors = validateProductForm(productForm);
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => addToast(error, 'error'));
            return;
        }

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
            name: productForm.name,
            nameAr: productForm.nameAr,
            description: productForm.description,
            descriptionAr: productForm.descriptionAr,
            category: String(productForm.category || '').trim(),
            image: productForm.image || 'https://via.placeholder.com/300x200',
            status: productForm.status,
            displayOrder: Number(productForm.displayOrder || 0),
            
            // التسعير والمورد
            providerId: selectedSupplierId,
            providerProductId: selectedExternalProductId,
            supplierId: selectedSupplierId,
            externalProductId: selectedExternalProductId,
            externalProductName: String(productForm.externalProductName || '').trim(),
            autoFulfillmentEnabled: Boolean(productForm.autoFulfillmentEnabled),
            fallbackSupplierId: String(productForm.fallbackSupplierId || '').trim(),
            supplierFieldMappings: parseSupplierMappings(productForm.supplierFieldMappingsText),
            externalPricingMode: String(productForm.externalPricingMode || 'use_local_price'),
            supplierMarginType: String(productForm.supplierMarginType || 'fixed'),
            supplierMarginValue: Number(productForm.supplierMarginValue || 0),
            supplierNotes: String(productForm.supplierNotes || '').trim(),
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
            internalNotes: productForm.internalNotes,
            
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
        <div className="space-y-6">
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

            {activeTab === 'products' ? (
                <>
                    <div className="flex justify-end">
                        <Button onClick={() => openProductModal()}>
                            <Plus className="mr-2 h-4 w-4" /> {t('addProduct')}
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('products')}</TableHead>
                                    <TableHead className="text-center">المزود</TableHead>
                                    <TableHead className="text-center">{t('category') || 'القسم'}</TableHead>
                                    <TableHead className="text-center">{t('basePrice')}</TableHead>
                                    <TableHead className="text-center">{t('status') || 'الحالة'}</TableHead>
                                    <TableHead className="text-end">{t('actions') || 'الإجراءات'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(products || []).map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
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
                            <div key={cat.id} className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
                                <div className="aspect-video bg-gray-100">
                                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
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

            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingProduct ? t('editProduct') : t('addProduct')}>
                <form onSubmit={handleProductSubmit} className="space-y-6">
                    {/* ========== 1. المعلومات الأساسية ========== */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
                            المعلومات الأساسية
                        </h3>
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="English Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                                <Input label="Arabic Name" value={productForm.nameAr} onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })} required />
                            </div>

                            <Input label="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                            <Input label="Arabic Description" value={productForm.descriptionAr} onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })} />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">القسم</label>
                                <select
                                    className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                >
                                    {(categories || []).map((c) => (
                                        <option key={c.id} value={c.id}>{`${c.name} - ${c.nameAr}`}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">صورة المنتج (رفع)</label>
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800/50">
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setProductForm)} className="hidden" id="product-image-upload" />
                                    <label htmlFor="product-image-upload" className="flex cursor-pointer flex-col items-center gap-2">
                                        {productForm.image ? <img src={productForm.image} alt="معاينة" className="h-32 rounded object-contain" /> : <><ImageIcon className="h-8 w-8 text-gray-400" /><span className="text-sm text-gray-500">اضغط لرفع الصورة</span></>}
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
                                        className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
                                        value={productForm.supplierId || productForm.providerId}
                                        onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value, providerId: e.target.value, externalProductId: '', providerProductId: '' })}
                                    >
                                        <option value="">اختر المزود</option>
                                        {providers.map((provider) => (
                                            <option key={provider.id} value={provider.id}>{provider.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اختر المنتج من المورد</label>
                                    <select
                                        className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
                                        value={productForm.externalProductId || productForm.providerProductId}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const selected = providerProducts.find((p) => p.id === value);
                                            setProductForm({ ...productForm, externalProductId: value, providerProductId: value, externalProductName: selected?.name || '' });
                                            if (productForm.syncPriceWithProvider && value) {
                                                setTimeout(() => {
                                                    syncProviderPrice();
                                                }, 0);
                                            }
                                        }}
                                        disabled={!(productForm.supplierId || productForm.providerId)}
                                    >
                                        <option value="">اختر منتج المزود</option>
                                        {providerProducts.map((providerProduct) => (
                                            <option key={providerProduct.id} value={providerProduct.id}>
                                                {providerProduct.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
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
                                    label="supplierMarginValue"
                                    type="number"
                                    value={productForm.supplierMarginValue}
                                    onChange={(e) => setProductForm({ ...productForm, supplierMarginValue: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">وضع التسعير الخارجي</label>
                                    <select
                                        className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
                                        value={productForm.externalPricingMode}
                                        onChange={(e) => setProductForm({ ...productForm, externalPricingMode: e.target.value })}
                                    >
                                        <option value="use_supplier_price">استخدام سعر المزود</option>
                                        <option value="use_local_price">استخدام السعر المحلي</option>
                                        <option value="supplier_price_plus_margin">سعر المزود + هامش</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نوع هامش المزود</label>
                                    <select
                                        className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
                                        value={productForm.supplierMarginType}
                                        onChange={(e) => setProductForm({ ...productForm, supplierMarginType: e.target.value })}
                                    >
                                        <option value="fixed">ثابت</option>
                                        <option value="percentage">نسبة مئوية</option>
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

                            <Input
                                label="supplierNotes"
                                value={productForm.supplierNotes}
                                onChange={(e) => setProductForm({ ...productForm, supplierNotes: e.target.value })}
                            />

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

                            <Input
                                label={productForm.syncPriceWithProvider ? 'Final Price (Synced)' : 'حدد السعر (Coins)'}
                                type="number"
                                value={productForm.basePriceCoins}
                                onChange={(e) => setProductForm({ ...productForm, basePriceCoins: e.target.value })}
                                required={!productForm.syncPriceWithProvider}
                                disabled={Boolean(productForm.syncPriceWithProvider)}
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Input
                                    label="الحد الأدنى للطلب (Qty)"
                                    type="number"
                                    value={productForm.minimumOrderQty}
                                    onChange={(e) => setProductForm({ ...productForm, minimumOrderQty: e.target.value })}
                                    required
                                />
                                <Input
                                    label="الحد الأقصى للطلب (Qty)"
                                    type="number"
                                    value={productForm.maximumOrderQty}
                                    onChange={(e) => setProductForm({ ...productForm, maximumOrderQty: e.target.value })}
                                    required
                                />
                                <Input
                                    label="خطوة الزيادة (Step)"
                                    type="number"
                                    value={productForm.stepQty}
                                    onChange={(e) => setProductForm({ ...productForm, stepQty: e.target.value })}
                                    required
                                />
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

                            <Input
                                label="ملاحظات الإدارة (لا يراها العميل)"
                                placeholder="ملاحظات داخلية..."
                                value={productForm.internalNotes}
                                onChange={(e) => setProductForm({ ...productForm, internalNotes: e.target.value })}
                            />
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
                                            required
                                        />
                                        <Input
                                            label="وقت النهاية"
                                            type="datetime-local"
                                            value={productForm.scheduledEndAt}
                                            onChange={(e) => setProductForm({ ...productForm, scheduledEndAt: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">طريقة التعامل خارج فترة الجدولة</label>
                                        <select
                                            className="w-full rounded-lg border bg-white p-2 dark:border-gray-700 dark:bg-gray-900"
                                            value={productForm.scheduleVisibilityMode}
                                            onChange={(e) => setProductForm({ ...productForm, scheduleVisibilityMode: e.target.value })}
                                        >
                                            {getScheduleVisibilityModes().map((mode) => (
                                                <option key={mode.value} value={mode.value}>{mode.label}</option>
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
                                            required
                                        />
                                        <Input
                                            label="حد المخزون المنخفض"
                                            type="number"
                                            value={productForm.lowStockThreshold}
                                            onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                                            required
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
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCategoryForm)} className="hidden" id="category-image-upload" />
                            <label htmlFor="category-image-upload" className="flex cursor-pointer flex-col items-center gap-2">
                                {categoryForm.image ? <img src={categoryForm.image} alt="معاينة" className="h-32 rounded object-contain" /> : <><ImageIcon className="h-8 w-8 text-gray-400" /><span className="text-sm text-gray-500">اضغط لرفع الصورة</span></>}
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
