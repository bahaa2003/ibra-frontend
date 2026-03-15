import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input, { selectClassName, textareaClassName } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import useAuthStore from '../../store/useAuthStore';
import useSystemStore from '../../store/useSystemStore';
import { useLanguage } from '../../context/LanguageContext';
import {
  createPaymentEntityId,
  normalizePaymentGroups,
  normalizePaymentMethod,
} from '../../utils/paymentSettings';

const defaultGroupForm = {
  name: '',
  description: '',
  isActive: true,
};

const defaultMethodForm = {
  groupId: '',
  name: '',
  description: '',
  type: 'mobile_wallet',
  accountNumber: '',
  bankName: '',
  instructions: '',
  isActive: true,
};

const AdminPaymentMethods = () => {
  const { user } = useAuthStore();
  const { paymentSettings, loadPaymentSettings, savePaymentSettings } = useSystemStore();
  const { addToast } = useToast();
  const { dir, language } = useLanguage();
  const isRTL = dir === 'rtl';
  const isEnglish = language === 'en';

  const tx = (ar, en) => (isEnglish ? en : ar);

  const [paymentGroups, setPaymentGroups] = useState([]);
  const [isPersisting, setIsPersisting] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingMethodRef, setEditingMethodRef] = useState({ groupId: '', methodId: '' });
  const [groupForm, setGroupForm] = useState(defaultGroupForm);
  const [methodForm, setMethodForm] = useState(defaultMethodForm);

  useEffect(() => {
    loadPaymentSettings();
  }, [loadPaymentSettings]);

  useEffect(() => {
    setPaymentGroups(normalizePaymentGroups(paymentSettings?.paymentGroups));
  }, [paymentSettings]);

  const methodTypeOptions = useMemo(
    () => ([
      { value: 'mobile_wallet', label: tx('محفظة إلكترونية', 'Mobile Wallet') },
      { value: 'bank_transfer', label: tx('تحويل بنكي', 'Bank Transfer') },
      { value: 'credit_card', label: tx('بطاقة ائتمان', 'Credit Card') },
      { value: 'paypal', label: 'PayPal' },
    ]),
    [isEnglish]
  );

  const totalMethods = useMemo(
    () => paymentGroups.reduce((sum, group) => sum + group.methods.length, 0),
    [paymentGroups]
  );

  const activeMethods = useMemo(
    () => paymentGroups.reduce((sum, group) => sum + group.methods.filter((method) => method.isActive !== false).length, 0),
    [paymentGroups]
  );

  const activeGroups = useMemo(
    () => paymentGroups.filter((group) => group.isActive !== false).length,
    [paymentGroups]
  );

  const persistPaymentGroups = async (nextGroups, successMessage) => {
    setIsPersisting(true);
    try {
      const normalizedGroups = normalizePaymentGroups(nextGroups);
      await savePaymentSettings(
        {
          ...paymentSettings,
          paymentGroups: normalizedGroups,
        },
        user
      );
      setPaymentGroups(normalizedGroups);
      addToast(successMessage, 'success');
    } catch (error) {
      addToast(error?.message || tx('فشل حفظ إعدادات طرق الدفع', 'Failed to save payment methods settings'), 'error');
    } finally {
      setIsPersisting(false);
    }
  };

  const openAddGroupModal = () => {
    setEditingGroupId(null);
    setGroupForm(defaultGroupForm);
    setGroupModalOpen(true);
  };

  const openEditGroupModal = (group) => {
    setEditingGroupId(group.id);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      isActive: group.isActive !== false,
    });
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async (event) => {
    event.preventDefault();

    const nextGroups = editingGroupId
      ? paymentGroups.map((group) => (
          group.id === editingGroupId
            ? { ...group, ...groupForm }
            : group
        ))
      : [
          ...paymentGroups,
          {
            id: createPaymentEntityId('group', groupForm.name),
            name: groupForm.name.trim(),
            description: groupForm.description.trim(),
            isActive: groupForm.isActive,
            methods: [],
          },
        ];

    await persistPaymentGroups(
      nextGroups,
      editingGroupId
        ? tx('تم تحديث مجموعة الدفع', 'Payment group updated')
        : tx('تمت إضافة مجموعة الدفع', 'Payment group added')
    );
    setGroupModalOpen(false);
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm(tx('هل أنت متأكد من حذف هذه المجموعة؟', 'Are you sure you want to delete this group?'))) {
      return;
    }

    await persistPaymentGroups(
      paymentGroups.filter((group) => group.id !== groupId),
      tx('تم حذف مجموعة الدفع', 'Payment group deleted')
    );
  };

  const handleToggleGroup = async (groupId) => {
    await persistPaymentGroups(
      paymentGroups.map((group) => (
        group.id === groupId
          ? { ...group, isActive: group.isActive === false }
          : group
      )),
      tx('تم تحديث حالة المجموعة', 'Group status updated')
    );
  };

  const openAddMethodModal = (groupId) => {
    setEditingMethodRef({ groupId: '', methodId: '' });
    setMethodForm({
      ...defaultMethodForm,
      groupId,
    });
    setMethodModalOpen(true);
  };

  const openEditMethodModal = (groupId, method) => {
    setEditingMethodRef({ groupId, methodId: method.id });
    setMethodForm({
      groupId,
      name: method.name,
      description: method.description || '',
      type: method.type,
      accountNumber: method.accountNumber || '',
      bankName: method.bankName || '',
      instructions: method.instructions || '',
      isActive: method.isActive !== false,
    });
    setMethodModalOpen(true);
  };

  const handleSaveMethod = async (event) => {
    event.preventDefault();

    if (!methodForm.groupId) {
      addToast(tx('اختر مجموعة الدفع أولاً', 'Select a payment group first'), 'error');
      return;
    }

    const nextGroups = paymentGroups.map((group) => ({
      ...group,
      methods: [...group.methods],
    }));

    const oldGroupId = editingMethodRef.groupId;
    const oldMethodId = editingMethodRef.methodId;
    const targetGroupIndex = nextGroups.findIndex((group) => group.id === methodForm.groupId);

    if (targetGroupIndex === -1) {
      addToast(tx('مجموعة الدفع غير موجودة', 'Payment group was not found'), 'error');
      return;
    }

    if (oldGroupId && oldMethodId) {
      const sourceGroupIndex = nextGroups.findIndex((group) => group.id === oldGroupId);
      if (sourceGroupIndex !== -1) {
        nextGroups[sourceGroupIndex].methods = nextGroups[sourceGroupIndex].methods.filter((method) => method.id !== oldMethodId);
      }
    }

    const normalizedMethod = normalizePaymentMethod({
      id: oldMethodId || createPaymentEntityId('method', methodForm.name),
      name: methodForm.name,
      description: methodForm.description,
      type: methodForm.type,
      accountNumber: methodForm.accountNumber,
      bankName: methodForm.bankName,
      instructions: methodForm.instructions,
      isActive: methodForm.isActive,
    });

    nextGroups[targetGroupIndex].methods = [
      ...nextGroups[targetGroupIndex].methods,
      normalizedMethod,
    ];

    await persistPaymentGroups(
      nextGroups,
      oldMethodId
        ? tx('تم تحديث طريقة الدفع', 'Payment method updated')
        : tx('تمت إضافة طريقة الدفع', 'Payment method added')
    );
    setMethodModalOpen(false);
  };

  const handleDeleteMethod = async (groupId, methodId) => {
    if (!window.confirm(tx('هل أنت متأكد من حذف طريقة الدفع هذه؟', 'Are you sure you want to delete this payment method?'))) {
      return;
    }

    await persistPaymentGroups(
      paymentGroups.map((group) => (
        group.id === groupId
          ? { ...group, methods: group.methods.filter((method) => method.id !== methodId) }
          : group
      )),
      tx('تم حذف طريقة الدفع', 'Payment method deleted')
    );
  };

  const handleToggleMethod = async (groupId, methodId) => {
    await persistPaymentGroups(
      paymentGroups.map((group) => (
        group.id === groupId
          ? {
              ...group,
              methods: group.methods.map((method) => (
                method.id === methodId
                  ? { ...method, isActive: method.isActive === false }
                  : method
              )),
            }
          : group
      )),
      tx('تم تحديث حالة طريقة الدفع', 'Payment method status updated')
    );
  };

  const getMethodTypeLabel = (type) => {
    const matched = methodTypeOptions.find((option) => option.value === type);
    return matched?.label || type;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {tx('إدارة مجموعات وطرق الدفع', 'Payment Groups & Methods')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {tx(
            'أنشئ مجموعات مثل تحويل مصر أو تحويل السعودية، ثم أضف بداخل كل مجموعة وسائل الدفع التي ستظهر للعميل.',
            'Create groups such as Egypt Transfer or Saudi Transfer, then add the payment methods that should appear to customers inside each group.'
          )}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: tx('إجمالي المجموعات', 'Total Groups'),
            value: paymentGroups.length,
          },
          {
            label: tx('المجموعات النشطة', 'Active Groups'),
            value: activeGroups,
          },
          {
            label: tx('إجمالي طرق الدفع', 'Total Payment Methods'),
            value: activeMethods || totalMethods,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.92)] p-5 shadow-[var(--shadow-subtle)]"
          >
            <p className="text-sm text-[var(--color-text-secondary)]">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <Button onClick={openAddGroupModal} disabled={isPersisting}>
          <Plus className="h-4 w-4" />
          <span>{tx('إضافة مجموعة جديدة', 'Add New Group')}</span>
        </Button>
      </div>

      <div className="space-y-4">
        {paymentGroups.map((group) => (
          <section
            key={group.id}
            className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.9)] p-5 shadow-[var(--shadow-subtle)]"
          >
            <div className={`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-soft))] text-[var(--color-button-text)]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-xl font-semibold text-[var(--color-text)]">{group.name}</h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        group.isActive !== false
                          ? 'bg-[color:rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]'
                          : 'bg-[color:rgb(var(--color-error-rgb)/0.12)] text-[var(--color-error)]'
                      }`}
                    >
                      {group.isActive !== false ? tx('نشطة', 'Active') : tx('معطلة', 'Disabled')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {group.description || tx('لا يوجد وصف مضاف لهذه المجموعة بعد.', 'No description has been added for this group yet.')}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    {tx(`${group.methods.length} طرق دفع`, `${group.methods.length} payment methods`)}
                  </p>
                </div>
              </div>

              <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <Button variant="outline" size="sm" onClick={() => openAddMethodModal(group.id)} disabled={isPersisting}>
                  <Plus className="h-4 w-4" />
                  <span>{tx('إضافة طريقة', 'Add Method')}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleToggleGroup(group.id)} disabled={isPersisting}>
                  {group.isActive !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEditGroupModal(group)} disabled={isPersisting}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="danger" size="icon" onClick={() => handleDeleteGroup(group.id)} disabled={isPersisting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {group.methods.map((method) => (
                <div
                  key={method.id}
                  className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-surface-rgb)/0.8)] p-4"
                >
                  <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className="font-semibold text-[var(--color-text)]">{method.name}</h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            method.isActive !== false
                              ? 'bg-[color:rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]'
                              : 'bg-[color:rgb(var(--color-error-rgb)/0.12)] text-[var(--color-error)]'
                          }`}
                        >
                          {method.isActive !== false ? tx('نشطة', 'Active') : tx('معطلة', 'Disabled')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {method.description || getMethodTypeLabel(method.type)}
                      </p>
                    </div>

                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleMethod(group.id, method.id)} disabled={isPersisting}>
                        {method.isActive !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditMethodModal(group.id, method)} disabled={isPersisting}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="danger" size="icon" onClick={() => handleDeleteMethod(group.id, method.id)} disabled={isPersisting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <p>
                      <span className="font-medium text-[var(--color-text)]">{tx('النوع:', 'Type:')}</span>{' '}
                      {getMethodTypeLabel(method.type)}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--color-text)]">{tx('رقم الحساب:', 'Account:')}</span>{' '}
                      {method.accountNumber || tx('غير محدد', 'Not set')}
                    </p>
                    {method.bankName && (
                      <p>
                        <span className="font-medium text-[var(--color-text)]">{tx('اسم البنك:', 'Bank:')}</span>{' '}
                        {method.bankName}
                      </p>
                    )}
                    {method.instructions && (
                      <p>
                        <span className="font-medium text-[var(--color-text)]">{tx('تعليمات:', 'Instructions:')}</span>{' '}
                        {method.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {!group.methods.length && (
                <div className="rounded-xl border border-dashed border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-surface-rgb)/0.72)] p-5 text-sm text-[var(--color-text-secondary)]">
                  {tx('لا توجد طرق دفع داخل هذه المجموعة حتى الآن.', 'There are no payment methods inside this group yet.')}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <Modal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title={editingGroupId ? tx('تعديل مجموعة الدفع', 'Edit Payment Group') : tx('إضافة مجموعة دفع', 'Add Payment Group')}
        footer={(
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="ghost" className="flex-1" onClick={() => setGroupModalOpen(false)}>
              {tx('إلغاء', 'Cancel')}
            </Button>
            <Button className="flex-1" onClick={handleSaveGroup} disabled={isPersisting}>
              {editingGroupId ? tx('حفظ التعديلات', 'Save Changes') : tx('إضافة المجموعة', 'Add Group')}
            </Button>
          </div>
        )}
      >
        <form onSubmit={handleSaveGroup} className="space-y-4">
          <Input
            label={tx('اسم المجموعة', 'Group Name')}
            value={groupForm.name}
            onChange={(event) => setGroupForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={tx('مثال: تحويل السعودية', 'Example: Saudi Transfer')}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              {tx('وصف المجموعة', 'Group Description')}
            </label>
            <textarea
              className={textareaClassName}
              value={groupForm.description}
              onChange={(event) => setGroupForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder={tx('اكتب وصفًا مختصرًا لما تحتويه هذه المجموعة', 'Write a short description of what this group contains')}
            />
          </div>

          <label className={`flex items-center gap-3 text-sm text-[var(--color-text)] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input
              type="checkbox"
              checked={groupForm.isActive}
              onChange={(event) => setGroupForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            <span>{tx('تفعيل المجموعة', 'Enable Group')}</span>
          </label>
        </form>
      </Modal>

      <Modal
        isOpen={methodModalOpen}
        onClose={() => setMethodModalOpen(false)}
        title={editingMethodRef.methodId ? tx('تعديل طريقة الدفع', 'Edit Payment Method') : tx('إضافة طريقة دفع', 'Add Payment Method')}
        footer={(
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="ghost" className="flex-1" onClick={() => setMethodModalOpen(false)}>
              {tx('إلغاء', 'Cancel')}
            </Button>
            <Button className="flex-1" onClick={handleSaveMethod} disabled={isPersisting}>
              {editingMethodRef.methodId ? tx('حفظ التعديلات', 'Save Changes') : tx('إضافة الطريقة', 'Add Method')}
            </Button>
          </div>
        )}
      >
        <form onSubmit={handleSaveMethod} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              {tx('المجموعة', 'Group')}
            </label>
            <select
              className={selectClassName}
              value={methodForm.groupId}
              onChange={(event) => setMethodForm((prev) => ({ ...prev, groupId: event.target.value }))}
              required
            >
              <option value="">{tx('اختر مجموعة', 'Select a group')}</option>
              {paymentGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={tx('اسم طريقة الدفع', 'Payment Method Name')}
            value={methodForm.name}
            onChange={(event) => setMethodForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={tx('مثال: تحويل الراجحي', 'Example: Al Rajhi Transfer')}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              {tx('الوصف', 'Description')}
            </label>
            <textarea
              className={textareaClassName}
              value={methodForm.description}
              onChange={(event) => setMethodForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder={tx('وصف قصير سيظهر للعميل', 'A short description shown to the customer')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              {tx('نوع الطريقة', 'Method Type')}
            </label>
            <select
              className={selectClassName}
              value={methodForm.type}
              onChange={(event) => setMethodForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              {methodTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={tx('رقم الحساب أو المحفظة', 'Account or Wallet Number')}
            value={methodForm.accountNumber}
            onChange={(event) => setMethodForm((prev) => ({ ...prev, accountNumber: event.target.value }))}
            placeholder={tx('أدخل الرقم الذي سيحوّل إليه العميل', 'Enter the number the customer will transfer to')}
          />

          <Input
            label={tx('اسم البنك', 'Bank Name')}
            value={methodForm.bankName}
            onChange={(event) => setMethodForm((prev) => ({ ...prev, bankName: event.target.value }))}
            placeholder={tx('يستخدم مع التحويل البنكي فقط', 'Used for bank transfer methods')}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              {tx('تعليمات العميل', 'Customer Instructions')}
            </label>
            <textarea
              className={textareaClassName}
              value={methodForm.instructions}
              onChange={(event) => setMethodForm((prev) => ({ ...prev, instructions: event.target.value }))}
              placeholder={tx('ما الذي يجب أن يفعله العميل قبل رفع الإيصال؟', 'What should the customer do before uploading the receipt?')}
            />
          </div>

          <label className={`flex items-center gap-3 text-sm text-[var(--color-text)] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input
              type="checkbox"
              checked={methodForm.isActive}
              onChange={(event) => setMethodForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            <span>{tx('تفعيل طريقة الدفع', 'Enable Payment Method')}</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPaymentMethods;
