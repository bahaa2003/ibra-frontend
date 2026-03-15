import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockOrders } from '../data/mockData';
import apiClient from '../services/client';
import useNotificationStore from './useNotificationStore';
import useAuthStore from './useAuthStore';
import useAdminStore from './useAdminStore';

const useOrderStore = create(
  persist(
    (set, get) => ({
      // =====================================================================================
      // FINANCIAL SNAPSHOT SYSTEM - CRITICAL BUSINESS LOGIC
      // =====================================================================================
      // Each order gets a FINANCIAL SNAPSHOT at creation time that includes:
      // - originalCurrency: User's currency at order time
      // - originalAmount: Price in coins at order time
      // - exchangeRateAtExecution: Exchange rate at order creation
      // - pricingSnapshot: Complete pricing context (base price, discounts, etc.)
      //
      // This ensures orders maintain their prices even if product prices or
      // exchange rates change after order creation.
      // =====================================================================================
      orders: mockOrders,

      loadOrders: async (userId) => {
        try {
          const orders = await apiClient.orders.list(userId);
          set({ orders: Array.isArray(orders) ? orders : mockOrders });
        } catch (_error) {
          set({ orders: mockOrders });
        }
      },
      
      addOrder: async (order) => {
        // Get current pricing and exchange rates for financial snapshot
        const currencies = await apiClient.system.currencies().catch(() => []);
        const products = await apiClient.products.list().catch(() => []);
        
        const product = products.find(p => p.id === order.productId);
        const currencyCode = String(order.currencyCode || 'USD').toUpperCase();
        const userCurrency = currencies.find(c => String(c.code || '').toUpperCase() === currencyCode) || { code: currencyCode, rate: 1 };
        
        // Calculate pricing snapshot
        const basePrice = Number(order.unitPriceBase || product?.basePriceCoins || product?.price || 0);
        const groupDiscount = 0; // TODO: Get from user group
        const unitPriceInAccountCurrency = Number(order.unitPrice || basePrice);
        const quantity = Number(order.quantity || 1);
        const finalPrice = Number(order.priceCoins || (unitPriceInAccountCurrency * quantity));
        
        const orderWithSnapshot = {
          ...order,
          financialSnapshot: {
            originalCurrency: userCurrency.code,
            originalAmount: basePrice,
            exchangeRateAtExecution: Number(order.exchangeRateAtExecution || userCurrency.rate || 1),
            convertedAmountAtExecution: finalPrice,
            finalAmountAtExecution: finalPrice,
            pricingSnapshot: {
              basePrice: basePrice,
              groupDiscount: groupDiscount,
              unitPrice: unitPriceInAccountCurrency,
              finalPrice: finalPrice,
              currency: userCurrency.code
            },
            feesSnapshot: {
              processingFee: 0,
              serviceFee: 0,
              totalFees: 0
            }
          }
        };

        const created = await apiClient.orders.create(orderWithSnapshot);
        const nextOrder = created?.order || created || orderWithSnapshot;
        set(state => ({
          orders: [nextOrder, ...state.orders]
        }));

        useNotificationStore.getState().addNotification({
          title: 'طلب جديد',
          message: `تم إنشاء طلب جديد بواسطة ${nextOrder?.userName || nextOrder?.userId || 'عميل'}`,
          type: 'info',
        });

        return created || { order: nextOrder };
      },

      updateOrderStatus: async (id, status) => {
        const target = (get().orders || []).find((o) => o.id === id);
        if (!target) return;

        await apiClient.orders.updateStatus(id, status);
        set(state => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
        }));

        // Deduct balance when order is completed
        if (status === 'completed' && target.financialSnapshot) {
          const { users } = useAdminStore.getState();
          const targetUser = users.find(u => u.id === target.userId);
          
          if (targetUser) {
            const currentCoins = Number(targetUser.coins || 0);
            const orderAmount = Number(target.financialSnapshot.finalAmountAtExecution || 0);
            const newBalance = Math.max(0, currentCoins - orderAmount); // Prevent negative balance
            
            // Update user in admin store
            useAdminStore.getState().updateUser(targetUser.id, { coins: newBalance });
            
            // Update current session if it's the logged-in user
            const { user: currentUser } = useAuthStore.getState();
            if (currentUser && currentUser.id === targetUser.id) {
              useAuthStore.getState().updateUserSession({ coins: newBalance });
            }
          }
        }

        if (status === 'approved' || status === 'completed') {
          useNotificationStore.getState().addNotification({
            title: 'قبول طلب',
            message: `تم قبول الطلب ${target?.id || id}`,
            type: 'success',
          });
        } else if (status === 'rejected' || status === 'denied') {
          useNotificationStore.getState().addNotification({
            title: 'رفض طلب',
            message: `تم رفض الطلب ${target?.id || id}`,
            type: 'warning',
          });
        }
      },

      syncOrderSupplierStatus: async (id, actor) => {
        const synced = await apiClient.orders.syncSupplierStatus(id, actor || null);
        if (!synced) return null;
        set((state) => ({
          orders: (state.orders || []).map((o) => (o.id === id ? { ...o, ...synced } : o)),
        }));
        return synced;
      }
    }),
    {
      name: 'orders-storage',
    }
  )
);

export default useOrderStore;
