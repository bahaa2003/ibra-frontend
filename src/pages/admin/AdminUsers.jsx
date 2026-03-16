import React, { useEffect, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';
import useGroupStore from '../../store/useGroupStore';
import useSystemStore from '../../store/useSystemStore';
import useAuthStore from '../../store/useAuthStore';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateTime, formatNumber } from '../../utils/intl';

const AdminUsers = () => {
  const {
    users,
    loadUsers,
    updateUserStatus,
    updateUserGroup,
    updateUserCoins,
    updateUserCurrency,
    deleteUser,
    resetUserPassword
  } = useAdminStore();
  const { groups, loadGroups } = useGroupStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { user: actor } = useAuthStore();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [settingsTopupAmount, setSettingsTopupAmount] = useState('');
  const [settingsGroup, setSettingsGroup] = useState('');
  const [settingsCurrency, setSettingsCurrency] = useState('USD');
  const [temporaryPassword, setTemporaryPassword] = useState('');

  useEffect(() => {
    loadUsers();
    loadGroups();
    loadCurrencies();
  }, [loadUsers, loadGroups, loadCurrencies]);

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === 'all' ? true : user.status === filter;
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusVariant = (status) => {
    if (status === 'active') return 'success';
    if (status === 'pending') return 'warning';
    return 'danger';
  };

  const handleStatusChange = (userId, status) => {
    if (status === 'active') {
      const user = users.find((entry) => entry.id === userId);
      setSelectedUser(user);
      setSelectedGroup(user.groupId || (groups.length > 0 ? groups[0].id : ''));
      setIsGroupModalOpen(true);
    } else {
      updateUserStatus(userId, status, actor);
      addToast(t('userActionDenied'), 'error');
    }
  };

  const confirmApproval = async () => {
    if (!selectedUser) return;

    try {
      if (selectedUser.status === 'active') {
        await updateUserGroup(selectedUser.id, selectedGroup, actor);
        addToast(t('groupUpdated') || 'تم تحديث مجموعة المستخدم', 'success');
      } else {
        await updateUserStatus(selectedUser.id, 'active', actor);
        await updateUserGroup(selectedUser.id, selectedGroup, actor);
        addToast(t('userActionApproved'), 'success');
      }

      setIsGroupModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث مجموعة المستخدم', 'error');
    }
  };

  const openUserSettings = (targetUser) => {
    if (targetUser.role !== 'customer') return;
    setSelectedUser(targetUser);
    setSettingsTopupAmount('');
    setSettingsGroup(targetUser.groupId || (groups.length > 0 ? groups[0].id : ''));
    setSettingsCurrency(targetUser.currency || currencies[0]?.code || 'USD');
    setTemporaryPassword('');
    setIsUserSettingsOpen(true);
  };

  const handleSettingsBlock = async () => {
    if (!selectedUser) return;
    const nextStatus = selectedUser.status === 'denied' ? 'active' : 'denied';
    await updateUserStatus(selectedUser.id, nextStatus, actor);
    addToast(nextStatus === 'denied' ? 'تم حظر العميل' : 'تم إلغاء حظر العميل', 'success');
    setSelectedUser({ ...selectedUser, status: nextStatus });
    loadUsers();
  };

  const handleSettingsDelete = async () => {
    if (!selectedUser) return;
    const ok = window.confirm(`Delete ${selectedUser.name}?`);
    if (!ok) return;
    await deleteUser(selectedUser.id, actor);
    addToast('تم حذف العميل', 'success');
    setIsUserSettingsOpen(false);
    loadUsers();
  };

  const handleSettingsTopup = async () => {
    if (!selectedUser || !settingsTopupAmount) return;
    await updateUserCoins(selectedUser.id, Number(settingsTopupAmount), actor);
    addToast('تم تطبيق الشحنة بنجاح', 'success');
    setSettingsTopupAmount('');
    loadUsers();
  };

  const handleSettingsGroupSave = async () => {
    if (!selectedUser || !settingsGroup) return;
    await updateUserGroup(selectedUser.id, settingsGroup, actor);
    addToast('تم تحديث المجموعة بنجاح', 'success');
    setSelectedUser({ ...selectedUser, groupId: settingsGroup, group: groups.find((g) => g.id === settingsGroup)?.name || settingsGroup });
    loadUsers();
  };

  const handleSettingsCurrencySave = async () => {
    if (!selectedUser || !settingsCurrency) return;
    await updateUserCurrency(selectedUser.id, settingsCurrency, actor);
    addToast('تم تحديث العملة بنجاح', 'success');
    setSelectedUser({ ...selectedUser, currency: settingsCurrency });
    loadUsers();
  };

  const copyToClipboard = async (value) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_error) {
      // Continue with fallback.
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      const result = await resetUserPassword(selectedUser.id, actor);
      const generatedPassword = result?.temporaryPassword || '';
      if (!generatedPassword) {
        addToast('فشل إنشاء كلمة مرور مؤقتة', 'error');
        return;
      }

      setTemporaryPassword(generatedPassword);
      const copied = await copyToClipboard(generatedPassword);
      addToast(copied ? 'تم إنشاء كلمة مرور مؤقتة ونسخها' : 'تم إنشاء كلمة مرور مؤقتة', 'success');
    } catch (error) {
      addToast(error?.message || 'فشل إعادة تعيين كلمة المرور', 'error');
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('userManagement')}</h1>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <div className="flex-1 md:w-64">
            <Input
              placeholder={t('searchUsers')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              variant="search"
            />
          </div>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm sm:w-auto dark:border-gray-700 dark:bg-gray-800"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t('allStatus')}</option>
            <option value="pending">{t('status_pending')}</option>
            <option value="active">{t('status_active') || t('status_approved')}</option>
            <option value="denied">{t('status_rejected')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filteredUsers.map((user) => (
          <article
            key={user.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start gap-3">
              <img src={user.avatar} alt={user.name} className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="mt-1 truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Badge variant={getStatusVariant(user.status)}>
                    {t(`status_${user.status}`) || user.status}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">{t('role')}</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{t(`role_${user.role}`) || user.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('group')}</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{user.group}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('coins')}</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{formatNumber(user.coins, 'ar-EG')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ID</p>
                    <p className="mt-1 truncate font-medium text-gray-900 dark:text-white">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {user.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleStatusChange(user.id, 'active')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleStatusChange(user.id, 'denied')}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              {user.status !== 'pending' && user.role === 'customer' && (
                <Button size="sm" variant="outline" onClick={() => openUserSettings(user)}>
                  إعدادات
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users')}</TableHead>
              <TableHead className="text-center">{t('role')}</TableHead>
              <TableHead className="text-center">{t('group')}</TableHead>
              <TableHead className="text-center">{t('coins')}</TableHead>
              <TableHead className="text-center">{t('status')}</TableHead>
              <TableHead className="text-end">{t('actions') || 'الإجراءات'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => openUserSettings(user)}
                className={user.role === 'customer' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full bg-gray-200" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center capitalize">{t(`role_${user.role}`) || user.role}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="info">{user.group}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-semibold">{formatNumber(user.coins, 'ar-EG')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(user.status)}>
                    {t(`status_${user.status}`) || user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                  {user.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleStatusChange(user.id, 'active')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleStatusChange(user.id, 'denied')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {user.status !== 'pending' && user.role === 'customer' && (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => openUserSettings(user)}
                      >
                        إعدادات
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={t('editGroup') || 'Select User Group'}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Select the group for user <strong>{selectedUser?.name}</strong>.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('group')}
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.discount}% {t('discount') || 'خصم'})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setIsGroupModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={confirmApproval}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
        title={selectedUser ? `Customer Settings - ${selectedUser.name}` : 'Customer Settings'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-1 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-sm text-gray-500">بيانات العميل</p>
            <p className="font-semibold text-gray-900 dark:text-white">{selectedUser?.name}</p>
            <p className="text-xs text-gray-500">{selectedUser?.email}</p>
            <p className="text-xs text-gray-500">المعرف: {selectedUser?.id}</p>
            <p className="text-xs text-gray-500">الدور: {selectedUser?.role}</p>
            <p className="text-xs text-gray-500">الحالة: {selectedUser?.status}</p>
            <p className="text-xs text-gray-500">المجموعة: {selectedUser?.group}</p>
            <p className="text-xs text-gray-500">العملة: {selectedUser?.currency || '-'}</p>
            <p className="text-xs text-gray-500">الرصيد: {formatNumber(selectedUser?.coins ?? 0, 'ar-EG')}</p>
            <p className="text-xs text-gray-500">تاريخ الانضمام: {selectedUser?.joinDate ? formatDateTime(selectedUser.joinDate, 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-'}</p>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">كلمة المرور</p>
            <p className="text-xs text-gray-500">كلمة المرور مخزنة بشكل مشفر ولا يمكن عرضها كنص واضح.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={handleResetPassword}>إعادة تعيين كلمة المرور</Button>
              {temporaryPassword && (
                <Button variant="outline" onClick={() => copyToClipboard(temporaryPassword)}>نسخ</Button>
              )}
            </div>
            {temporaryPassword && (
              <Input
                label="Temporary Password"
                value={temporaryPassword}
                readOnly
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">المجموعة</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={settingsGroup}
                onChange={(e) => setSettingsGroup(e.target.value)}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={handleSettingsGroupSave}>حفظ</Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">العملة</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={settingsCurrency}
                onChange={(e) => setSettingsCurrency(e.target.value)}
              >
                {(currencies || []).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={handleSettingsCurrencySave}>حفظ</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              label="Topup amount"
              type="number"
              min="1"
              value={settingsTopupAmount}
              onChange={(e) => setSettingsTopupAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <Button onClick={handleSettingsTopup} className="w-full">تطبيق الشحنة</Button>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleSettingsBlock}>
              {selectedUser?.status === 'denied' ? 'Unblock User' : 'Block User'}
            </Button>
            <Button variant="danger" onClick={handleSettingsDelete}>
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
