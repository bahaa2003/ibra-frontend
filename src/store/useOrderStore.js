import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockOrders } from '../data/mockData';
import apiClient from '../services/client';
import useNotificationStore from './useNotificationStore';
import useAuthStore from './useAuthStore';
import useAdminStore from './useAdminStore';
import { getManualOrderStatusLabel, isManualStatusEditableOrder, normalizeManualOrderStatus } from '../utils/orders';

const dataProvider = (import.meta.env.VITE_DATA_PROVIDER || 'mock').toLowerCase();
const isRealProvider = dataProvider === 'real';
const fetchedOrderScopesThisSession = new Set();

const ORDERS_CACHE_TTL = 60 * 1000;
let ordersRequest = null;
let ordersRequestScope = '';

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
      ordersLastLoadedAt: 0,
      ordersLastLoadedScope: '',

      loadOrders: async (userId, { force = false } = {}) => {
        const scope = userId ? `user:${userId}` : 'all';
        const { orders, ordersLastLoadedAt, ordersLastLoadedScope } = get();
        const hasOrders = Array.isArray(orders) && orders.length > 0;
        const shouldBypassHydratedCache = isRealProvider && !fetchedOrderScopesThisSession.has(scope);
        const hasFreshOrders = (
          !shouldBypassHydratedCache
          && hasOrders
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

            if (isRealProvider) {
              fetchedOrderScopesThisSession.add(scope);
            }
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
      },

      getOrderById: async (orderId, userId = null) => {
        const normalizedOrderId = String(orderId || '').trim();
        if (!normalizedOrderId) return null;

        const fetchedOrder = await apiClient.orders.getById(normalizedOrderId, userId);
        if (!fetchedOrder) return null;

        set((state) => {
          const existingOrders = Array.isArray(state.orders) ? state.orders : [];
          const existingIndex = existingOrders.findIndex((entry) => entry.id === fetchedOrder.id);
          const nextOrders = existingIndex >= 0
            ? existingOrders.map((entry) => (entry.id === fetchedOrder.id ? { ...entry, ...fetchedOrder } : entry))
            : [fetchedOrder, ...existingOrders];

          return {
            orders: nextOrders,
            ordersLastLoadedAt: Date.now(),
            ordersLastLoadedScope: state.ordersLastLoadedScope || (userId ? `user:${userId}` : 'all'),
          };
        });

        return fetchedOrder;
      },
      
      addOrder: async (order) => {
        try {
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

          const product = products.find((p) => p.id === order.productId);
          const currencyCode = String(order.currencyCode || 'USD').toUpperCase();
          const userCurrency = currencies.find((c) => String(c.code || '').toUpperCase() === currencyCode) || { code: currencyCode, rate: 1 };

          // Calculate pricing snapshot
          const basePrice = Number(order.unitPriceBase || product?.basePriceCoins || product?.price || 0);
          const groupDiscount = 0; // TODO: Get from user group
          const unitPriceInAccountCurrency = Number(order.unitPrice || basePrice);
          const quantity = Number(order.quantity || 1);
          const finalPrice = Number(order.priceCoins || (unitPriceInAccountCurrency * quantity));

          if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
            const err = new Error('Invalid order amount');
            err.code = 'INVALID_ORDER_AMOUNT';
            throw err;
          }

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
                basePrice,
                groupDiscount,
                unitPrice: unitPriceInAccountCurrency,
                finalPrice,
                currency: userCurrency.code,
              },
              feesSnapshot: {
                processingFee: 0,
                serviceFee: 0,
                totalFees: 0,
              },
            },
          };

          const created = await apiClient.orders.create(orderWithSnapshot);
          const createdOrder = created?.order || created || {};
          const nextOrder = {
            ...orderWithSnapshot,
            ...createdOrder,
            orderFields: createdOrder?.orderFields || createdOrder?.orderFieldsValues || orderWithSnapshot.orderFields,
            orderFieldsValues: createdOrder?.orderFieldsValues || createdOrder?.orderFields || orderWithSnapshot.orderFieldsValues,
            customerInput: createdOrder?.customerInput || orderWithSnapshot.customerInput,
          };

          set((state) => ({
            orders: [nextOrder, ...state.orders],
            ordersLastLoadedAt: Date.now(),
            ordersLastLoadedScope: state.ordersLastLoadedScope || `user:${nextOrder.userId}`,
          }));

          useNotificationStore.getState().addNotification({
            title: 'طلب جديد',
            message: `تم إنشاء طلب جديد بواسطة ${nextOrder?.userName || nextOrder?.userId || 'عميل'}`,
            type: 'info',
          });

          return created || { order: nextOrder };
        } catch (err) {
          // Refetch products so the UI picks up the latest prices after a provider price jump.
          if (err?.code === 'PROVIDER_PRICE_INCREASED') {
            apiClient.products.list().catch(() => {});
            throw err;
          }

          throw err;
        }
      },

      updateOrderStatus: async (id, status, orderContext = null) => {
        const target = (get().orders || []).find((o) => o.id === id);
        const currentOrder = orderContext || target;
        if (!currentOrder) return;

        if (!isManualStatusEditableOrder(currentOrder)) {
          throw new Error('Direct status changes are only available for manual orders.');
        }

        const normalizedStatus = normalizeManualOrderStatus(status);
        const updated = await apiClient.orders.updateStatus(id, normalizedStatus, currentOrder);
        const nextOrder = updated || { ...currentOrder, status: normalizedStatus };
        set(state => ({
          orders: state.orders.map((o) => (
            o.id === id
              ? { ...o, ...nextOrder, status: nextOrder.status || normalizedStatus }
              : o
          )),
          ordersLastLoadedAt: Date.now(),
        }));

        if (useAdminStore.getState().loadUsers) {
          await useAdminStore.getState().loadUsers();
        }

        if (useAuthStore.getState().refreshProfile) {
          await useAuthStore.getState().refreshProfile();
        }

        if (normalizedStatus === 'completed') {
          useNotificationStore.getState().addNotification({
            title: 'قبول طلب',
            message: `تم قبول الطلب ${target?.id || id}`,
            type: 'success',
          });
        } else if (normalizedStatus === 'rejected') {
          useNotificationStore.getState().addNotification({
            title: 'رفض طلب',
            message: `تم رفض الطلب ${target?.id || id}`,
            type: 'warning',
          });
        } else {
          useNotificationStore.getState().addNotification({
            title: 'تحديث حالة الطلب',
            message: `تم تحديث الطلب ${target?.id || id} إلى ${getManualOrderStatusLabel(normalizedStatus)}`,
            type: 'info',
          });
        }

        return nextOrder;
      },

      syncOrderSupplierStatus: async (id, actor) => {
        const synced = await apiClient.orders.syncSupplierStatus(id, actor || null);
        if (!synced) return null;
        set((state) => ({
          orders: (state.orders || []).map((o) => (o.id === id ? { ...o, ...synced } : o)),
          ordersLastLoadedAt: Date.now(),
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
