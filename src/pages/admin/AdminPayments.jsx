import React, { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Pencil, Save, X } from 'lucide-react';
import useTopupStore from '../../store/useTopupStore';
import useAuthStore from '../../store/useAuthStore';
import useSystemStore from '../../store/useSystemStore';
import useAdminStore from '../../store/useAdminStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { getPrimaryCountryCodeForCurrency } from '../../utils/currencyCountryMap';

const statusVariant = (status) => {
  if (status === 'approved' || status === 'completed') return 'success';
  if (status === 'rejected' || status === 'denied') return 'danger';
  return 'warning';
};

const isPendingLike = (status) => status === 'pending' || status === 'requested';

const AdminPayments = () => {
  const { topups, loadTopups, updateTopupStatus, updateTopupRequest } = useTopupStore();
  const { users, loadUsers } = useAdminStore();
  const { currencies, loadCurrencies, paymentSettings, loadPaymentSettings, savePaymentSettings } = useSystemStore();
  const { user: actor } = useAuthStore();
  const { addToast } = useToast();

  const fallbackCountries = useMemo(() => ([
    { cca2: 'US', name: { common: 'United States' }, currencies: { USD: {} } },
    { cca2: 'EG', name: { common: 'Egypt' }, currencies: { EGP: {} } },
    { cca2: 'SA', name: { common: 'Saudi Arabia' }, currencies: { SAR: {} } },
    { cca2: 'GB', name: { common: 'United Kingdom' }, currencies: { GBP: {} } },
    { cca2: 'AE', name: { common: 'United Arab Emirates' }, currencies: { AED: {} } },
  ]), []);
  const [countries, setCountries] = useState([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');

  const [settingsForm, setSettingsForm] = useState({
    countryAccounts: [],
    instructions: '',
    whatsappNumber: '',
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    actualPaidAmount: '',
    currencyCode: 'USD',
    adminNote: '',
  });
  const [editForm, setEditForm] = useState({
    requestedAmount: '',
    adminNote: '',
  });

  useEffect(() => {
    loadTopups();
    loadUsers();
    loadCurrencies();
    loadPaymentSettings();
  }, [loadTopups, loadUsers, loadCurrencies, loadPaymentSettings]);

  useEffect(() => {
    let mounted = true;
    const loadCountriesList = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,currencies');
        if (!response.ok) throw new Error('Failed to load countries');
        const data = await response.json();
        if (mounted && Array.isArray(data)) {
          setCountries(data);
        }
      } catch (_error) {
        if (mounted) setCountries(fallbackCountries);
      }
    };
    loadCountriesList();
    return () => {
      mounted = false;
    };
  }, [fallbackCountries]);

  useEffect(() => {
    setSettingsForm({
      countryAccounts: Array.isArray(paymentSettings?.countryAccounts) ? paymentSettings.countryAccounts : [],
      instructions: paymentSettings?.instructions || '',
      whatsappNumber: paymentSettings?.whatsappNumber || '',
    });
  }, [paymentSettings]);

  const eligibleCountries = useMemo(() => {
    const source = (countries && countries.length) ? countries : fallbackCountries;
    const allowedCountryCodes = new Set(
      (currencies || [])
        .map((item) => getPrimaryCountryCodeForCurrency(item?.code))
        .filter(Boolean)
    );

    return source
      .filter((country) => allowedCountryCodes.has(country?.cca2))
      .sort((a, b) => String(a?.name?.common || '').localeCompare(String(b?.name?.common || '')));
  }, [countries, fallbackCountries, currencies]);

  useEffect(() => {
    if (!eligibleCountries.length) {
      setSelectedCountryCode('');
      return;
    }
    if (!eligibleCountries.some((c) => c.cca2 === selectedCountryCode)) {
      setSelectedCountryCode(eligibleCountries[0].cca2);
    }
  }, [eligibleCountries, selectedCountryCode]);

  const selectedCountry = useMemo(
    () => eligibleCountries.find((c) => c.cca2 === selectedCountryCode) || null,
    [eligibleCountries, selectedCountryCode]
  );

  const selectedCountryCurrencyCode = useMemo(() => {
    const selectedCode = (selectedCountry?.cca2 || '').toUpperCase();
    const mapped = (currencies || []).find((item) => getPrimaryCountryCodeForCurrency(item?.code) === selectedCode);
    return String(mapped?.code || 'USD').toUpperCase();
  }, [selectedCountry, currencies]);

  const selectedCountryAccount = useMemo(() => {
    return (settingsForm.countryAccounts || []).find((item) => item.countryCode === selectedCountryCode) || {
      countryCode: selectedCountryCode,
      countryName: selectedCountry?.name?.common || '',
      currencyCode: selectedCountryCurrencyCode,
      cashWalletNumber: '',
      bankAccountNumber: '',
      bankAccountName: '',
    };
  }, [settingsForm.countryAccounts, selectedCountryCode, selectedCountry, selectedCountryCurrencyCode]);

  const updateSelectedCountryAccount = (patch) => {
    if (!selectedCountryCode) return;
    const nextItem = {
      ...selectedCountryAccount,
      ...patch,
      countryCode: selectedCountryCode,
      countryName: selectedCountry?.name?.common || selectedCountryAccount.countryName || '',
      currencyCode: selectedCountryCurrencyCode,
    };

    setSettingsForm((prev) => {
      const list = Array.isArray(prev.countryAccounts) ? prev.countryAccounts : [];
      const index = list.findIndex((item) => item.countryCode === selectedCountryCode);
      if (index === -1) {
        return { ...prev, countryAccounts: [...list, nextItem] };
      }
      const nextList = [...list];
      nextList[index] = nextItem;
      return { ...prev, countryAccounts: nextList };
    });
  };

  const requests = useMemo(
    () => [...(topups || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [topups]
  );

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setReviewForm({
      actualPaidAmount: String(request?.requestedAmount ?? request?.requestedCoins ?? request?.amount ?? 0),
      currencyCode: request?.currencyCode || 'USD',
      adminNote: '',
    });
    setIsReviewModalOpen(true);
  };

  const openEditModal = (request) => {
    setSelectedRequest(request);
    setEditForm({
      requestedAmount: String(request?.requestedAmount ?? request?.requestedCoins ?? request?.amount ?? 0),
      adminNote: request?.adminNote || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSavePaymentSettings = async () => {
    try {
      await savePaymentSettings(settingsForm, actor);
      addToast('تم حفظ إعدادات الدفع', 'success');
    } catch (error) {
      addToast(error?.message || 'فشل حفظ الإعدادات', 'error');
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    const actual = Number(reviewForm.actualPaidAmount || 0);
    if (actual <= 0) {
      addToast('أدخل المبلغ الفعلي المدفوع', 'error');
      return;
    }

    try {
      await updateTopupStatus(selectedRequest.id, 'approved', {
        actualPaidAmount: actual,
        currencyCode: reviewForm.currencyCode,
        adminNote: reviewForm.adminNote,
      });

      const requested = Number(selectedRequest.requestedAmount ?? selectedRequest.requestedCoins ?? selectedRequest.amount ?? 0);
      if (requested !== actual) {
        addToast('تم اعتماد الطلب بالمبلغ الفعلي فقط وإشعار المستخدم', 'info');
      } else {
        addToast('تم اعتماد الطلب بنجاح', 'success');
      }

      setIsReviewModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      addToast(error?.message || 'فشل اعتماد الطلب', 'error');
    }
  };

  const handleReject = async (request) => {
    const note = window.prompt('سبب الرفض (اختياري):', 'طلب غير مطابق');
    if (note === null) return;

    try {
      await updateTopupStatus(request.id, 'rejected', {
        adminNote: String(note || '').trim(),
      });
      addToast('تم رفض الطلب', 'info');
    } catch (error) {
      addToast(error?.message || 'فشل رفض الطلب', 'error');
    }
  };

  const handleEditRequest = async () => {
    if (!selectedRequest) return;
    const nextAmount = Number(editForm.requestedAmount || 0);
    if (nextAmount <= 0) {
      addToast('أدخل مبلغًا صحيحًا للتعديل', 'error');
      return;
    }

    try {
      await updateTopupRequest(selectedRequest.id, {
        requestedAmount: nextAmount,
        adminNote: editForm.adminNote,
      });
      addToast('تم تعديل مبلغ الطلب بنجاح', 'success');
      setIsEditModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      addToast(error?.message || 'فشل تعديل الطلب', 'error');
    }
  };

  const findUserCurrency = (userId) => users.find((u) => u.id === userId)?.currency || 'USD';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة عمليات الدفع</h1>

      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">بيانات الاستلام (يحددها الأدمن)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">اختر الدولة</label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            value={selectedCountryCode}
            onChange={(e) => setSelectedCountryCode(e.target.value)}
          >
            {eligibleCountries.map((country) => {
              const code = (currencies || []).find((item) => getPrimaryCountryCodeForCurrency(item?.code) === country.cca2)?.code || 'USD';
              return (
                <option key={country.cca2} value={country.cca2}>
                  {country.name?.common} ({country.cca2}) - {code}
                </option>
              );
            })}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="رقم محفظة الكاش"
            value={selectedCountryAccount.cashWalletNumber || ''}
            onChange={(e) => updateSelectedCountryAccount({ cashWalletNumber: e.target.value })}
            placeholder="مثال: 01000000000"
          />
          <Input
            label="رقم الحساب البنكي"
            value={selectedCountryAccount.bankAccountNumber || ''}
            onChange={(e) => updateSelectedCountryAccount({ bankAccountNumber: e.target.value })}
            placeholder="IBAN / Account Number"
          />
        </div>
        <Input
          label="اسم صاحب الحساب البنكي"
          value={selectedCountryAccount.bankAccountName || ''}
          onChange={(e) => updateSelectedCountryAccount({ bankAccountName: e.target.value })}
          placeholder="اسم المستفيد"
        />
        <Input
          label="رقم واتساب التواصل"
          value={settingsForm.whatsappNumber}
          onChange={(e) => setSettingsForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
          placeholder="مثال: 201001234567"
          dir="ltr"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">تعليمات إضافية للعميل</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            rows={3}
            value={settingsForm.instructions}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, instructions: e.target.value }))}
            placeholder="اكتب تعليمات التحويل ورفع الإيصال"
          />
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-500">
          الدولة الحالية: <strong>{selectedCountry?.name?.common || '-'}</strong> | العملة: <strong>{selectedCountryCurrencyCode}</strong>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSavePaymentSettings}>
            <Save className="w-4 h-4 mr-2" /> حفظ إعدادات الدفع
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">جدول طلبات الدفع</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead className="text-center">الدولة</TableHead>
                <TableHead className="text-center">قناة الدفع</TableHead>
                <TableHead className="text-center">العملة</TableHead>
                <TableHead className="text-center">المبلغ المطلوب</TableHead>
                <TableHead className="text-center">المبلغ الفعلي</TableHead>
                <TableHead className="text-center">الإيصال</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-end">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{new Date(request.createdAt || Date.now()).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">{request.userName || request.userId}</div>
                    <div className="text-xs text-gray-500">{request.userId}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    {request.transferCountryName || '-'}
                    {request.transferCountryCode ? <div className="text-xs text-gray-500">{request.transferCountryCode}</div> : null}
                  </TableCell>
                  <TableCell className="text-center">{request.paymentChannel === 'bank_transfer' ? 'تحويل بنكي' : 'محفظة كاش'}</TableCell>
                  <TableCell className="text-center">{request.currencyCode || findUserCurrency(request.userId)}</TableCell>
                  <TableCell className="text-center">{Number(request.requestedAmount ?? request.requestedCoins ?? request.amount ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-center">{request.actualPaidAmount ? Number(request.actualPaidAmount).toLocaleString() : '-'}</TableCell>
                  <TableCell className="text-center">
                    {request.proofImage ? (
                      <a
                        href={request.proofImage}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <Eye className="w-4 h-4" /> عرض
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">لا يوجد</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    {isPendingLike(request.status) ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(request)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => openApproveModal(request)} className="bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(request)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">تمت المراجعة</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل المبلغ المطلوب"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditRequest}>تعديل</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            تعديل قيمة الطلب للعميل: <strong>{selectedRequest?.userName}</strong>
          </p>
          <Input
            label="المبلغ المطلوب بعد التعديل"
            type="number"
            min="0"
            value={editForm.requestedAmount}
            onChange={(e) => setEditForm((prev) => ({ ...prev, requestedAmount: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ملاحظة التعديل (اختياري)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={editForm.adminNote}
              onChange={(e) => setEditForm((prev) => ({ ...prev, adminNote: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="اعتماد طلب الدفع"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleApprove}>اعتماد</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            اسم العميل: <strong>{selectedRequest?.userName}</strong>
          </p>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">الإيصال المرفوع</p>
            {selectedRequest?.proofImage ? (
              <>
                <img
                  src={selectedRequest.proofImage}
                  alt="Payment proof"
                  className="max-h-64 w-full rounded-lg object-contain bg-gray-50 dark:bg-gray-900"
                />
                <a
                  href={selectedRequest.proofImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  فتح الصورة بحجم كامل
                </a>
              </>
            ) : (
              <p className="text-xs text-gray-500">لم يرفع العميل صورة إيصال.</p>
            )}
          </div>

          <Input
            label="المبلغ الفعلي المدفوع"
            type="number"
            min="0"
            value={reviewForm.actualPaidAmount}
            onChange={(e) => setReviewForm((prev) => ({ ...prev, actualPaidAmount: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">العملة</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
              value={reviewForm.currencyCode}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, currencyCode: e.target.value }))}
            >
              {(currencies || []).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ملاحظة للإشعار (اختياري)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={reviewForm.adminNote}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, adminNote: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPayments;

