import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Check,
  CheckCircle2,
  ChevronLeft,
  Crown,
  Eye,
  KeyRound,
  LayoutDashboard,
  Lock,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCog,
  Users,
  WalletCards,
} from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  getAccountStatusBadgeVariant,
  getAccountStatusLabel,
  isRejectedAccountStatus,
  normalizeAccountStatus,
} from '../../utils/accountStatus';
import { ROLES, normalizeRole } from '../../utils/authRoles';

const SUPERVISOR_ROLES = [ROLES.SUPERVISOR];
const FILTER_OPTIONS = ['all', 'approved', 'pending', 'rejected'];

const ROLE_META = {
  supervisor: {
    label: 'Ù…Ø´Ø±Ù',
    helper: 'Ù…ØªØ§Ø¨Ø¹Ø© ÙˆØªÙ†ÙÙŠØ° Ù…Ù‡Ø§Ù… Ù…Ø­Ø¯Ø¯Ø© Ù…Ù† Ø§Ù„Ø£Ø¯Ù…Ù†.',
    icon: ShieldCheck,
  },
  manager: {
    label: 'مدير تشغيل',
    helper: 'صلاحيات أوسع لمتابعة التشغيل اليومي.',
    icon: Crown,
  },
  moderator: {
    label: 'مشرف',
    helper: 'متابعة وتنفيذ مهام محددة من الأدمن.',
    icon: ShieldCheck,
  },
};

const PERMISSION_GROUPS = [
  {
    id: 'dashboard',
    title: 'لوحة التحكم',
    description: 'مشاهدة المؤشرات ومتابعة النشاط العام.',
    icon: LayoutDashboard,
    permissions: [
      { key: 'dashboard.view', label: 'عرض لوحة التحكم', active: true },
      { key: 'reports.view', label: 'تقارير الأداء', active: true },
      { key: 'reports.export', label: 'تصدير التقارير', active: false },
    ],
  },
  {
    id: 'orders',
    title: 'الطلبات',
    description: 'إدارة طلبات العملاء ومراجعة الحالات.',
    icon: Package,
    permissions: [
      { key: 'orders.view', label: 'عرض الطلبات', active: true },
      { key: 'orders.update', label: 'تحديث حالة الطلب', active: true },
      { key: 'orders.refund', label: 'استرجاع قيمة الطلب', active: false },
    ],
  },
  {
    id: 'wallet',
    title: 'المحفظة والمدفوعات',
    description: 'متابعة الشحنات وحركات الرصيد.',
    icon: WalletCards,
    permissions: [
      { key: 'wallet.view', label: 'عرض المحافظ', active: true },
      { key: 'topups.review', label: 'مراجعة طلبات الشحن', active: true },
      { key: 'wallet.adjust', label: 'تعديل رصيد العميل', active: false },
    ],
  },
  {
    id: 'catalog',
    title: 'المنتجات والمجموعات',
    description: 'تنظيم المنتجات، الموردين، والمجموعات.',
    icon: Sparkles,
    permissions: [
      { key: 'products.view', label: 'عرض المنتجات', active: true },
      { key: 'products.manage', label: 'إضافة وتعديل المنتجات', active: true },
      { key: 'groups.manage', label: 'إدارة مجموعات الأسعار', active: true },
      { key: 'suppliers.manage', label: 'إدارة الموردين', active: false },
    ],
  },
  {
    id: 'users',
    title: 'المستخدمين',
    description: 'متابعة العملاء بدون فتح صلاحيات الأدمن الحساسة.',
    icon: Users,
    permissions: [
      { key: 'users.view', label: 'عرض العملاء', active: true },
      { key: 'users.status', label: 'قبول أو حظر العملاء', active: true },
      { key: 'users.delete', label: 'حذف المستخدمين', active: false },
    ],
  },
];

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.permissions);
const ACTIVE_PERMISSION_KEYS = ALL_PERMISSIONS.filter((item) => item.active).map((item) => item.key);
const MANAGER_DEFAULT_PERMISSIONS = ACTIVE_PERMISSION_KEYS;
const MODERATOR_DEFAULT_PERMISSIONS = [
  'dashboard.view',
  'orders.view',
  'orders.update',
  'topups.review',
  'products.view',
  'users.view',
];

const getSupervisorPermissions = (entry) => {
  const raw = entry?.supervisorPermissions || entry?.permissions || [];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    return Object.entries(raw)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);
  }
  return normalizeRole(entry?.role) === ROLES.SUPERVISOR
    ? MODERATOR_DEFAULT_PERMISSIONS
    : [];
};

