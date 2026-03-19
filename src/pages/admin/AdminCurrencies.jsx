import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import useSystemStore from '../../store/useSystemStore';
import useAuthStore from '../../store/useAuthStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';

const defaultForm = { code: '', name: '', symbol: '', rate: '1' };

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
  const [catalogCurrencies, setCatalogCurrencies] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState('');

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

        if (isMounted) {
          setCatalogCurrencies(list);
        }
      } catch (_error) {
        if (isMounted) {
          setCatalogCurrencies([]);
        }
      } finally {
        if (isMounted) {
          setCatalogLoading(false);
        }
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

  const resetForm = () => {
    setForm(defaultForm);
    setEditingCode('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      symbol: form.symbol.trim(),
      rate: Number(form.rate),
    };

    try {
      if (editingCode) {
        await updateCurrency(editingCode, payload, user);
        addToast('تم تحديث العملة', 'success');
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

  return (
    <div className="min-w-0 space-y-6">
      <section className="admin-premium-hero">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة العملات</h1>
      </section>

      <Card className="admin-premium-panel p-5">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              كتالوج العملات العالمي (REST Countries API)
            </label>
            <select
              value={selectedCatalogCode}
              onChange={(e) => handleCatalogPick(e.target.value)}
              disabled={catalogLoading || Boolean(editingCode)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">اختر عملة لتعبئة الحقول تلقائيًا</option>
              {selectableCatalogCurrencies.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} - {item.name} ({item.symbol})
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-end pb-2">
            {catalogLoading
              ? 'جاري تحميل العملات العالمية...'
              : `إجمالي العملات: ${catalogCurrencies.length} | المتاح للإضافة: ${selectableCatalogCurrencies.length}`}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            label="رمز العملة"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="USD"
            disabled={Boolean(editingCode)}
          />
          <Input
            label="اسم العملة"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="دولار أمريكي"
          />
          <Input
            label="Symbol"
            value={form.symbol}
            onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value }))}
            placeholder="$"
          />
          <Input
            label="سعر الصرف"
            type="number"
            step="0.0001"
            min="0.0001"
            value={form.rate}
            onChange={(e) => setForm((prev) => ({ ...prev, rate: e.target.value }))}
            placeholder="1"
          />

          <div className="md:col-span-4 flex gap-2">
            <Button type="submit">
              <PlusCircle className="w-4 h-4 mr-1" />
              {editingCode ? 'تحديث العملة' : 'إضافة عملة'}
            </Button>
            {editingCode && (
              <Button type="button" variant="ghost" onClick={resetForm}>إلغاء التعديل</Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="admin-premium-panel p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرمز</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الرمز</TableHead>
              <TableHead>سعر الصرف</TableHead>
              <TableHead className="text-end">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(currencies || []).map((item) => (
              <TableRow key={item.code}>
                <TableCell className="font-semibold">{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.symbol}</TableCell>
                <TableCell>{item.rate}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(item.code)}
                      disabled={item.code === 'USD'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!isLoadingCurrencies && (!currencies || currencies.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">لا توجد عملات</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminCurrencies;
