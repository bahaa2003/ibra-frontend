import React, { useEffect, useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import useTopupStore from '../../store/useTopupStore';
import useAuthStore from '../../store/useAuthStore';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useLanguage } from '../../context/LanguageContext';

const AdminTopups = () => {
  const { topups, loadTopups, updateTopupStatus } = useTopupStore();
  const { user: actor } = useAuthStore();
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [amount, setAmount] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsTopup, setDetailsTopup] = useState(null);

  useEffect(() => {
    loadTopups();
  }, [loadTopups]);

  const handleApproveClick = (topup) => {
    setSelectedTopup(topup);
    setAmount(topup.requestedCoins.toString());
    setIsModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedTopup) return;
    
    const finalAmount = parseInt(amount, 10);
    if (!finalAmount || finalAmount <= 0) {
      addToast('المبلغ غير صالح', 'error');
      return;
    }
    
    await updateTopupStatus(selectedTopup.id, 'approved', {
      actualPaidAmount: finalAmount,
      currencyCode: selectedTopup.currencyCode || 'USD',
      adminNote: '',
    });
    
    addToast(`${t('approve')} ${finalAmount} ${t('coins')}`, 'success');
    setIsModalOpen(false);
  };

  const handleReject = (id) => {
    if (window.confirm(t('deleteConfirm') || 'هل تريد رفض الطلب؟')) {
      updateTopupStatus(id, 'rejected');
      addToast(t('reject'), 'info');
    }
  };

  const handleViewDetails = (topup) => {
    setDetailsTopup(topup);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('topupRequests')}</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('date')}</TableHead>
              <TableHead className="text-center">{t('users')}</TableHead>
              <TableHead className="text-center">{t('amount')}</TableHead>
              <TableHead className="text-center">{t('status')}</TableHead>
              <TableHead className="text-end">{t('actions') || 'الإجراءات'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topups.map((topup) => (
              <TableRow key={topup.id}>
                <TableCell>{new Date(topup.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">{topup.userName}</div>
                  <div className="text-xs text-gray-500">المعرف: {topup.userId}</div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium">
                    {topup.financialSnapshot 
                      ? `${topup.financialSnapshot.originalAmount} ${topup.financialSnapshot.originalCurrency}`
                      : topup.requestedAmount || topup.requestedCoins
                    }
                  </div>
                  {topup.financialSnapshot && (
                    <div className="text-xs text-gray-500">
                      → {topup.financialSnapshot.finalAmountAtExecution} coins
                    </div>
                  )}
                  {topup.type === 'game_topup' && topup.gameDetails && (
                    <div className="text-xs text-blue-600 font-medium">
                      🎮 {topup.gameDetails.gameName} - {topup.gameDetails.packageName}
                    </div>
                  )}
                  {topup.actualPaidAmount && topup.actualPaidAmount !== (topup.requestedAmount || topup.requestedCoins) && (
                    <div className="text-xs text-amber-600">
                      الفعلي: {topup.actualPaidAmount} {topup.currencyCode}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={
                       topup.status === 'approved' ? 'success' : 
                       topup.status === 'rejected' ? 'danger' : 'warning'
                    }
                  >
                   {t(`status_${topup.status}`) || topup.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(topup)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {topup.status === 'pending' && topup.type !== 'game_topup' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="success" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApproveClick(topup)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleReject(topup.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {topup.status === 'pending' && topup.type === 'game_topup' && (
                      <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                        تلقائي
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('topupRequests') || "اعتماد طلب شحن"}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleConfirmApprove}>{t('confirm')}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
             {t('approve')} <strong>{selectedTopup?.userName}</strong>.
          </p>
          <Input 
            label={t('coins')}
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={t('topupDetails') || "تفاصيل الشحنة"}
        size="lg"
      >
        {detailsTopup && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('user')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{detailsTopup.userName}</p>
                <p className="text-sm text-gray-500">المعرف: {detailsTopup.userId}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('date')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(detailsTopup.createdAt).toLocaleDateString()} {new Date(detailsTopup.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('amount')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {detailsTopup.financialSnapshot 
                    ? `${detailsTopup.financialSnapshot.originalAmount} ${detailsTopup.financialSnapshot.originalCurrency}`
                    : detailsTopup.requestedAmount || detailsTopup.requestedCoins
                  }
                </p>
                {detailsTopup.financialSnapshot && (
                  <p className="text-sm text-gray-500">
                    → {detailsTopup.financialSnapshot.finalAmountAtExecution} coins
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('status')}</h3>
                <Badge 
                  variant={
                     detailsTopup.status === 'approved' ? 'success' : 
                     detailsTopup.status === 'rejected' ? 'danger' : 'warning'
                  }
                >
                 {t(`status_${detailsTopup.status}`) || detailsTopup.status}
                </Badge>
              </div>
            </div>

            {detailsTopup.paymentChannel && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('paymentMethod')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{detailsTopup.paymentChannel}</p>
              </div>
            )}

            {detailsTopup.senderWalletNumber && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('senderWallet')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{detailsTopup.senderWalletNumber}</p>
              </div>
            )}

            {detailsTopup.proofImage && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('proofOfPayment')}</h3>
                <img 
                  src={detailsTopup.proofImage} 
                  alt="Proof of payment" 
                  className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}

            {detailsTopup.financialSnapshot && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('financialDetails')}</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('exchangeRate')}:</span>
                    <span className="font-medium">1 {detailsTopup.financialSnapshot.originalCurrency} = {detailsTopup.financialSnapshot.exchangeRateAtExecution} coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('convertedAmount')}:</span>
                    <span className="font-medium">{detailsTopup.financialSnapshot.convertedAmountAtExecution} coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('finalAmount')}:</span>
                    <span className="font-medium">{detailsTopup.financialSnapshot.finalAmountAtExecution} coins</span>
                  </div>
                </div>
              </div>
            )}

            {detailsTopup.type === 'game_topup' && detailsTopup.gameDetails && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('gameDetails')}</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('gameName')}:</span>
                    <span className="font-medium">{detailsTopup.gameDetails.gameName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('gameId')}:</span>
                    <span className="font-medium">{detailsTopup.gameDetails.gameId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('package')}:</span>
                    <span className="font-medium">{detailsTopup.gameDetails.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('quantity')}:</span>
                    <span className="font-medium">{detailsTopup.gameDetails.quantity}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTopups;
