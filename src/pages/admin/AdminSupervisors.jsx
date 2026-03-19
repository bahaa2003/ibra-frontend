import React, { useEffect, useMemo, useState } from 'react';
<<<<<<< HEAD
import { Search, Trash2, UserCog } from 'lucide-react';
=======
import { Search, UserCog, Trash2 } from 'lucide-react';
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
import useAdminStore from '../../store/useAdminStore';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
<<<<<<< HEAD
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
  getAccountStatusBadgeVariant,
  getAccountStatusLabel,
  isRejectedAccountStatus,
  normalizeAccountStatus,
} from '../../utils/accountStatus';

const SUPERVISOR_ROLES = ['manager', 'moderator'];
const FILTER_OPTIONS = ['all', 'approved', 'pending', 'rejected'];
=======
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const SUPERVISOR_ROLES = ['manager', 'moderator'];
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

const AdminSupervisors = () => {
  const { users, loadUsers, updateUserRole, updateUserStatus, deleteUser } = useAdminStore();
  const { user: actor } = useAuthStore();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const supervisors = useMemo(
<<<<<<< HEAD
    () => (users || []).filter((entry) => SUPERVISOR_ROLES.includes(String(entry.role || '').toLowerCase())),
=======
    () => (users || []).filter((u) => SUPERVISOR_ROLES.includes(String(u.role || '').toLowerCase())),
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    [users]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
<<<<<<< HEAD

    return supervisors.filter((entry) => {
      const normalizedStatus = normalizeAccountStatus(entry.status);
      const matchesStatus = statusFilter === 'all' ? true : normalizedStatus === statusFilter;
      const matchesSearch = !term
        ? true
        : String(entry.name || '').toLowerCase().includes(term)
          || String(entry.email || '').toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, supervisors]);
=======
    return supervisors.filter((u) => {
      const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;
      const matchesSearch = !term
        ? true
        : String(u.name || '').toLowerCase().includes(term) || String(u.email || '').toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [supervisors, search, statusFilter]);
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

  const handleRoleChange = async (id, nextRole) => {
    try {
      await updateUserRole(id, nextRole, actor);
<<<<<<< HEAD
      addToast('تم تحديث الدور بنجاح.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الدور.', 'error');
=======
      addToast('تم تحديث الدور بنجاح', 'success');
      loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الدور', 'error');
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    }
  };

  const handleStatusToggle = async (target) => {
<<<<<<< HEAD
    const nextStatus = isRejectedAccountStatus(target.status) ? 'approved' : 'rejected';
    try {
      await updateUserStatus(target.id, nextStatus, actor);
      addToast(nextStatus === 'approved' ? 'تم تفعيل المشرف.' : 'تم حظر المشرف.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الحالة.', 'error');
=======
    const nextStatus = target.status === 'denied' ? 'active' : 'denied';
    try {
      await updateUserStatus(target.id, nextStatus, actor);
      addToast(nextStatus === 'active' ? 'تم تفعيل المشرف' : 'تم حظر المشرف', 'success');
      loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الحالة', 'error');
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    }
  };

  const handleDelete = async (target) => {
<<<<<<< HEAD
    const shouldDelete = window.confirm(`حذف المشرف ${target.name}؟`);
    if (!shouldDelete) return;

    try {
      await deleteUser(target.id, actor);
      addToast('تم حذف المشرف.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل حذف المشرف.', 'error');
=======
    const ok = window.confirm(`حذف المشرف ${target.name}؟`);
    if (!ok) return;
    try {
      await deleteUser(target.id, actor);
      addToast('تم حذف المشرف', 'success');
      loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل حذف المشرف', 'error');
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-w-0 space-y-6">
      <section className="admin-premium-hero">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text)]">
          <UserCog className="h-6 w-6" />
          إدارة المشرفين
        </h1>

        <div className="flex w-full gap-2 md:w-auto">
=======
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserCog className="w-6 h-6" />
          إدارة المشرفين
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          <div className="flex-1 md:w-72">
            <Input
              placeholder="بحث بالاسم أو البريد..."
              value={search}
<<<<<<< HEAD
              onChange={(event) => setSearch(event.target.value)}
              icon={<Search className="h-4 w-4" />}
=======
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              variant="search"
            />
          </div>
          <select
<<<<<<< HEAD
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            value={statusFilter}
            onChange={(event) => setStatusFilter(FILTER_OPTIONS.includes(event.target.value) ? event.target.value : 'all')}
          >
            <option value="all">كل الحالات</option>
            <option value="approved">نشط</option>
            <option value="pending">قيد الانتظار</option>
            <option value="rejected">محظور</option>
          </select>
        </div>
      </div>
      </section>

      <div className="admin-premium-stat text-sm text-[var(--color-text-secondary)]">
        إجمالي المشرفين: <span className="font-semibold text-[var(--color-text)]">{supervisors.length}</span>
      </div>

      <div className="admin-premium-panel overflow-hidden">
=======
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">قيد الانتظار</option>
            <option value="denied">محظور</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        إجمالي المشرفين: <span className="font-semibold text-gray-900 dark:text-white">{supervisors.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المشرف</TableHead>
              <TableHead className="text-center">الدور</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-end">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
<<<<<<< HEAD
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={entry.avatar} alt={entry.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full bg-gray-200" />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">{entry.name}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{entry.email}</div>
=======
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full bg-gray-200" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <select
<<<<<<< HEAD
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                    value={entry.role}
                    onChange={(event) => handleRoleChange(entry.id, event.target.value)}
=======
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                  >
                    <option value="manager">مانجر</option>
                    <option value="moderator">مشرف</option>
                  </select>
                </TableCell>
                <TableCell className="text-center">
<<<<<<< HEAD
                  <Badge variant={getAccountStatusBadgeVariant(entry.status)}>
                    {getAccountStatusLabel(entry.status, true)}
=======
                  <Badge variant={u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'danger'}>
                    {u.status}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
<<<<<<< HEAD
                    <Button size="sm" variant={isRejectedAccountStatus(entry.status) ? 'primary' : 'outline'} onClick={() => handleStatusToggle(entry)}>
                      {isRejectedAccountStatus(entry.status) ? 'تفعيل' : 'حظر'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(entry)}>
                      <Trash2 className="h-4 w-4" />
=======
                    <Button
                      size="sm"
                      variant={u.status === 'denied' ? 'success' : 'outline'}
                      onClick={() => handleStatusToggle(u)}
                    >
                      {u.status === 'denied' ? 'تفعيل' : 'حظر'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>
                      <Trash2 className="w-4 h-4" />
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

<<<<<<< HEAD
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-[var(--color-text-secondary)]">
                  لا يوجد مشرفون مطابقون للبحث.
=======
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  لا يوجد مشرفون مطابقون للبحث
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSupervisors;
