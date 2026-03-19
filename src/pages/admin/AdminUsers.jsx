import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Eye,
  KeyRound,
  Search,
  UserCheck,
  UserX,
  Wallet,
} from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';
import useGroupStore from '../../store/useGroupStore';
import useSystemStore from '../../store/useSystemStore';
import useAuthStore from '../../store/useAuthStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatNumber, getNumericLocale } from '../../utils/intl';
import {
  getAccountStatusBadgeVariant,
  getAccountStatusLabel,
  getSignupMethodLabel,
  getUserRegistrationDate,
  isApprovedAccountStatus,
  isPendingAccountStatus,
  isRejectedAccountStatus,
  normalizeAccountStatus,
} from '../../utils/accountStatus';

const FILTER_OPTIONS = ['all', 'pending', 'approved', 'rejected'];

const summaryCardClassName =
  'rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.84)] p-4 shadow-[var(--shadow-subtle)]';

const resolveInitialGroupValue = (entry, groups) => {
  if (entry?.groupId) return entry.groupId;
  const matchedGroup = (groups || []).find((group) => group.name === entry?.group || group.nameAr === entry?.group);
  return matchedGroup?.id || groups?.[0]?.id || '';
};

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFromQuery = searchParams.get('status');
  const initialFilter = FILTER_OPTIONS.includes(statusFromQuery) ? statusFromQuery : 'all';

  const {
    users,
    loadUsers,
    updateUserStatus,
    updateUserGroup,
    updateUserCoins,
    updateUserCurrency,
    deleteUser,
    resetUserPassword,
  } = useAdminStore();
  const { groups, loadGroups } = useGroupStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { user: actor } = useAuthStore();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { i18n } = useTranslation();

  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [settingsTopupAmount, setSettingsTopupAmount] = useState('');
  const [settingsGroup, setSettingsGroup] = useState('');
  const [settingsCurrency, setSettingsCurrency] = useState('USD');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = getNumericLocale(isArabic ? 'ar-EG' : 'en-US');

  useEffect(() => {
    loadUsers();
    loadGroups();
    loadCurrencies();
  }, [loadCurrencies, loadGroups, loadUsers]);

  useEffect(() => {
    if (!FILTER_OPTIONS.includes(statusFromQuery)) return;
    setFilter(statusFromQuery);
  }, [statusFromQuery]);

  useEffect(() => {
    if (!selectedUser?.id) return;
    const nextSelected = (users || []).find((entry) => entry.id === selectedUser.id);
    if (nextSelected) {
      setSelectedUser(nextSelected);
      setSettingsGroup(resolveInitialGroupValue(nextSelected, groups));
      setSettingsCurrency(nextSelected.currency || currencies[0]?.code || 'USD');
    }
  }, [currencies, groups, selectedUser?.id, users]);

  const customerUsers = useMemo(
    () => (users || []).filter((entry) => String(entry?.role || '').trim().toLowerCase() === 'customer'),
    [users]
  );

  const pendingCount = useMemo(
    () => customerUsers.filter((entry) => isPendingAccountStatus(entry?.status)).length,
    [customerUsers]
  );
  const approvedCount = useMemo(
    () => customerUsers.filter((entry) => isApprovedAccountStatus(entry?.status)).length,
    [customerUsers]
  );
  const rejectedCount = useMemo(
    () => customerUsers.filter((entry) => isRejectedAccountStatus(entry?.status)).length,
    [customerUsers]
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = String(search || '').trim().toLowerCase();

    return [...customerUsers]
      .filter((entry) => {
        const normalizedStatus = normalizeAccountStatus(entry?.status);
        const matchesFilter = filter === 'all' ? true : normalizedStatus === filter;
        const haystack = [
          entry?.name,
          entry?.email,
          entry?.username,
          entry?.id,
        ].join(' ').toLowerCase();
        const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
        return matchesFilter && matchesSearch;
      })
      .sort((left, right) => {
        const pendingDelta = Number(isPendingAccountStatus(right?.status)) - Number(isPendingAccountStatus(left?.status));
        if (pendingDelta !== 0) return pendingDelta;
        return new Date(getUserRegistrationDate(right) || 0) - new Date(getUserRegistrationDate(left) || 0);
      });
  }, [customerUsers, filter, search]);

  const openDetails = (entry) => {
    setSelectedUser(entry);
    setSettingsTopupAmount('');
    setSettingsGroup(resolveInitialGroupValue(entry, groups));
    setSettingsCurrency(entry?.currency || currencies[0]?.code || 'USD');
    setTemporaryPassword('');
    setManualPassword('');
    setIsDetailsOpen(true);
  };

  const formatDate = (value) => {
    if (!value) return isArabic ? 'غير متوفر' : 'Unavailable';
    return formatDateTime(value, locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value === 'all') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('status');
      setSearchParams(nextParams);
      return;
    }
    setSearchParams({ status: value });
  };

  const syncSelectedUser = (updatedUser) => {
    if (selectedUser?.id && updatedUser?.id === selectedUser.id) {
      setSelectedUser(updatedUser);
    }
  };

  const handleApprove = async (entry) => {
    setIsSubmitting(true);
    try {
      const updated = await updateUserStatus(entry.id, 'approved', actor);
      syncSelectedUser(updated);
      addToast('تمت الموافقة على الحساب بنجاح.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'تعذر اعتماد هذا الحساب.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const askReject = (entry) => {
    setRejectTarget(entry);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;

    setIsSubmitting(true);
    try {
      const updated = await updateUserStatus(rejectTarget.id, 'rejected', actor);
      syncSelectedUser(updated);
      addToast('تم رفض الحساب بنجاح.', 'success');
      setIsRejectModalOpen(false);
      setRejectTarget(null);
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'تعذر رفض هذا الحساب.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggleFromDetails = async () => {
    if (!selectedUser) return;

    if (isRejectedAccountStatus(selectedUser.status)) {
      await handleApprove(selectedUser);
      return;
    }

    askReject(selectedUser);
  };

  const handleSettingsGroupSave = async () => {
    if (!selectedUser || !settingsGroup) return;

    try {
      await updateUserGroup(selectedUser.id, settingsGroup, actor);
      addToast('تم تحديث المجموعة بنجاح.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'تعذر تحديث المجموعة.', 'error');
    }
  };

  const handleSettingsCurrencySave = async () => {
    if (!selectedUser || !settingsCurrency) return;

    try {
      await updateUserCurrency(selectedUser.id, settingsCurrency, actor);
      addToast('تم تحديث العملة بنجاح.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'تعذر تحديث العملة.', 'error');
    }
  };

  const handleSettingsTopup = async () => {
    if (!selectedUser || !settingsTopupAmount) return;

    try {
      await updateUserCoins(selectedUser.id, Number(settingsTopupAmount), actor);
      addToast('تم تطبيق الرصيد الإضافي بنجاح.', 'success');
      setSettingsTopupAmount('');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'تعذر تطبيق الرصيد الإضافي.', 'error');
    }
  };

  const copyToClipboard = async (value) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_error) {
      return false;
    }

    return false;
  };

  const handleCopyTemporaryPassword = async () => {
    if (!temporaryPassword) return;
    const copied = await copyToClipboard(temporaryPassword);
    addToast(copied ? 'تم نسخ كلمة المرور.' : 'تعذر نسخ كلمة المرور.', copied ? 'success' : 'error');
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const result = await resetUserPassword(selectedUser.id, actor);
      const generatedPassword = result?.temporaryPassword || '';
      setTemporaryPassword(generatedPassword);
      const copied = await copyToClipboard(generatedPassword);
      addToast(copied ? 'تم إنشاء كلمة مرور مؤقتة ونسخها.' : 'تم إنشاء كلمة مرور مؤقتة.', 'success');
    } catch (error) {
      addToast(error?.message || 'تعذر إعادة تعيين كلمة المرور.', 'error');
    }
  };

  const handleSetPassword = async () => {
    if (!selectedUser) return;
    const nextPassword = String(manualPassword || '').trim();
    if (nextPassword.length < 8) {
      addToast('كلمة المرور يجب أن تكون 8 أحرف على الأقل.', 'error');
      return;
    }

    try {
      const result = await resetUserPassword(selectedUser.id, actor, nextPassword);
      const appliedPassword = result?.temporaryPassword || nextPassword;
      setTemporaryPassword(appliedPassword);
      setManualPassword('');
      const copied = await copyToClipboard(appliedPassword);
      addToast(copied ? 'تم تغيير كلمة المرور ونسخها.' : 'تم تغيير كلمة المرور بنجاح.', 'success');
    } catch (error) {
      addToast(error?.message || 'تعذر تغيير كلمة المرور.', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const shouldDelete = window.confirm(`Delete ${selectedUser.name}?`);
    if (!shouldDelete) return;

    try {
      await deleteUser(selectedUser.id, actor);
      addToast('تم حذف المستخدم.', 'success');
      setIsDetailsOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'تعذر حذف المستخدم.', 'error');
    }
  };

  const handleOpenUserTransactions = () => {
    if (!selectedUser?.id) return;
    setIsDetailsOpen(false);
    navigate(`/admin/users/${selectedUser.id}/transactions`);
  };

  return (
    <div className="min-w-0 space-y-6">
      <section className="admin-premium-hero space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t('userManagement')}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            مراجعة طلبات التفعيل الجديدة وإدارة بيانات حسابات العملاء من مكان واحد.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[30rem] lg:grid-cols-[minmax(0,1fr)_160px]">
          <Input
            placeholder={t('searchUsers')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            icon={<Search className="h-4 w-4" />}
            variant="search"
          />

          <select
            className="h-14 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.95)] bg-[color:rgb(var(--color-surface-rgb)/0.88)] px-4 text-sm text-[var(--color-text)] shadow-[0_12px_36px_-28px_rgb(0_0_0/0.88)] outline-none transition focus:border-[color:rgb(var(--color-primary-rgb)/0.45)]"
            value={filter}
            onChange={(event) => handleFilterChange(event.target.value)}
          >
            <option value="all">كل الحالات</option>
            <option value="pending">بانتظار التفعيل</option>
            <option value="approved">مفعّل</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className={summaryCardClassName}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">حسابات بانتظار التفعيل</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{formatNumber(pendingCount, locale)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[color:rgb(var(--color-warning-rgb)/0.12)] text-[var(--color-warning)]">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className={summaryCardClassName}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">حسابات مفعّلة</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{formatNumber(approvedCount, locale)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[color:rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className={summaryCardClassName}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">حسابات مرفوضة</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{formatNumber(rejectedCount, locale)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[color:rgb(var(--color-error-rgb)/0.12)] text-[var(--color-error)]">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
      </section>

      <div className="space-y-3 md:hidden">
        {filteredUsers.map((entry) => (
          <Card key={entry.id} variant="elevated" className="p-4">
            <div className="flex items-start gap-3">
              <img
                src={entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || 'User')}&background=random`}
                alt={entry.name}
                className="h-12 w-12 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.84)] object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--color-text)]">{entry.name}</p>
                    <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">{entry.email}</p>
                  </div>
                  <Badge variant={getAccountStatusBadgeVariant(entry.status)}>
                    {getAccountStatusLabel(entry.status, isArabic)}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[var(--color-text-secondary)]">طريقة التسجيل</p>
                    <p className="mt-1 font-medium text-[var(--color-text)]">
                      {getSignupMethodLabel(entry.signupMethod || entry.authProvider, isArabic)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-secondary)]">تاريخ التسجيل</p>
                    <p className="mt-1 font-medium text-[var(--color-text)]">
                      {formatDate(getUserRegistrationDate(entry))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {isPendingAccountStatus(entry.status) && (
                <>
                  <Button size="sm" onClick={() => handleApprove(entry)} disabled={isSubmitting}>
                    موافقة
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => askReject(entry)} disabled={isSubmitting}>
                    رفض
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => openDetails(entry)}>
                <Eye className="h-4 w-4" />
                عرض التفاصيل
              </Button>
            </div>
          </Card>
        ))}

        {!filteredUsers.length && (
          <Card variant="elevated" className="p-8 text-center">
            <p className="text-sm font-semibold text-[var(--color-text)]">لا توجد حسابات مطابقة لهذا الفلتر.</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">جرّب توسيع البحث أو تغيير الحالة المحددة.</p>
          </Card>
        )}
      </div>

      <div className="admin-premium-panel hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>طريقة التسجيل</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الرصيد</TableHead>
              <TableHead className="text-end">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || 'User')}&background=random`}
                      alt={entry.name}
                      className="h-10 w-10 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.84)] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--color-text)]">{entry.name}</p>
                      <p className="truncate text-xs text-[var(--color-text-secondary)]">{entry.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-[var(--color-text)]">
                    {getSignupMethodLabel(entry.signupMethod || entry.authProvider, isArabic)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(getUserRegistrationDate(entry))}</TableCell>
                <TableCell>
                  <Badge variant={getAccountStatusBadgeVariant(entry.status)}>
                    {getAccountStatusLabel(entry.status, isArabic)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-[var(--color-text)]">{formatNumber(entry.coins || 0, locale)}</span>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    {isPendingAccountStatus(entry.status) && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(entry)} disabled={isSubmitting}>
                          موافقة
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => askReject(entry)} disabled={isSubmitting}>
                          رفض
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openDetails(entry)}>
                      عرض التفاصيل
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedUser ? `بيانات الحساب - ${selectedUser.name}` : 'بيانات الحساب'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.78)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.name || 'User')}&background=random`}
                  alt={selectedUser?.name}
                  className="h-14 w-14 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.84)] object-cover"
                />
                <div>
                  <p className="text-base font-semibold text-[var(--color-text)]">{selectedUser?.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{selectedUser?.email}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">ID: {selectedUser?.id}</p>
                </div>
              </div>

              <Badge variant={getAccountStatusBadgeVariant(selectedUser?.status)}>
                {getAccountStatusLabel(selectedUser?.status, isArabic)}
              </Badge>
            </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">طريقة التسجيل</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                  {getSignupMethodLabel(selectedUser?.signupMethod || selectedUser?.authProvider, isArabic)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">تاريخ التسجيل</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                  {formatDate(getUserRegistrationDate(selectedUser))}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">المجموعة</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{selectedUser?.group || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">العملة</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{selectedUser?.currency || '-'}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={handleOpenUserTransactions}>
                  <Eye className="h-4 w-4" />
                  المعاملات
                </Button>
              </div>
            </div>
          </div>

          {(isPendingAccountStatus(selectedUser?.status) || isApprovedAccountStatus(selectedUser?.status) || isRejectedAccountStatus(selectedUser?.status)) && (
            <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.84)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">قرار التفعيل</p>
              <p className="mt-1 text-xs leading-6 text-[var(--color-text-secondary)]">
                اعتماد أو رفض الحساب مع تحديث حالته فورًا في النظام.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(isPendingAccountStatus(selectedUser?.status) || isRejectedAccountStatus(selectedUser?.status)) && (
                  <Button onClick={() => handleApprove(selectedUser)} disabled={isSubmitting}>
                    موافقة على الحساب
                  </Button>
                )}
                {(isPendingAccountStatus(selectedUser?.status) || isApprovedAccountStatus(selectedUser?.status)) && (
                  <Button variant="danger" onClick={handleStatusToggleFromDetails} disabled={isSubmitting}>
                    رفض الحساب
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.84)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">المجموعة والعملة</p>

              <div className="space-y-2">
                <label className="text-xs text-[var(--color-text-secondary)]">المجموعة</label>
                <div className="flex gap-2">
                  <select
                    className="h-11 flex-1 rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.94)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[color:rgb(var(--color-primary-rgb)/0.45)]"
                    value={settingsGroup}
                    onChange={(event) => setSettingsGroup(event.target.value)}
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" onClick={handleSettingsGroupSave}>
                    حفظ
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[var(--color-text-secondary)]">العملة</label>
                <div className="flex gap-2">
                  <select
                    className="h-11 flex-1 rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.94)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[color:rgb(var(--color-primary-rgb)/0.45)]"
                    value={settingsCurrency}
                    onChange={(event) => setSettingsCurrency(event.target.value)}
                  >
                    {(currencies || []).map((currencyItem) => (
                      <option key={currencyItem.code} value={currencyItem.code}>
                        {currencyItem.code} - {currencyItem.name}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" onClick={handleSettingsCurrencySave}>
                    حفظ
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.84)] p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[var(--color-primary)]" />
                <p className="text-sm font-semibold text-[var(--color-text)]">الرصيد وكلمة المرور</p>
              </div>

              <Input
                label="إضافة رصيد"
                type="number"
                min="1"
                value={settingsTopupAmount}
                onChange={(event) => setSettingsTopupAmount(event.target.value)}
                placeholder="100"
              />
              <Button onClick={handleSettingsTopup} className="w-full">
                إضافة الرصيد
              </Button>

              <Input
                label="تعيين كلمة مرور جديدة"
                type="text"
                value={manualPassword}
                onChange={(event) => setManualPassword(event.target.value)}
                placeholder="أدخل كلمة مرور جديدة (8 أحرف على الأقل)"
                className="font-mono"
              />
              <Button variant="outline" onClick={handleSetPassword} className="w-full" disabled={!String(manualPassword || '').trim()}>
                تعيين كلمة المرور
              </Button>
              <p className="text-xs text-[var(--color-text-secondary)]">يمكنك تعيين كلمة مرور مباشرة لأي حساب من هنا.</p>

              <div className="rounded-[var(--radius-lg)] bg-[color:rgb(var(--color-surface-rgb)/0.68)] p-3">
                <p className="text-xs leading-6 text-[var(--color-text-secondary)]">
                  إعادة تعيين كلمة المرور ستُنشئ كلمة مرور مؤقتة جديدة لهذا المستخدم.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleResetPassword}>
                    <KeyRound className="h-4 w-4" />
                    إعادة تعيين كلمة المرور
                  </Button>
                </div>
                {temporaryPassword && (
                  <>
                    <Input
                      label="Temporary Password"
                      readOnly
                      value={temporaryPassword}
                      onClick={handleCopyTemporaryPassword}
                      onFocus={(event) => event.target.select()}
                      title="اضغط لنسخ كلمة المرور"
                      className="mt-3 cursor-copy"
                    />
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">اضغط على كلمة المرور لنسخها</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-[color:rgb(var(--color-border-rgb)/0.84)] pt-4">
            <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>
              إغلاق
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              حذف المستخدم
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="تأكيد رفض الحساب"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="danger" onClick={confirmReject} disabled={isSubmitting}>
              تأكيد الرفض
            </Button>
          </div>
        )}
      >
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          هل أنت متأكد من رفض حساب <span className="font-semibold text-[var(--color-text)]">{rejectTarget?.name}</span>؟
          سيتم منعه من الوصول إلى الصفحات المحمية حتى تتم إعادة تفعيله يدويًا من الإدارة.
        </p>
      </Modal>
    </div>
  );
};

export default AdminUsers;
