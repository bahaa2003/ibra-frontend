import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Power, Pencil, PlugZap, RefreshCw } from 'lucide-react';
import apiClient from '../../services/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import useAuthStore from '../../store/useAuthStore';
import { formatDateTime, formatNumber } from '../../utils/intl';

const defaultForm = {
  supplierName: '',
  supplierCode: '',
  supplierType: 'api',
  baseUrl: '',
  authType: 'none',
  apiKey: '',
  apiSecret: '',
  bearerToken: '',
  username: '',
  password: '',
  customHeadersText: '',
  timeoutMs: 8000,
  webhookUrl: '',
  webhookSecret: '',
  placeOrderEndpoint: '/orders/create',
  checkOrderStatusEndpoint: '/orders/status',
  getBalanceEndpoint: '/balance',
  getProductsEndpoint: '/products',
  cancelOrderEndpoint: '/orders/cancel',
  requestMethod: 'POST',
  payloadFormat: 'json',
  responseFormat: 'json',
  successKeyPath: 'success',
  externalOrderIdPath: 'data.orderId',
  externalStatusPath: 'data.status',
  externalMessagePath: 'message',
  externalBalancePath: 'data.balance',
  productsPath: 'data.items',
  supplierFieldMappingsText: 'playerId:uid\nquantity:qty',
  isActive: true,
  enableAutoFulfillment: true,
  enableStatusSync: true,
  enableProductSync: false,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
};

const parseHeaders = (text) => String(text || '')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [key, ...rest] = line.split(':');
    return { key: String(key || '').trim(), value: rest.join(':').trim() };
  })
  .filter((row) => row.key);

const parseMappings = (text) => String(text || '')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [internalField, externalField] = line.split(':').map((v) => String(v || '').trim());
    return { internalField, externalField };
  })
  .filter((m) => m.internalField && m.externalField);

const glowInputClass = 'focus:ring-violet-500 focus:ring-offset-yellow-200 dark:focus:ring-offset-yellow-500/30';
const glowSelectClass = 'h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-yellow-200 dark:bg-gray-900 dark:border-gray-700 dark:focus:ring-offset-yellow-500/30';

