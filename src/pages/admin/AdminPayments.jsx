import React, { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Pencil, X } from 'lucide-react';
import useTopupStore from '../../store/useTopupStore';
import useAdminStore from '../../store/useAdminStore';
import useSystemStore from '../../store/useSystemStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime, formatNumber } from '../../utils/intl';

const statusVariant = (status) => {
  if (status === 'approved' || status === 'completed') return 'success';
  if (status === 'rejected' || status === 'denied') return 'danger';
  return 'warning';
};

const isPendingLike = (status) => status === 'pending' || status === 'requested';

const AdminPayments = () => {
  const { topups, loadTopups, updateTopupStatus, updateTopupRequest } = useTopupStore();
  const { users, loadUsers } = useAdminStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { addToast } = useToast();

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
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    loadTopups();
    loadUsers();
    loadCurrencies();
  }, [loadTopups, loadUsers, loadCurrencies]);

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
  const formatRequestDate = (value) => formatDateTime(value, 'ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const formatRequestAmount = (value) => formatNumber(value, 'ar-EG');

  return (
    <div className="min-w-0 space-y-6">
      <header className="admin-premium-hero space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">عمليات الشحن</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          مراجعة طلبات الشحن اليدوي وإدارة بيانات الاستلام وطرق الدفع من مكان واحد.
        </p>
      </header>

      <Card className="admin-premium-panel min-w-0 p-4 sm:p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">طلبات الشحن</h2>

        <div className="space-y-3 lg:hidden">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{request.userName || request.userId}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatRequestDate(request.createdAt || Date.now())}</p>
                </div>
                <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">المستخدم:</span>{' '}
                  {request.userEmail || request.userId}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">الدولة:</span>{' '}
                  {request.transferCountryName || '-'}
                  {request.transferCountryCode ? ` (${request.transferCountryCode})` : ''}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">قناة الدفع:</span>{' '}
                  {request.paymentChannel === 'bank_transfer' ? 'تحويل بنكي' : 'محفظة كاش'}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">العملة:</span>{' '}
                  {request.currencyCode || findUserCurrency(request.userId)}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">المبلغ المطلوب:</span>{' '}
                  {formatRequestAmount(request.requestedAmount ?? request.requestedCoins ?? request.amount ?? 0)}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">المبلغ الفعلي:</span>{' '}
                  {request.actualPaidAmount ? formatRequestAmount(request.actualPaidAmount) : '-'}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">الإيصال:</span>{' '}
                  {request.proofImage ? (
                    <button
                      type="button"
                      onClick={() => { setReceiptPreviewUrl(request.proofImage); setIsReceiptModalOpen(true); }}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                    >
                      <Eye className="h-4 w-4" /> عرض
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">لا يوجد</span>
                  )}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isPendingLike(request.status) ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(request)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={() => openApproveModal(request)} className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(request)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">تمت المراجعة</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="hidden lg:block">
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
                  <TableCell>{formatRequestDate(request.createdAt || Date.now())}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">{request.userName || request.userId}</div>
                    <div className="text-xs text-gray-500">{request.userEmail || request.userId}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    {request.transferCountryName || '-'}
                    {request.transferCountryCode ? <div className="text-xs text-gray-500">{request.transferCountryCode}</div> : null}
                  </TableCell>
                  <TableCell className="text-center">{request.paymentChannel === 'bank_transfer' ? 'تحويل بنكي' : 'محفظة كاش'}</TableCell>
                  <TableCell className="text-center">{request.currencyCode || findUserCurrency(request.userId)}</TableCell>
                  <TableCell className="text-center">{formatRequestAmount(request.requestedAmount ?? request.requestedCoins ?? request.amount ?? 0)}</TableCell>
                  <TableCell className="text-center">{request.actualPaidAmount ? formatRequestAmount(request.actualPaidAmount) : '-'}</TableCell>
                  <TableCell className="text-center">
                    {request.proofImage ? (
                      <button
                        type="button"
                        onClick={() => { setReceiptPreviewUrl(request.proofImage); setIsReceiptModalOpen(true); }}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <Eye className="w-4 h-4" /> عرض
                      </button>
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
        title="اعتماد طلب الشحن"
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
                  className="mx-auto max-h-40 w-auto max-w-full rounded-lg object-contain bg-gray-50 dark:bg-gray-900"
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

      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => { setIsReceiptModalOpen(false); setReceiptPreviewUrl(null); }}
        title="عرض الإيصال"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setIsReceiptModalOpen(false); setReceiptPreviewUrl(null); }}>إغلاق</Button>
            {receiptPreviewUrl && (
              <a href={receiptPreviewUrl} target="_blank" rel="noreferrer">
                <Button>فتح بحجم كامل</Button>
              </a>
            )}
          </div>
        }
      >
        {receiptPreviewUrl ? (
          <img
            src={receiptPreviewUrl}
            alt="Payment receipt"
            className="mx-auto max-h-[56vh] w-auto max-w-full rounded-lg object-contain bg-gray-50 dark:bg-gray-900"
          />
        ) : (
          <p className="text-sm text-gray-500">لا توجد صورة إيصال.</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminPayments;

