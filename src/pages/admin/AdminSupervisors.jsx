import React, { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, UserCog } from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
  getAccountStatusBadgeVariant,
  getAccountStatusLabel,
  isRejectedAccountStatus,
  normalizeAccountStatus,
} from '../../utils/accountStatus';

const SUPERVISOR_ROLES = ['manager', 'moderator'];
const FILTER_OPTIONS = ['all', 'approved', 'pending', 'rejected'];

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
    () => (users || []).filter((entry) => SUPERVISOR_ROLES.includes(String(entry.role || '').toLowerCase())),
    [users]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

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

  const handleRoleChange = async (id, nextRole) => {
    try {
      await updateUserRole(id, nextRole, actor);
      addToast('تم تحديث الدور بنجاح.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الدور.', 'error');
    }
  };

  const handleStatusToggle = async (target) => {
    const nextStatus = isRejectedAccountStatus(target.status) ? 'approved' : 'rejected';
    try {
      await updateUserStatus(target.id, nextStatus, actor);
      addToast(nextStatus === 'approved' ? 'تم تفعيل المشرف.' : 'تم حظر المشرف.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الحالة.', 'error');
    }
  };

  const handleDelete = async (target) => {
    const shouldDelete = window.confirm(`حذف المشرف ${target.name}؟`);
    if (!shouldDelete) return;

    try {
      await deleteUser(target.id, actor);
      addToast('تم حذف المشرف.', 'success');
      await loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل حذف المشرف.', 'error');
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <section className="admin-premium-hero">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text)]">
          <UserCog className="h-6 w-6" />
          إدارة المشرفين
        </h1>

        <div className="flex w-full gap-2 md:w-auto">
          <div className="flex-1 md:w-72">
            <Input
              placeholder="بحث بالاسم أو البريد..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              icon={<Search className="h-4 w-4" />}
              variant="search"
            />
          </div>
          <select
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
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={entry.avatar} alt={entry.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full bg-gray-200" />
                    <div>
                      <div className="font-medium text-[var(--color-text)]">{entry.name}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{entry.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <select
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                    value={entry.role}
                    onChange={(event) => handleRoleChange(entry.id, event.target.value)}
                  >
                    <option value="manager">مانجر</option>
                    <option value="moderator">مشرف</option>
                  </select>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getAccountStatusBadgeVariant(entry.status)}>
                    {getAccountStatusLabel(entry.status, true)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant={isRejectedAccountStatus(entry.status) ? 'primary' : 'outline'} onClick={() => handleStatusToggle(entry)}>
                      {isRejectedAccountStatus(entry.status) ? 'تفعيل' : 'حظر'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(entry)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-[var(--color-text-secondary)]">
                  لا يوجد مشرفون مطابقون للبحث.
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
