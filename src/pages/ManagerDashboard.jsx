import React, { useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';
import useTopupStore from '../store/useTopupStore';
import { formatDate, formatNumber } from '../utils/intl';

const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const { orders, loadOrders } = useOrderStore();
  const { topups, loadTopups } = useTopupStore();

  useEffect(() => {
    loadOrders();
    loadTopups();
  }, [loadOrders, loadTopups]);

  const latestTopups = [...(topups || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  const latestOrders = [...(orders || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة المانجر</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          أهلاً {user?.name}، يمكنك متابعة أحدث السجلات التشغيلية فقط.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">سجلات المدفوعات</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latestTopups.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDate(t.createdAt, 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                <TableCell>{t.userName || t.userId}</TableCell>
                <TableCell>{formatNumber(t.requestedCoins || t.amount, 'ar-EG')}</TableCell>
                <TableCell>
                  <Badge variant={t.status === 'approved' || t.status === 'completed' ? 'success' : t.status === 'rejected' ? 'danger' : 'warning'}>
                    {t.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">سجلات الاشتراكات والطلبات</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>المورد</TableHead>
              <TableHead>المرجع الخارجي</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latestOrders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{formatDate(o.createdAt, 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                <TableCell>{o.productName || o.productId}</TableCell>
                <TableCell>{o.userName || o.userId}</TableCell>
                <TableCell>{o.supplierName || '-'}</TableCell>
                <TableCell>{o.externalOrderId || '-'}</TableCell>
                <TableCell>
                  <Badge variant={o.status === 'completed' ? 'success' : o.status === 'rejected' ? 'danger' : 'warning'}>
                    {o.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
