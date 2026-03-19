import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockOrders } from '../data/mockData';
import apiClient from '../services/client';
import useNotificationStore from './useNotificationStore';
import useAuthStore from './useAuthStore';
import useAdminStore from './useAdminStore';

<<<<<<< HEAD
const ORDERS_CACHE_TTL = 60 * 1000;
let ordersRequest = null;
let ordersRequestScope = '';

=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
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
<<<<<<< HEAD
      ordersLastLoadedAt: 0,
      ordersLastLoadedScope: '',

      loadOrders: async (userId, { force = false } = {}) => {
        const scope = userId ? `user:${userId}` : 'all';
        const { orders, ordersLastLoadedAt, ordersLastLoadedScope } = get();
        const hasOrders = Array.isArray(orders) && orders.length > 0;
        const hasFreshOrders = (
          hasOrders
          && ordersLastLoadedScope === scope
          && (Date.now() - Number(ordersLastLoadedAt || 0) < ORDERS_CACHE_TTL)
        );

        if (!force && hasFreshOrders) {
          return orders;
        }

        if (ordersRequest && ordersRequestScope === scope) {
          return ordersRequest;
        }

        ordersRequestScope = scope;
        ordersRequest = apiClient.orders.list(userId)
          .then((items) => {
            const nextOrders = Array.isArray(items) ? items : mockOrders;
            set({
              orders: nextOrders,
              ordersLastLoadedAt: Date.now(),
              ordersLastLoadedScope: scope,
            });
            return nextOrders;
          })
          .catch((_error) => {
            if (!hasOrders || ordersLastLoadedScope !== scope) {
              const fallbackOrders = userId
                ? mockOrders.filter((entry) => entry.userId === userId)
                : mockOrders;

              set({
                orders: fallbackOrders,
                ordersLastLoadedScope: scope,
              });
            }
            return get().orders;
          })
          .finally(() => {
            ordersRequest = null;
            ordersRequestScope = '';
          });

        return ordersRequest;
=======

      loadOrders: async (userId) => {
        try {
          const orders = await apiClient.orders.list(userId);
          set({ orders: Array.isArray(orders) ? orders : mockOrders });
        } catch (_error) {
          set({ orders: mockOrders });
        }
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      },
      
      addOrder: async (order) => {
        const orderFieldsValues = order?.orderFieldsValues || order?.orderFields || {};
        const playerId = String(
          order?.playerId ||
          orderFieldsValues?.playerId ||
          orderFieldsValues?.uid ||
          ''
        ).trim();

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
          playerId,
          orderFields: orderFieldsValues,
          orderFieldsValues,
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
<<<<<<< HEAD
          orders: [nextOrder, ...state.orders],
          ordersLastLoadedAt: Date.now(),
          ordersLastLoadedScope: state.ordersLastLoadedScope || `user:${nextOrder.userId}`,
=======
          orders: [nextOrder, ...state.orders]
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
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

<<<<<<< HEAD
        const updated = await apiClient.orders.updateStatus(id, status);
        const nextOrder = updated || { ...target, status };
        set(state => ({
          orders: state.orders.map((o) => (
            o.id === id
              ? { ...o, ...nextOrder, status: nextOrder.status || status }
              : o
          )),
          ordersLastLoadedAt: Date.now(),
=======
        await apiClient.orders.updateStatus(id, status);
        set(state => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
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
<<<<<<< HEAD
            useAdminStore.setState((state) => ({
              users: (state.users || []).map((user) => (
                user.id === targetUser.id ? { ...user, coins: newBalance } : user
              )),
            }));
=======
            useAdminStore.getState().updateUser(targetUser.id, { coins: newBalance });
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            
            // Update current session if it's the logged-in user
            const { user: currentUser } = useAuthStore.getState();
            if (currentUser && currentUser.id === targetUser.id) {
              useAuthStore.getState().updateUserSession({ coins: newBalance });
            }
          }
        }

<<<<<<< HEAD
        if (useAdminStore.getState().loadUsers) {
          await useAdminStore.getState().loadUsers();
        }

        if (useAuthStore.getState().refreshProfile) {
          await useAuthStore.getState().refreshProfile();
        }

=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
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
<<<<<<< HEAD

        return nextOrder;
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      },

      syncOrderSupplierStatus: async (id, actor) => {
        const synced = await apiClient.orders.syncSupplierStatus(id, actor || null);
        if (!synced) return null;
        set((state) => ({
          orders: (state.orders || []).map((o) => (o.id === id ? { ...o, ...synced } : o)),
<<<<<<< HEAD
          ordersLastLoadedAt: Date.now(),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
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
