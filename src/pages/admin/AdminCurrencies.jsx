import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  Globe2,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import useSystemStore from '../../store/useSystemStore';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { formatNumber } from '../../utils/intl';

const defaultForm = { code: '', name: '', symbol: '', rate: '1' };

const formatRate = (rate) => {
  const value = Number(rate);
  if (!Number.isFinite(value)) return rate || '-';
  return formatNumber(value, 'ar-EG', {
    maximumFractionDigits: 4,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
};

const AdminCurrencies = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const {
    currencies,
    loadCurrencies,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    isLoadingCurrencies,
  } = useSystemStore();

  const [form, setForm] = useState(defaultForm);
  const [editingCode, setEditingCode] = useState('');
  const [originalRate, setOriginalRate] = useState(null);
  const [applyDebtAdjustment, setApplyDebtAdjustment] = useState(false);
  const [catalogCurrencies, setCatalogCurrencies] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');

  const rateChangePercent = useMemo(() => {
    if (!editingCode || originalRate === null || originalRate <= 0) return null;
    const newRate = Number(form.rate);
    if (Number.isNaN(newRate) || newRate <= 0 || newRate === originalRate) return null;
    return ((newRate - originalRate) / originalRate) * 100;
  }, [editingCode, originalRate, form.rate]);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  useEffect(() => {
    let isMounted = true;

    const loadCatalogCurrencies = async () => {
      setCatalogLoading(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
        if (!response.ok) throw new Error('فشل جلب كتالوج العملات');
        const rows = await response.json();
        const map = new Map();

        (Array.isArray(rows) ? rows : []).forEach((country) => {
          const countryName = country?.name?.common || 'غير معروف';
          Object.entries(country?.currencies || {}).forEach(([code, info]) => {
            const normalizedCode = String(code || '').toUpperCase();
            if (!normalizedCode) return;

            const existing = map.get(normalizedCode);
            if (!existing) {
              map.set(normalizedCode, {
                code: normalizedCode,
                name: info?.name || normalizedCode,
                symbol: info?.symbol || normalizedCode,
                countries: [countryName],
              });
            } else {
              existing.countries.push(countryName);
            }
          });
        });

        const list = Array.from(map.values())
          .map((item) => ({ ...item, countries: Array.from(new Set(item.countries)) }))
          .sort((a, b) => a.code.localeCompare(b.code));

        if (isMounted) setCatalogCurrencies(list);
      } catch (_error) {
        if (isMounted) setCatalogCurrencies([]);
      } finally {
        if (isMounted) setCatalogLoading(false);
      }
    };

    loadCatalogCurrencies();

    return () => {
      isMounted = false;
    };
  }, []);

  const existingCodes = useMemo(
    () => new Set((currencies || []).map((item) => String(item.code || '').toUpperCase())),
    [currencies]
  );

  const selectableCatalogCurrencies = useMemo(
    () => catalogCurrencies.filter((item) => !existingCodes.has(item.code)),
    [catalogCurrencies, existingCodes]
  );

  const filteredCurrencies = useMemo(() => {
    const term = currencySearch.trim().toLowerCase();
    if (!term) return currencies || [];

    return (currencies || []).filter((item) => (
      String(item.code || '').toLowerCase().includes(term)
      || String(item.name || '').toLowerCase().includes(term)
      || String(item.symbol || '').toLowerCase().includes(term)
    ));
  }, [currencies, currencySearch]);

  const baseCurrency = useMemo(
    () => (currencies || []).find((item) => String(item.code || '').toUpperCase() === 'USD') || null,
    [currencies]
  );

  const highestRateCurrency = useMemo(() => (
    [...(currencies || [])].sort((a, b) => Number(b.rate || 0) - Number(a.rate || 0))[0] || null
  ), [currencies]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingCode('');
    setOriginalRate(null);
    setApplyDebtAdjustment(false);
    setSelectedCatalogCode('');
  };

  const handleCatalogPick = (code) => {
    setSelectedCatalogCode(code);
    if (!code || editingCode) return;

    const selected = selectableCatalogCurrencies.find((item) => item.code === code);
    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      code: selected.code,
      name: selected.name,
      symbol: selected.symbol,
    }));
  };

  const validateForm = () => {
    if (!form.code.trim() || !form.name.trim() || !form.symbol.trim()) {
      addToast('يرجى تعبئة جميع الحقول', 'error');
      return false;
    }

    const rate = Number(form.rate);
    if (Number.isNaN(rate) || rate <= 0) {
      addToast('سعر الصرف يجب أن يكون رقمًا موجبًا', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      symbol: form.symbol.trim(),
      rate: Number(form.rate),
    };

    if (editingCode && applyDebtAdjustment && rateChangePercent !== null) {
      payload.applyDebtAdjustment = true;
    }

    try {
      if (editingCode) {
        const result = await updateCurrency(editingCode, payload, user);
        if (result?.debtAdjustment) {
          addToast(
            `تم تحديث العملة وتعديل ديون ${result.debtAdjustment.usersAdjusted} مستخدم (${Math.abs(rateChangePercent).toFixed(2)}%)`,
            'success'
          );
        } else {
          addToast('تم تحديث العملة', 'success');
        }
      } else {
        await addCurrency(payload, user);
        addToast('تمت إضافة العملة', 'success');
      }
      resetForm();
    } catch (error) {
      addToast(error?.message || 'فشل حفظ العملة', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingCode(item.code);
    setOriginalRate(Number(item.rate));
    setApplyDebtAdjustment(false);
    setSelectedCatalogCode('');
    setForm({
      code: item.code,
      name: item.name,
      symbol: item.symbol,
      rate: String(item.rate),
    });
  };

  const handleDelete = async (code) => {
    const ok = window.confirm(`هل تريد حذف العملة ${code}؟`);
    if (!ok) return;

    try {
      await deleteCurrency(code, user);
      addToast('تم حذف العملة', 'success');
      if (editingCode === code) resetForm();
    } catch (error) {
      addToast(error?.message || 'فشل حذف العملة', 'error');
    }
  };

  const statCards = [
    {
      label: 'العملات المفعلة',
      value: currencies?.length || 0,
      icon: Banknote,
      helper: 'المستخدمة داخل النظام',
    },
    {
      label: 'متاح للإضافة',
      value: catalogLoading ? '...' : selectableCatalogCurrencies.length,
      icon: Globe2,
      helper: `من أصل ${catalogCurrencies.length || 0} في الكتالوج`,
    },
    {
      label: 'العملة الأساسية',
      value: baseCurrency?.code || 'USD',
      icon: BadgeDollarSign,
      helper: baseCurrency ? `1 ${baseCurrency.code} = ${formatRate(baseCurrency.rate)}` : 'غير مضافة بعد',
    },
    {
      label: 'أعلى سعر صرف',
      value: highestRateCurrency?.code || '-',
      icon: RefreshCw,
      helper: highestRateCurrency ? formatRate(highestRateCurrency.rate) : 'لا توجد بيانات',
    },
  ];

  return (
    <div dir="rtl" className="min-w-0 space-y-6">
      <section className="admin-premium-panel p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2.5 py-1 text-[10px] font-black text-[var(--color-primary)]">
              إعدادات مالية
            </span>
            <h1 className="mt-2 flex items-center gap-2 text-xl font-black text-[var(--color-text)] sm:text-2xl">
              <Banknote className="h-5 w-5 text-[var(--color-primary)]" />
              إدارة العملات
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--color-text-secondary)]">
              أضف العملات واضبط سعر الصرف. الكتالوج يملأ الاسم والرمز تلقائيًا.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:min-w-[34rem]">
            {statCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.62)] px-2.5 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span className="text-base font-black leading-none text-[var(--color-text)]">{item.value}</span>
                  </div>
                  <div className="mt-1.5 truncate text-[11px] font-black text-[var(--color-text)]">{item.label}</div>
                  <div className="mt-0.5 truncate text-[10px] font-semibold text-[var(--color-text-secondary)]">{item.helper}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[26rem_1fr]">
        <section className="admin-premium-panel p-4 sm:p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[var(--color-text)]">
                {editingCode ? `تعديل ${editingCode}` : 'إضافة عملة'}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                استخدم الكتالوج للتعبئة السريعة أو اكتب البيانات يدويًا.
              </p>
            </div>
            {editingCode && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.82)] text-[var(--color-muted)] transition-colors hover:text-[var(--color-error)]"
                aria-label="إلغاء التعديل"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mb-4 rounded-2xl border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.07)] p-3">
            <label className="mb-2 flex items-center gap-2 text-xs font-black text-[var(--color-text)]">
              <Globe2 className="h-4 w-4 text-[var(--color-primary)]" />
              كتالوج العملات العالمي
            </label>
            <select
              value={selectedCatalogCode}
              onChange={(event) => handleCatalogPick(event.target.value)}
              disabled={catalogLoading || Boolean(editingCode)}
              className="h-11 w-full rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.94)] px-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-[color:rgb(var(--color-primary-rgb)/0.45)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <option value="">
                {catalogLoading ? 'جاري تحميل العملات...' : 'اختر عملة لتعبئة الحقول'}
              </option>
              {selectableCatalogCurrencies.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} - {item.name} ({item.symbol})
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">
              {catalogLoading
                ? 'بنجهز قائمة العملات العالمية.'
                : `إجمالي الكتالوج: ${catalogCurrencies.length} | المتاح للإضافة: ${selectableCatalogCurrencies.length}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="رمز العملة"
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                placeholder="USD"
                disabled={Boolean(editingCode)}
              />
              <Input
                label="الرمز المختصر"
                value={form.symbol}
                onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))}
                placeholder="$"
              />
            </div>

            <Input
              label="اسم العملة"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="دولار أمريكي"
            />

            <Input
              label="سعر الصرف"
              type="number"
              step="0.0001"
              min="0.0001"
              value={form.rate}
              onChange={(event) => setForm((prev) => ({ ...prev, rate: event.target.value }))}
              placeholder="1"
              suffix={<span className="text-xs font-bold">مقابل USD</span>}
            />

            {editingCode && rateChangePercent !== null && editingCode !== 'USD' && (
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all ${
                  rateChangePercent > 0
                    ? 'border-[color:rgb(var(--color-warning-rgb)/0.35)] bg-[color:rgb(var(--color-warning-rgb)/0.1)]'
                    : 'border-[color:rgb(var(--color-success-rgb)/0.35)] bg-[color:rgb(var(--color-success-rgb)/0.1)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={applyDebtAdjustment}
                  onChange={(event) => setApplyDebtAdjustment(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[color:rgb(var(--color-border-rgb)/0.9)]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-black text-[var(--color-text)]">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    تغيير سعر الصرف بنسبة {Math.abs(rateChangePercent).toFixed(2)}%
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                    عند التفعيل سيتم تطبيق التغيير على الأرصدة السالبة للمستخدمين. السعر القديم {originalRate} والجديد {form.rate}.
                  </p>
                </div>
              </label>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="sm:flex-1">
                <PlusCircle className="h-4 w-4" />
                {editingCode ? 'تحديث العملة' : 'إضافة عملة'}
              </Button>
              {editingCode && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-premium-panel overflow-hidden">
          <div className="border-b border-[color:rgb(var(--color-border-rgb)/0.76)] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-[var(--color-text)]">العملات المضافة</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                  راجع أسعار الصرف وعدل أي عملة من نفس القائمة.
                </p>
              </div>
              <div className="w-full lg:w-80">
                <Input
                  placeholder="بحث بالرمز أو الاسم..."
                  value={currencySearch}
                  onChange={(event) => setCurrencySearch(event.target.value)}
                  icon={<Search className="h-4 w-4" />}
                  variant="search"
                />
              </div>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[44rem] border-collapse">
              <thead>
                <tr className="border-b border-[color:rgb(var(--color-border-rgb)/0.76)] text-xs font-black text-[var(--color-text-secondary)]">
                  <th className="px-5 py-3 text-right">العملة</th>
                  <th className="px-5 py-3 text-right">الاسم</th>
                  <th className="px-5 py-3 text-center">الرمز</th>
                  <th className="px-5 py-3 text-center">سعر الصرف</th>
                  <th className="px-5 py-3 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrencies.map((item) => {
                  const isBase = String(item.code || '').toUpperCase() === 'USD';
                  const isEditing = editingCode === item.code;

                  return (
                    <tr
                      key={item.code}
                      className={`border-b border-[color:rgb(var(--color-border-rgb)/0.52)] transition-colors hover:bg-[color:rgb(var(--color-primary-rgb)/0.05)] ${
                        isEditing ? 'bg-[color:rgb(var(--color-primary-rgb)/0.08)]' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-sm font-black text-[var(--color-primary)]">
                            {item.code}
                          </span>
                          <div>
                            <div className="font-black text-[var(--color-text)]">{item.code}</div>
                            {isBase && <Badge variant="success" className="mt-1">أساسية</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">{item.name}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.8)] px-3 py-1 text-sm font-black text-[var(--color-text)]">
                          {item.symbol}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="text-sm font-black text-[var(--color-text)]">{formatRate(item.rate)}</div>
                        <div className="mt-1 text-[11px] font-semibold text-[var(--color-muted)]">1 USD</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleEdit(item)} aria-label={`تعديل ${item.code}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="danger"
                            onClick={() => handleDelete(item.code)}
                            disabled={isBase}
                            aria-label={`حذف ${item.code}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {filteredCurrencies.map((item) => {
              const isBase = String(item.code || '').toUpperCase() === 'USD';
              return (
                <article key={item.code} className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-[var(--color-text)]">{item.code}</span>
                        {isBase && <Badge variant="success">أساسية</Badge>}
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-[var(--color-text-secondary)]">{item.name}</p>
                    </div>
                    <span className="rounded-full border border-[color:rgb(var(--color-border-rgb)/0.82)] px-3 py-1 text-sm font-black text-[var(--color-text)]">
                      {item.symbol}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[color:rgb(var(--color-border-rgb)/0.2)] px-3 py-2">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">سعر الصرف</span>
                    <span className="text-sm font-black text-[var(--color-text)]">{formatRate(item.rate)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(item.code)} disabled={isBase}>
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {!isLoadingCurrencies && filteredCurrencies.length === 0 && (
            <div className="px-5 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-black text-[var(--color-text)]">لا توجد عملات مطابقة</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)]">
                غيّر البحث أو أضف عملة جديدة من اللوحة الجانبية.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminCurrencies;
