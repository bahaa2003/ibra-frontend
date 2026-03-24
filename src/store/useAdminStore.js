import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from '../data/mockData';
import apiClient from '../services/client';
import useNotificationStore from './useNotificationStore';
import { normalizeAccountStatus } from '../utils/accountStatus';
import { normalizeMoneyAmount } from '../utils/money';

const dataProvider = (import.meta.env.VITE_DATA_PROVIDER || 'mock').toLowerCase();
const isRealProvider = dataProvider === 'real';
let hasFetchedAdminUsersFromBackendThisSession = false;
let hasFetchedAdminWalletsFromBackendThisSession = false;

const USERS_CACHE_TTL = 90 * 1000;
const WALLETS_CACHE_TTL = 60 * 1000;
let usersRequest = null;
let walletsRequest = null;
const walletTransactionsRequests = new Map();

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractGroupIdentity = (groupInput) => {
  if (groupInput && typeof groupInput === 'object') {
    const groupId = String(groupInput.id || groupInput._id || groupInput.groupId || '').trim();
    const groupName = String(groupInput.name || groupInput.groupName || '').trim();
    return { groupId, groupName };
  }

  const raw = String(groupInput || '').trim();
  return { groupId: raw, groupName: '' };
};

const upsertUser = (users, nextUser) => {
  if (!nextUser?.id) return Array.isArray(users) ? users : [];
  const existingUsers = Array.isArray(users) ? users : [];
  const hasMatch = existingUsers.some((entry) => String(entry.id) === String(nextUser.id));

  return hasMatch
    ? existingUsers.map((entry) => (String(entry.id) === String(nextUser.id) ? { ...entry, ...nextUser } : entry))
    : [nextUser, ...existingUsers];
};

const upsertWallet = (wallets, nextWallet) => {
  const walletKey = String(nextWallet?.userId || nextWallet?.id || '').trim();
  if (!walletKey) return Array.isArray(wallets) ? wallets : [];

  const existingWallets = Array.isArray(wallets) ? wallets : [];
  const hasMatch = existingWallets.some((entry) => (
    String(entry?.userId || entry?.id || '').trim() === walletKey
  ));

  return hasMatch
    ? existingWallets.map((entry) => (
      String(entry?.userId || entry?.id || '').trim() === walletKey ? { ...entry, ...nextWallet } : entry
    ))
    : [nextWallet, ...existingWallets];
};

const mergeWalletIntoUsers = (users, wallet) => {
  const walletUserId = String(wallet?.userId || wallet?.id || '').trim();
  if (!walletUserId) return Array.isArray(users) ? users : [];

  return (Array.isArray(users) ? users : []).map((entry) => (
    String(entry?.id || '').trim() === walletUserId
      ? {
        ...entry,
        coins: toFiniteNumber(wallet?.walletBalance ?? wallet?.balance ?? entry?.coins, toFiniteNumber(entry?.coins, 0)),
        currency: wallet?.currency || entry?.currency || 'USD',
      }
      : entry
  ));
};

const buildWalletFromUser = (user, seed = {}) => {
  if (!user && !seed?.userId) return null;

  const recentTransactions = Array.isArray(seed?.recentTransactions) ? seed.recentTransactions : [];
  const balance = toFiniteNumber(seed?.walletBalance ?? seed?.balance ?? user?.coins, 0);

  return {
    ...seed,
    id: seed?.id || seed?.walletId || user?.id || seed?.userId,
    walletId: seed?.walletId || seed?.id || user?.id || seed?.userId,
    userId: String(seed?.userId || user?.id || ''),
    user: seed?.user || user || null,
    userName: seed?.userName || user?.name || '',
    userEmail: seed?.userEmail || user?.email || '',
    currency: String(seed?.currency || user?.currency || 'USD').toUpperCase(),
    walletBalance: balance,
    balance,
    recentTransactions,
    transactionsCount: toFiniteNumber(seed?.transactionsCount ?? recentTransactions.length, recentTransactions.length),
    lastTransactionAt: seed?.lastTransactionAt || recentTransactions[0]?.createdAt || null,
  };
};

const removeRecordKey = (record, keyToRemove) => {
  const nextRecord = { ...(record || {}) };
  delete nextRecord[keyToRemove];
  return nextRecord;
};

