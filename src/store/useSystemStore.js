import { create } from 'zustand';
import apiClient from '../services/client';
import { getDefaultWhatsAppNumber } from '../utils/whatsapp';
import { createDefaultPaymentGroups, normalizePaymentGroups } from '../utils/paymentSettings';

const CURRENCIES_CACHE_TTL = 10 * 60 * 1000;
const PAYMENT_SETTINGS_CACHE_TTL = 5 * 60 * 1000;

let currenciesRequest = null;
let paymentSettingsRequest = null;

const useSystemStore = create((set, get) => ({
  currencies: [],
  isLoadingCurrencies: false,
  currenciesLastLoadedAt: 0,
  paymentSettings: {
    countryAccounts: [],
    instructions: '',
    whatsappNumber: getDefaultWhatsAppNumber(),
    paymentGroups: createDefaultPaymentGroups(),
  },
  paymentSettingsLastLoadedAt: 0,

  loadCurrencies: async ({ force = false } = {}) => {
    const { currencies, currenciesLastLoadedAt } = get();
    const hasCurrencies = Array.isArray(currencies) && currencies.length > 0;
    const hasFreshCurrencies = hasCurrencies && (Date.now() - Number(currenciesLastLoadedAt || 0) < CURRENCIES_CACHE_TTL);

    if (!force && hasFreshCurrencies) {
      return currencies;
    }

    if (currenciesRequest) {
      return currenciesRequest;
    }

    set({ isLoadingCurrencies: true });

    currenciesRequest = apiClient.system.currencies()
      .then((items) => {
        const nextCurrencies = Array.isArray(items) ? items : [];
        set({
          currencies: nextCurrencies,
          isLoadingCurrencies: false,
          currenciesLastLoadedAt: Date.now(),
        });
        return nextCurrencies;
      })
      .catch((_error) => {
        set({ isLoadingCurrencies: false });
        return get().currencies;
      })
      .finally(() => {
        currenciesRequest = null;
      });

    return currenciesRequest;
  },

  addCurrency: async (payload, actor) => {
    const created = await apiClient.system.addCurrency(payload, actor);
    set((state) => ({
      currencies: [...state.currencies, created],
      currenciesLastLoadedAt: Date.now(),
    }));
    return created;
  },

  updateCurrency: async (code, updates, actor) => {
    const updated = await apiClient.system.updateCurrency(code, updates, actor);
    set((state) => ({
      currencies: state.currencies.map((item) => (item.code === code ? updated : item)),
      currenciesLastLoadedAt: Date.now(),
    }));
    return updated;
  },

  deleteCurrency: async (code, actor) => {
    await apiClient.system.deleteCurrency(code, actor);
    set((state) => ({
      currencies: state.currencies.filter((item) => item.code !== code),
      currenciesLastLoadedAt: Date.now(),
    }));
  },

  ensureDefaultCurrency: () => {
    const list = get().currencies || [];
    if (!list.length) {
      set({
        currencies: [{ code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 }],
        currenciesLastLoadedAt: Date.now(),
      });
    }
  },

  loadPaymentSettings: async ({ force = false } = {}) => {
    const { paymentSettings, paymentSettingsLastLoadedAt } = get();
    const hasPaymentGroups = Array.isArray(paymentSettings?.paymentGroups) && paymentSettings.paymentGroups.length > 0;
    const hasFreshPaymentSettings = hasPaymentGroups && (Date.now() - Number(paymentSettingsLastLoadedAt || 0) < PAYMENT_SETTINGS_CACHE_TTL);

    if (!force && hasFreshPaymentSettings) {
      return paymentSettings;
    }

    if (paymentSettingsRequest) {
      return paymentSettingsRequest;
    }

    paymentSettingsRequest = apiClient.system.paymentSettings()
      .then((settings) => {
        const nextPaymentSettings = {
          countryAccounts: Array.isArray(settings?.countryAccounts) ? settings.countryAccounts : [],
          instructions: settings?.instructions || '',
          whatsappNumber: settings?.whatsappNumber || getDefaultWhatsAppNumber(),
          paymentGroups: normalizePaymentGroups(settings?.paymentGroups),
        };

        set({
          paymentSettings: nextPaymentSettings,
          paymentSettingsLastLoadedAt: Date.now(),
        });

        return nextPaymentSettings;
      })
      .catch((_error) => get().paymentSettings)
      .finally(() => {
        paymentSettingsRequest = null;
      });

    return paymentSettingsRequest;
  },

  savePaymentSettings: async (payload, actor) => {
    const currentSettings = get().paymentSettings || {};
    const mergedPayload = {
      ...currentSettings,
      ...payload,
      paymentGroups: payload?.paymentGroups !== undefined
        ? normalizePaymentGroups(payload.paymentGroups)
        : normalizePaymentGroups(currentSettings?.paymentGroups),
    };
    const saved = await apiClient.system.updatePaymentSettings(payload, actor);
    const mergedSettings = {
      ...mergedPayload,
      ...(saved || {}),
    };
    set({
      paymentSettings: {
        countryAccounts: Array.isArray(mergedSettings?.countryAccounts) ? mergedSettings.countryAccounts : [],
        instructions: mergedSettings?.instructions || '',
        whatsappNumber: mergedSettings?.whatsappNumber || getDefaultWhatsAppNumber(),
        paymentGroups: normalizePaymentGroups(mergedSettings?.paymentGroups),
      },
      paymentSettingsLastLoadedAt: Date.now(),
    });
    return mergedSettings;
  },
}));

export default useSystemStore;