const getInitials = (name = '', email = '') => {
  const source = String(name || email || 'مشرف').trim();
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const AdminSupervisors = () => {
  const {
    users,
    loadUsers,
    updateUserRole,
    updateUserStatus,
    updateSupervisorPermissions,
    deleteUser,
  } = useAdminStore();
  const { user: actor } = useAuthStore();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [candidateRole, setCandidateRole] = useState(ROLES.SUPERVISOR);
  const [draftPermissions, setDraftPermissions] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const supervisors = useMemo(
    () => (users || []).filter((entry) => SUPERVISOR_ROLES.includes(normalizeRole(entry.role))),
    [users]
  );

  const candidates = useMemo(
    () => (users || []).filter((entry) => {
      const role = normalizeRole(entry.role);
      return role !== ROLES.ADMIN && !SUPERVISOR_ROLES.includes(role);
    }),
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

  const selectedSupervisor = useMemo(
    () => supervisors.find((entry) => String(entry.id) === String(selectedId)) || filtered[0] || supervisors[0] || null,
    [filtered, selectedId, supervisors]
  );

  useEffect(() => {
    if (selectedSupervisor?.id && selectedSupervisor.id !== selectedId) {
      setSelectedId(selectedSupervisor.id);
    }
  }, [selectedId, selectedSupervisor]);

  useEffect(() => {
    if (selectedSupervisor) {
      setDraftPermissions(getSupervisorPermissions(selectedSupervisor));
    } else {
      setDraftPermissions([]);
    }
  }, [selectedSupervisor]);

  const activeCount = supervisors.filter((entry) => normalizeAccountStatus(entry.status) === 'approved').length;
  const pendingCount = supervisors.filter((entry) => normalizeAccountStatus(entry.status) === 'pending').length;
  const blockedCount = supervisors.filter((entry) => isRejectedAccountStatus(entry.status)).length;
  const availablePermissionsCount = ALL_PERMISSIONS.filter((item) => item.active).length;
  const upcomingPermissionsCount = ALL_PERMISSIONS.length - availablePermissionsCount;

  const handleRoleChange = async (id, nextRole) => {
    try {
      const normalizedRole = normalizeRole(nextRole);
      const defaults = normalizedRole === ROLES.SUPERVISOR ? MODERATOR_DEFAULT_PERMISSIONS : [];
      await updateUserRole(id, normalizedRole, actor, defaults);
      addToast('تم تحديث الدور والصلاحيات الافتراضية.', 'success');
      await loadUsers({ force: true });
      return true;
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الدور.', 'error');
      return false;
    }
  };

  const handlePromoteCandidate = async () => {
    if (!candidateId) {
      addToast('اختار مستخدم الأول عشان تضيفه كمشرف.', 'warning');
      return;
    }

    try {
      const wasPromoted = await handleRoleChange(candidateId, candidateRole);
      if (!wasPromoted) return;
      setSelectedId(candidateId);
      setCandidateId('');
    } catch {
      // handleRoleChange already shows the toast.
    }
  };

  const handleStatusToggle = async (target) => {
    const nextStatus = isRejectedAccountStatus(target.status) ? 'approved' : 'rejected';
    try {
      await updateUserStatus(target.id, nextStatus, actor);
      addToast(nextStatus === 'approved' ? 'تم تفعيل المشرف.' : 'تم إيقاف وصول المشرف.', 'success');
      await loadUsers({ force: true });
    } catch (error) {
      addToast(error?.message || 'فشل تحديث الحالة.', 'error');
    }
  };

  const handleDelete = async (target) => {
    const shouldDelete = window.confirm(`حذف المشرف ${target.name || target.email}؟`);
    if (!shouldDelete) return;

    try {
      await deleteUser(target.id, actor);
      addToast('تم حذف المشرف.', 'success');
      await loadUsers({ force: true });
    } catch (error) {
      addToast(error?.message || 'فشل حذف المشرف.', 'error');
    }
  };

  const togglePermission = (permission) => {
    if (!permission.active) return;
    setDraftPermissions((current) => (
      current.includes(permission.key)
        ? current.filter((key) => key !== permission.key)
        : [...current, permission.key]
    ));
  };

  const savePermissions = async () => {
    if (!selectedSupervisor) return;
    setIsSavingPermissions(true);
    try {
      await updateSupervisorPermissions(selectedSupervisor.id, draftPermissions, actor);
      addToast('تم حفظ صلاحيات المشرف.', 'success');
      await loadUsers({ force: true });
    } catch (error) {
      addToast(error?.message || 'فشل حفظ الصلاحيات.', 'error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const selectedPermissions = selectedSupervisor ? getSupervisorPermissions(selectedSupervisor) : [];
  const hasPermissionChanges = JSON.stringify([...draftPermissions].sort()) !== JSON.stringify([...selectedPermissions].sort());

  return (
    <div dir="rtl" className="min-w-0 space-y-6">
      <section className="admin-premium-hero overflow-hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="section-kicker">إدارة الوصول</span>
            <h1 className="mt-4 flex items-center gap-3 text-2xl font-black text-[var(--color-text)] sm:text-3xl">
              <UserCog className="h-7 w-7 text-[var(--color-primary)]" />
              إدارة المشرفين والصلاحيات
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              اختار المشرف، حدد الدور، وافتح له الصلاحيات المناسبة فقط. الصلاحيات المقفولة ظاهرة كتجهيز للباك أو للمرحلة القادمة بدون تفعيل الآن.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[34rem]">
            {[
              { label: 'المشرفين', value: supervisors.length, icon: Users },
              { label: 'نشط', value: activeCount, icon: CheckCircle2 },
              { label: 'انتظار', value: pendingCount, icon: Eye },
              { label: 'موقوف', value: blockedCount, icon: Ban },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-3 shadow-[var(--shadow-subtle)]">
                  <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                  <div className="mt-2 text-2xl font-black text-[var(--color-text)]">{item.value}</div>
                  <div className="text-xs font-bold text-[var(--color-text-secondary)]">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="admin-premium-panel p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.75fr_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-xs font-black text-[var(--color-text-secondary)]">إضافة مشرف من المستخدمين الحاليين</label>
            <select
              value={candidateId}
              onChange={(event) => setCandidateId(event.target.value)}
              className="h-11 w-full rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] px-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-[color:rgb(var(--color-primary-rgb)/0.45)]"
            >
              <option value="">اختار مستخدم للترقية...</option>
              {candidates.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name || entry.email} - {entry.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black text-[var(--color-text-secondary)]">الدور الافتراضي</label>
            <select
              value={candidateRole}
              onChange={(event) => setCandidateRole(event.target.value)}
              className="h-11 w-full rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] px-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-[color:rgb(var(--color-primary-rgb)/0.45)]"
            >
              <option value={ROLES.SUPERVISOR}>مشرف</option>
            </select>
          </div>

          <Button type="button" onClick={handlePromoteCandidate} className="h-11">
            <Plus className="h-4 w-4" />
            إضافة مشرف
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[25rem_1fr]">
        <section className="admin-premium-panel overflow-hidden">
          <div className="border-b border-[color:rgb(var(--color-border-rgb)/0.76)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[var(--color-text)]">قائمة المشرفين</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                  فلتر واختار مشرف لتعديل صلاحياته.
                </p>
              </div>
              <Badge variant="premium">{filtered.length} نتيجة</Badge>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_9rem] xl:grid-cols-1">
              <Input
                placeholder="بحث بالاسم أو البريد..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                icon={<Search className="h-4 w-4" />}
                variant="search"
              />
              <select
                className="h-11 rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] px-3 text-sm font-semibold text-[var(--color-text)] outline-none"
                value={statusFilter}
                onChange={(event) => setStatusFilter(FILTER_OPTIONS.includes(event.target.value) ? event.target.value : 'all')}
              >
                <option value="all">كل الحالات</option>
                <option value="approved">نشط</option>
                <option value="pending">قيد الانتظار</option>
                <option value="rejected">موقوف</option>
              </select>
            </div>
          </div>

          <div className="max-h-[46rem] overflow-y-auto p-2">
            {filtered.map((entry) => {
              const roleMeta = ROLE_META[normalizeRole(entry.role).toLowerCase()] || ROLE_META.supervisor;
              const RoleIcon = roleMeta.icon;
              const permissions = getSupervisorPermissions(entry);
              const isSelected = selectedSupervisor && String(selectedSupervisor.id) === String(entry.id);

              return (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  className={`mb-2 w-full rounded-2xl border p-3 text-right transition-all ${
                    isSelected
                      ? 'border-[color:rgb(var(--color-primary-rgb)/0.38)] bg-[color:rgb(var(--color-primary-rgb)/0.09)] shadow-[var(--shadow-subtle)]'
                      : 'border-transparent hover:border-[color:rgb(var(--color-border-rgb)/0.88)] hover:bg-[color:rgb(var(--color-card-rgb)/0.72)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-11 w-11 rounded-2xl bg-[color:rgb(var(--color-border-rgb)/0.28)] object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:rgb(var(--color-primary-rgb)/0.13)] text-sm font-black text-[var(--color-primary)]">
                        {getInitials(entry.name, entry.email)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-black text-[var(--color-text)]">{entry.name || 'مشرف بدون اسم'}</h3>
                        <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">{entry.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant={getAccountStatusBadgeVariant(entry.status)}>
                          {getAccountStatusLabel(entry.status, true)}
                        </Badge>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.76)] px-2 py-1 text-[11px] font-bold text-[var(--color-text-secondary)]">
                          <RoleIcon className="h-3 w-3" />
                          {roleMeta.label}
                        </span>
                        <span className="rounded-full bg-[color:rgb(var(--color-border-rgb)/0.24)] px-2 py-1 text-[11px] font-bold text-[var(--color-muted)]">
                          {permissions.length} صلاحية
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {!filtered.length && (
              <div className="px-5 py-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]">
                  <UserCog className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-black text-[var(--color-text)]">لا يوجد مشرفون مطابقون</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)]">
                  جرب تغيير البحث أو أضف مشرف جديد من المستخدمين الحاليين.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="admin-premium-panel overflow-hidden">
          {selectedSupervisor ? (
            <>
              <div className="border-b border-[color:rgb(var(--color-border-rgb)/0.76)] p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:rgb(var(--color-primary-rgb)/0.13)] text-base font-black text-[var(--color-primary)]">
                      {getInitials(selectedSupervisor.name, selectedSupervisor.email)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-black text-[var(--color-text)]">{selectedSupervisor.name || selectedSupervisor.email}</h2>
                      <p className="mt-1 truncate text-sm text-[var(--color-text-secondary)]">{selectedSupervisor.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant={getAccountStatusBadgeVariant(selectedSupervisor.status)}>
                          {getAccountStatusLabel(selectedSupervisor.status, true)}
                        </Badge>
                        <Badge variant="premium">
                          {draftPermissions.length} من {availablePermissionsCount} صلاحية متاحة
                        </Badge>
                        <Badge variant="secondary">
                          {upcomingPermissionsCount} قريبًا
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[28rem]">
                    <select
                      className="h-10 rounded-[var(--radius-sm)] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] px-3 text-sm font-bold text-[var(--color-text)] outline-none"
                      value={normalizeRole(selectedSupervisor.role)}
                      onChange={(event) => handleRoleChange(selectedSupervisor.id, event.target.value)}
                    >
                      <option value={ROLES.SUPERVISOR}>مشرف</option>
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      variant={isRejectedAccountStatus(selectedSupervisor.status) ? 'primary' : 'outline'}
                      onClick={() => handleStatusToggle(selectedSupervisor)}
                    >
                      {isRejectedAccountStatus(selectedSupervisor.status) ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      {isRejectedAccountStatus(selectedSupervisor.status) ? 'تفعيل' : 'إيقاف'}
                    </Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(selectedSupervisor)}>
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[var(--color-text)]">الصلاحيات</h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                      فعل فقط الصلاحيات المناسبة لهذا المشرف. الصلاحيات المقفولة لن يتم حفظها حتى يتم دعمها.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={savePermissions}
                    disabled={!hasPermissionChanges || isSavingPermissions}
                  >
                    <KeyRound className="h-4 w-4" />
                    {isSavingPermissions ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                  </Button>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {PERMISSION_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    const enabledInGroup = group.permissions.filter((permission) => draftPermissions.includes(permission.key)).length;

                    return (
                      <div key={group.id} className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]">
                            <GroupIcon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-black text-[var(--color-text)]">{group.title}</h4>
                              <span className="rounded-full bg-[color:rgb(var(--color-border-rgb)/0.28)] px-2 py-1 text-[11px] font-bold text-[var(--color-muted)]">
                                {enabledInGroup}/{group.permissions.filter((item) => item.active).length}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{group.description}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {group.permissions.map((permission) => {
                            const checked = draftPermissions.includes(permission.key);
                            return (
                              <button
                                type="button"
                                key={permission.key}
                                onClick={() => togglePermission(permission)}
                                disabled={!permission.active}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-right transition-colors ${
                                  checked
                                    ? 'border-[color:rgb(var(--color-primary-rgb)/0.34)] bg-[color:rgb(var(--color-primary-rgb)/0.09)]'
                                    : 'border-[color:rgb(var(--color-border-rgb)/0.62)] bg-transparent'
                                } ${permission.active ? 'hover:border-[color:rgb(var(--color-primary-rgb)/0.32)]' : 'cursor-not-allowed opacity-55'}`}
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm font-bold text-[var(--color-text)]">{permission.label}</span>
                                  <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-muted)]">
                                    {permission.active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                    {permission.active ? 'متاحة للتفعيل' : 'قريبًا'}
                                  </span>
                                </span>
                                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                  checked
                                    ? 'border-[color:rgb(var(--color-primary-rgb)/0.42)] bg-[var(--color-primary)] text-[var(--color-button-text)]'
                                    : 'border-[color:rgb(var(--color-border-rgb)/0.9)] text-transparent'
                                }`}>
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]">
                <ShieldCheck className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-xl font-black text-[var(--color-text)]">ابدأ بإضافة مشرف</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">
                بعد إضافة مشرف من المستخدمين الحاليين، هتقدر تحدد صلاحياته من هنا.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminSupervisors;