const useAdminStore = create(
  persist(
    (set, get) => ({
      users: mockUsers,
      usersLastLoadedAt: 0,
      isLoadingUsers: false,
      wallets: [],
      walletsLastLoadedAt: 0,
      userWalletTransactions: {},
      walletTransactionsLastLoadedAt: {},

      loadUsers: async ({ force = false } = {}) => {
        const { users, usersLastLoadedAt } = get();
        const hasUsers = Array.isArray(users) && users.length > 0;
        const shouldBypassHydratedCache = isRealProvider && !hasFetchedAdminUsersFromBackendThisSession;
        const hasFreshUsers = !shouldBypassHydratedCache
          && hasUsers
          && (Date.now() - Number(usersLastLoadedAt || 0) < USERS_CACHE_TTL);

        if (!force && hasFreshUsers) {
          return users;
        }

        if (usersRequest) {
          return usersRequest;
        }

        set({ isLoadingUsers: true });

        usersRequest = apiClient.users.list()
          .then((items) => {
            const nextUsers = Array.isArray(items) ? items : mockUsers;
            set({
              users: nextUsers,
              usersLastLoadedAt: Date.now(),
              isLoadingUsers: false,
            });

            if (isRealProvider) {
              hasFetchedAdminUsersFromBackendThisSession = true;
            }
            return nextUsers;
          })
          .catch((_error) => {
            if (!hasUsers) {
              set({ users: mockUsers });
            }
            set({ isLoadingUsers: false });
            return get().users;
          })
          .finally(() => {
            usersRequest = null;
          });

        return usersRequest;
      },

      getUserById: async (userId, { force = false } = {}) => {
        const normalizedUserId = String(userId || '').trim();
        if (!normalizedUserId) return null;

        const existingUser = (get().users || []).find((entry) => String(entry?.id) === normalizedUserId) || null;
        if (existingUser && !force) {
          return existingUser;
        }

        const fetchedUser = await apiClient.users.getById(normalizedUserId);
        if (!fetchedUser) {
          return existingUser;
        }

        set((state) => ({
          users: upsertUser(state.users, fetchedUser),
          usersLastLoadedAt: Date.now(),
        }));

        return fetchedUser;
      },

      loadWallets: async ({ force = false } = {}) => {
        const { wallets, walletsLastLoadedAt } = get();
        const hasWallets = Array.isArray(wallets) && wallets.length > 0;
        const shouldBypassHydratedCache = isRealProvider && !hasFetchedAdminWalletsFromBackendThisSession;
        const hasFreshWallets = !shouldBypassHydratedCache
          && hasWallets
          && (Date.now() - Number(walletsLastLoadedAt || 0) < WALLETS_CACHE_TTL);

        if (!force && hasFreshWallets) {
          return wallets;
        }

        if (walletsRequest) {
          return walletsRequest;
        }

        walletsRequest = Promise.resolve(apiClient.adminWallets?.list?.() || [])
          .then((items) => {
            const nextWallets = Array.isArray(items) ? items : [];
            set((state) => ({
              wallets: nextWallets,
              walletsLastLoadedAt: Date.now(),
              users: nextWallets.reduce((acc, wallet) => mergeWalletIntoUsers(acc, wallet), Array.isArray(state.users) ? state.users : []),
            }));

            if (isRealProvider) {
              hasFetchedAdminWalletsFromBackendThisSession = true;
            }
            return nextWallets;
          })
          .catch(async () => {
            const fallbackUsers = Array.isArray(get().users) && get().users.length
              ? get().users
              : await get().loadUsers({ force }).catch(() => get().users);
            const fallbackWallets = (Array.isArray(fallbackUsers) ? fallbackUsers : [])
              .map((entry) => buildWalletFromUser(entry))
              .filter(Boolean);

            set((state) => ({
              wallets: fallbackWallets,
              walletsLastLoadedAt: Date.now(),
              users: fallbackWallets.reduce((acc, wallet) => mergeWalletIntoUsers(acc, wallet), Array.isArray(state.users) ? state.users : []),
            }));

            return fallbackWallets;
          })
          .finally(() => {
            walletsRequest = null;
          });

        return walletsRequest;
      },

      getUserWallet: async (userId, { force = false } = {}) => {
        const normalizedUserId = String(userId || '').trim();
        if (!normalizedUserId) return null;

        const existingWallet = (get().wallets || []).find((entry) => (
          String(entry?.userId || entry?.id || '').trim() === normalizedUserId
        )) || null;
        if (existingWallet && !force) {
          return existingWallet;
        }

        try {
          const fetchedWallet = await apiClient.adminWallets.getByUserId(normalizedUserId);
          if (!fetchedWallet) return existingWallet;

          set((state) => ({
            wallets: upsertWallet(state.wallets, fetchedWallet),
            walletsLastLoadedAt: Date.now(),
            users: mergeWalletIntoUsers(state.users, fetchedWallet),
          }));

          return fetchedWallet;
        } catch (_error) {
          const baseUser = await get().getUserById(normalizedUserId).catch(() => (
            (get().users || []).find((entry) => String(entry?.id) === normalizedUserId) || null
          ));
          const fallbackWallet = buildWalletFromUser(baseUser, existingWallet || { userId: normalizedUserId });
          if (!fallbackWallet) {
            return existingWallet;
          }

          set((state) => ({
            wallets: upsertWallet(state.wallets, fallbackWallet),
            walletsLastLoadedAt: Date.now(),
            users: mergeWalletIntoUsers(state.users, fallbackWallet),
          }));

          return fallbackWallet;
        }
      },

      getUserWalletTransactions: async (userId, { force = false } = {}) => {
        const normalizedUserId = String(userId || '').trim();
        if (!normalizedUserId) return [];

        const existingTransactions = Array.isArray(get().userWalletTransactions?.[normalizedUserId])
          ? get().userWalletTransactions[normalizedUserId]
          : [];
        const lastLoadedAt = Number(get().walletTransactionsLastLoadedAt?.[normalizedUserId] || 0);
        const hasFreshTransactions = existingTransactions.length > 0 && (Date.now() - lastLoadedAt < WALLETS_CACHE_TTL);

        if (!force && hasFreshTransactions) {
          return existingTransactions;
        }

        if (walletTransactionsRequests.has(normalizedUserId)) {
          return walletTransactionsRequests.get(normalizedUserId);
        }

        const request = Promise.resolve(apiClient.adminWallets?.getTransactionsByUserId?.(normalizedUserId) || [])
          .then((items) => {
            const nextItems = Array.isArray(items) ? items : [];

            set((state) => {
              const relatedUser = (state.users || []).find((entry) => String(entry?.id) === normalizedUserId) || null;
              const existingWallet = (state.wallets || []).find((entry) => (
                String(entry?.userId || entry?.id || '').trim() === normalizedUserId
              )) || null;
              const nextWallet = buildWalletFromUser(relatedUser, {
                ...(existingWallet || {}),
                userId: normalizedUserId,
                recentTransactions: nextItems.slice(0, 5),
                transactionsCount: nextItems.length,
                lastTransactionAt: nextItems[0]?.createdAt || existingWallet?.lastTransactionAt || null,
              });

              return {
                userWalletTransactions: {
                  ...state.userWalletTransactions,
                  [normalizedUserId]: nextItems,
                },
                walletTransactionsLastLoadedAt: {
                  ...state.walletTransactionsLastLoadedAt,
                  [normalizedUserId]: Date.now(),
                },
                wallets: nextWallet ? upsertWallet(state.wallets, nextWallet) : state.wallets,
                users: nextWallet ? mergeWalletIntoUsers(state.users, nextWallet) : state.users,
              };
            });

            return nextItems;
          })
          .catch(() => existingTransactions)
          .finally(() => {
            walletTransactionsRequests.delete(normalizedUserId);
          });

        walletTransactionsRequests.set(normalizedUserId, request);
        return request;
      },

      addUser: async (user) => {
        const created = await apiClient.auth.register(user);
        const nextUser = created?.user || user;
        set((state) => ({
          users: [...state.users, nextUser],
          usersLastLoadedAt: Date.now(),
        }));
      },

      resendUserVerification: async (userIdOrEmail) => {
        const normalizedToken = String(userIdOrEmail || '').trim();
        if (!normalizedToken) {
          throw new Error('No email available for verification resend.');
        }

        const email = normalizedToken.includes('@')
          ? normalizedToken
          : ((get().users || []).find((entry) => String(entry?.id) === normalizedToken)?.email || '');

        if (!email) {
          throw new Error('No email available for verification resend.');
        }

        return apiClient.auth.resendVerification(email);
      },

      updateUserStatus: async (userId, status, actor = null) => {
        const updatedUser = await apiClient.users.updateStatus(userId, status, actor);
        const target = (get().users || []).find((entry) => entry.id === userId);
        const nextStatus = normalizeAccountStatus(updatedUser?.status || status);

        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, ...(updatedUser || {}), status: nextStatus } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        if (nextStatus === 'approved') {
          useNotificationStore.getState().addNotification({
            title: 'تمت الموافقة على الحساب',
            message: `تمت الموافقة على حساب ${target?.name || userId}`,
            type: 'success',
          });
        } else if (nextStatus === 'rejected') {
          useNotificationStore.getState().addNotification({
            title: 'تم رفض الحساب',
            message: `تم رفض حساب ${target?.name || userId}`,
            type: 'warning',
          });
        }

        return updatedUser || { ...(target || {}), status: nextStatus };
      },

      updateUserCoins: async (userId, amountToAdd, actor = null, onSelfUpdate = null) => {
        const apiResult = await apiClient.users.addCoins(userId, amountToAdd, actor);
        const updatedUser = apiResult?.user || null;
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId
              ? {
                ...entry,
                ...(updatedUser || {}),
                coins: normalizeMoneyAmount(updatedUser?.coins ?? (toFiniteNumber(entry.coins, 0) + amountToAdd)),
              }
              : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        await Promise.allSettled([
          get().getUserWallet(userId, { force: true }),
          get().getUserWalletTransactions(userId, { force: true }),
        ]);

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
        return apiResult;
      },

      updateUserGroup: async (userId, newGroup, actor = null) => {
        const updatedUser = await apiClient.users.updateGroup(userId, newGroup, actor);
        const { groupId, groupName } = extractGroupIdentity(newGroup);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId
              ? {
                ...entry,
                ...(updatedUser || {}),
                group: updatedUser?.group || updatedUser?.groupName || groupName || entry.group,
                groupName: updatedUser?.groupName || updatedUser?.group || groupName || entry.groupName || entry.group,
                groupId: updatedUser?.groupId || groupId || entry.groupId || '',
              }
              : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        try {
          localStorage.removeItem('products-storage');
        } catch (_) { /* ignore if storage is unavailable */ }

        try {
          const useAuthStore = (await import('./useAuthStore')).default;
          const currentUser = useAuthStore.getState().user;
          if (currentUser && (currentUser.id === userId || currentUser._id === userId)) {
            await useAuthStore.getState().refreshProfile({ force: true });
          }
        } catch (_) { /* ignore if auth store unavailable */ }

        return updatedUser;
      },

      updateUserRole: async (userId, newRole, actor = null) => {
        await apiClient.users.updateRole(userId, newRole, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, role: newRole } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));
      },

      updateUserCurrency: async (userId, currencyCode, actor = null) => {
        // 1. Call the API — backend converts balance + returns updated user
        await apiClient.users.updateCurrency(userId, currencyCode, actor);

        // 2. Force re-fetch the entire users list from DB (bulletproof — no manual patching)
        await get().loadUsers({ force: true });
        await get().getUserWallet(userId, { force: true }).catch(() => null);

        // 3. If the updated user is the currently logged-in user,
        //    force re-fetch their profile so navbar/balance updates instantly.
        try {
          const useAuthStore = (await import('./useAuthStore')).default;
          const currentUser = useAuthStore.getState().user;
          if (currentUser && (currentUser.id === userId || currentUser._id === userId)) {
            await useAuthStore.getState().refreshProfile({ force: true });
          }
        } catch (_) { /* ignore if auth store unavailable */ }
      },

      updateUserCreditLimit: async (userId, creditLimit, actor = null) => {
        const normalizedCreditLimit = normalizeMoneyAmount(
          Math.max(0, toFiniteNumber(creditLimit, 0))
        );

        const updatedUser = apiClient.users.updateCreditLimit
          ? await apiClient.users.updateCreditLimit(userId, normalizedCreditLimit, actor)
          : await apiClient.users.updateProfile(userId, { creditLimit: normalizedCreditLimit }, actor);

        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId
              ? {
                ...entry,
                ...(updatedUser || {}),
                creditLimit: normalizeMoneyAmount(
                  Math.max(
                    0,
                    toFiniteNumber(updatedUser?.creditLimit, toFiniteNumber(entry?.creditLimit, normalizedCreditLimit))
                  )
                ),
              }
              : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        try {
          const useAuthStore = (await import('./useAuthStore')).default;
          const currentUser = useAuthStore.getState().user;
          if (currentUser && (currentUser.id === userId || currentUser._id === userId)) {
            await useAuthStore.getState().refreshProfile({ force: true });
          }
        } catch (_) { /* ignore if auth store unavailable */ }

        return updatedUser;
      },

      deleteUser: async (userId, actor = null) => {
        await apiClient.users.delete(userId, actor);
        const normalizedUserId = String(userId || '').trim();
        set((state) => ({
          users: state.users.filter((entry) => entry.id !== userId),
          usersLastLoadedAt: Date.now(),
          wallets: (state.wallets || []).filter((entry) => String(entry?.userId || entry?.id || '').trim() !== normalizedUserId),
          userWalletTransactions: removeRecordKey(state.userWalletTransactions, normalizedUserId),
          walletTransactionsLastLoadedAt: removeRecordKey(state.walletTransactionsLastLoadedAt, normalizedUserId),
        }));
      },

      updateUserAvatar: async (userId, avatar, actor = null, onSelfUpdate = null) => {
        await apiClient.users.updateAvatar(userId, avatar, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, avatar } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
      },

      updateUserProfile: async (userId, profileUpdates, actor = null, onSelfUpdate = null) => {
        const updatedUser = await apiClient.users.updateProfile(userId, profileUpdates, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, ...updatedUser } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate(updatedUser);
      },

      resetUserPassword: async (userId, actor = null, password = '') => apiClient.users.resetPassword(userId, actor, password),
    }),
    {
      name: 'admin-ui-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAdminStore;