const AdminSuppliers = () => {
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    try {
      const rows = await apiClient.suppliers.list();
      setSuppliers(Array.isArray(rows) ? rows : []);
    } catch (error) {
      addToast(error?.message || 'فشل تحميل الموردين', 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (suppliers || []).filter((s) => {
      const byTerm = !term
        || String(s.supplierName || '').toLowerCase().includes(term)
        || String(s.supplierCode || '').toLowerCase().includes(term)
        || String(s.baseUrl || '').toLowerCase().includes(term);
      const byStatus = statusFilter === 'all'
        ? true
        : (statusFilter === 'active' ? s.isActive : !s.isActive);
      return byTerm && byStatus;
    });
  }, [suppliers, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setIsOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      ...defaultForm,
      ...row,
      customHeadersText: (row.customHeaders || []).map((h) => `${h.key}:${h.value}`).join('\n'),
      supplierFieldMappingsText: (row.supplierFieldMappings || []).map((m) => `${m.internalField}:${m.externalField}`).join('\n'),
    });
    setIsOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      customHeaders: parseHeaders(form.customHeadersText),
      supplierFieldMappings: parseMappings(form.supplierFieldMappingsText),
      timeoutMs: Number(form.timeoutMs || 8000),
    };

    try {
      if (editing?.id) {
        await apiClient.suppliers.update(editing.id, payload, user);
        addToast('تم تعديل المورد', 'success');
      } else {
        await apiClient.suppliers.create(payload, user);
        addToast('تم إضافة المورد', 'success');
      }
      setIsOpen(false);
      await load();
    } catch (error) {
      addToast(error?.message || 'فشل حفظ المورد', 'error');
    }
  };

  const deactivate = async (row) => {
    try {
      await apiClient.suppliers.deactivate(row.id, user);
      addToast('تم تعطيل المورد', 'success');
      await load();
    } catch (error) {
      addToast(error?.message || 'فشل تعطيل المورد', 'error');
    }
  };

  const testConnection = async (row) => {
    try {
      const result = await apiClient.suppliers.testConnection(row.id, user);
      addToast(`نتيجة الاختبار: ${result.lastConnectionTestStatus}`, result.lastConnectionTestStatus === 'connected' ? 'success' : 'warning');
      await load();
    } catch (error) {
      addToast(error?.message || 'فشل اختبار الاتصال', 'error');
    }
  };

  const syncProducts = async (row) => {
    try {
      const items = await apiClient.suppliers.syncProducts(row.id, user);
      addToast(`تم جلب ${items.length} منتج من المورد`, 'success');
    } catch (error) {
      addToast(error?.message || 'فشل مزامنة المنتجات', 'error');
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الموردين</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> إضافة مورد جديد</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم المورد أو الكود أو الرابط..." variant="search" />
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-3"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((row) => (
          <article
            key={row.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 dark:text-white">{row.supplierName}</p>
                <p className="mt-1 text-xs text-gray-500">{row.supplierCode}</p>
              </div>
              <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'نشط' : 'غير نشط'}</Badge>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="break-all text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">الرابط:</span> {row.baseUrl || '-'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">نوع الربط:</span> {row.supplierType}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">الاتصال:</span>{' '}
                {row.lastConnectionTestStatus || 'لم يتم الاختبار'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">آخر اختبار:</span>{' '}
                {row.lastConnectionTestAt ? formatDateTime(row.lastConnectionTestAt, 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">منتجات مرتبطة:</span>{' '}
                {formatNumber(row.linkedProductsCount || 0, 'ar-EG')}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => testConnection(row)}><PlugZap className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => syncProducts(row)}><RefreshCw className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => openEdit(row)}><Pencil className="w-4 h-4" /></Button>
              <Button size="sm" variant="danger" onClick={() => deactivate(row)}><Power className="w-4 h-4" /></Button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block dark:border-gray-700 dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المورد</TableHead>
              <TableHead>نوع الربط</TableHead>
              <TableHead>الرابط الأساسي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الاتصال</TableHead>
              <TableHead>آخر اختبار</TableHead>
              <TableHead>منتجات مرتبطة</TableHead>
              <TableHead className="text-end">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-semibold">{row.supplierName}</div>
                  <div className="text-xs text-gray-500">{row.supplierCode}</div>
                </TableCell>
                <TableCell>{row.supplierType}</TableCell>
                <TableCell className="max-w-[220px] truncate">{row.baseUrl}</TableCell>
                <TableCell>
                  <Badge variant={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'نشط' : 'غير نشط'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={row.lastConnectionTestStatus === 'connected' ? 'success' : row.lastConnectionTestStatus === 'failed' ? 'danger' : 'warning'}>
                    {row.lastConnectionTestStatus || 'لم يتم الاختبار'}
                  </Badge>
                </TableCell>
                <TableCell>{row.lastConnectionTestAt ? formatDateTime(row.lastConnectionTestAt, 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-'}</TableCell>
                <TableCell>{formatNumber(row.linkedProductsCount || 0, 'ar-EG')}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => testConnection(row)}><PlugZap className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => syncProducts(row)}><RefreshCw className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(row)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="danger" onClick={() => deactivate(row)}><Power className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'تعديل مورد' : 'إضافة مورد جديد'} size="xl">
        <form onSubmit={submit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          <div className="rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2 text-sm text-violet-900 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-200">
            تم ترك الحقول الضرورية فقط لإضافة مورد بسرعة. يمكنك تعديل باقي الإعدادات لاحقًا من شاشة التعديل.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="اسم المورد"
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              className={glowInputClass}
              required
            />
            <Input
              label="كود المورد"
              value={form.supplierCode}
              onChange={(e) => setForm({ ...form, supplierCode: e.target.value })}
              className={glowInputClass}
              required
            />
            <Input
              label="رابط الـ API الأساسي"
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              className={`md:col-span-2 ${glowInputClass}`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className={glowSelectClass}
              value={form.supplierType}
              onChange={(e) => setForm({ ...form, supplierType: e.target.value })}
            >
              <option value="api">API (واجهة برمجة)</option>
              <option value="manual">يدوي</option>
              <option value="hybrid">مختلط</option>
            </select>
            <select
              className={glowSelectClass}
              value={form.authType}
              onChange={(e) => setForm({ ...form, authType: e.target.value })}
            >
              <option value="none">بدون توثيق</option>
              <option value="api_key">مفتاح API</option>
              <option value="bearer_token">توكن Bearer</option>
              <option value="basic_auth">اسم مستخدم وكلمة مرور</option>
            </select>
          </div>

          {form.authType === 'api_key' && (
            <Input
              label="مفتاح API"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              className={glowInputClass}
            />
          )}

          {form.authType === 'bearer_token' && (
            <Input
              label="توكن Bearer"
              type="password"
              value={form.bearerToken}
              onChange={(e) => setForm({ ...form, bearerToken: e.target.value })}
              className={glowInputClass}
            />
          )}

          {form.authType === 'basic_auth' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="اسم المستخدم"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={glowInputClass}
              />
              <Input
                label="كلمة المرور"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={glowInputClass}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              المورد نشط
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.enableAutoFulfillment)} onChange={(e) => setForm({ ...form, enableAutoFulfillment: e.target.checked })} />
              تفعيل التنفيذ التلقائي
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="focus:ring-violet-500 focus:ring-offset-yellow-200"
              onClick={() => setIsOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-yellow-400 text-black hover:from-violet-700 hover:to-yellow-500 focus:ring-violet-500 focus:ring-offset-yellow-200 shadow-[0_0_18px_rgba(168,85,247,0.45)]"
            >
              حفظ المورد
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSuppliers;
