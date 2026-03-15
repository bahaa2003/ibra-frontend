import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserCog, Trash2 } from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

const SUPERVISOR_ROLES = ['manager', 'moderator'];

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
    () => (users || []).filter((u) => SUPERVISOR_ROLES.includes(String(u.role || '').toLowerCase())),
    [users]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return supervisors.filter((u) => {
      const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;
      const matchesSearch = !term
        ? true
        : String(u.name || '').toLowerCase().includes(term) || String(u.email || '').toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [supervisors, search, statusFilter]);

  const handleRoleChange = async (id, nextRole) => {
    try {
      await updateUserRole(id, nextRole, actor);
      addToast('تم تحديث الدور بنجاح', 'success');
      loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الدور', 'error');
    }
  };

  const handleStatusToggle = async (target) => {
    const nextStatus = target.status === 'denied' ? 'active' : 'denied';
    try {
      await updateUserStatus(target.id, nextStatus, actor);
      addToast(nextStatus === 'active' ? 'تم تفعيل المشرف' : 'تم حظر المشرف', 'success');
      loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الحالة', 'error');
    }
  };

  const handleDelete = async (target) => {
    const ok = window.confirm(`حذف المشرف ${target.name}؟`);
    if (!ok) return;
    try {
      await deleteUser(target.id, actor);
      addToast('تم حذف المشرف', 'success');
      loadUsers();
    } catch (error) {
      addToast(error?.message || 'فشل حذف المشرف', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserCog className="w-6 h-6" />
          إدارة المشرفين
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-72">
            <Input
              placeholder="بحث بالاسم أو البريد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              variant="search"
            />
          </div>
          <select
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
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full bg-gray-200" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <select
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="manager">مانجر</option>
                    <option value="moderator">مشرف</option>
                  </select>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'danger'}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant={u.status === 'denied' ? 'success' : 'outline'}
                      onClick={() => handleStatusToggle(u)}
                    >
                      {u.status === 'denied' ? 'تفعيل' : 'حظر'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  لا يوجد مشرفون مطابقون للبحث
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
