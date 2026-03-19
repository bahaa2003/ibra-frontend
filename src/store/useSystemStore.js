import { create } from 'zustand';
import apiClient from '../services/client';
import { getDefaultWhatsAppNumber } from '../utils/whatsapp';
import { createDefaultPaymentGroups, normalizePaymentGroups } from '../utils/paymentSettings';

<<<<<<< HEAD
const CURRENCIES_CACHE_TTL = 10 * 60 * 1000;
const PAYMENT_SETTINGS_CACHE_TTL = 5 * 60 * 1000;

let currenciesRequest = null;
let paymentSettingsRequest = null;

const useSystemStore = create((set, get) => ({
  currencies: [],
  isLoadingCurrencies: false,
  currenciesLastLoadedAt: 0,
=======
const useSystemStore = create((set, get) => ({
  currencies: [],
  isLoadingCurrencies: false,
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  paymentSettings: {
    countryAccounts: [],
    instructions: '',
    whatsappNumber: getDefaultWhatsAppNumber(),
    paymentGroups: createDefaultPaymentGroups(),
  },
<<<<<<< HEAD
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
=======

  loadCurrencies: async () => {
    set({ isLoadingCurrencies: true });
    try {
      const items = await apiClient.system.currencies();
      set({ currencies: Array.isArray(items) ? items : [], isLoadingCurrencies: false });
    } catch (_error) {
      set({ isLoadingCurrencies: false });
    }
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  },

  addCurrency: async (payload, actor) => {
    const created = await apiClient.system.addCurrency(payload, actor);
<<<<<<< HEAD
    set((state) => ({
      currencies: [...state.currencies, created],
      currenciesLastLoadedAt: Date.now(),
    }));
=======
    set((state) => ({ currencies: [...state.currencies, created] }));
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    return created;
  },

  updateCurrency: async (code, updates, actor) => {
    const updated = await apiClient.system.updateCurrency(code, updates, actor);
    set((state) => ({
      currencies: state.currencies.map((item) => (item.code === code ? updated : item)),
<<<<<<< HEAD
      currenciesLastLoadedAt: Date.now(),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    }));
    return updated;
  },

  deleteCurrency: async (code, actor) => {
    await apiClient.system.deleteCurrency(code, actor);
    set((state) => ({
      currencies: state.currencies.filter((item) => item.code !== code),
<<<<<<< HEAD
      currenciesLastLoadedAt: Date.now(),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    }));
  },

  ensureDefaultCurrency: () => {
    const list = get().currencies || [];
    if (!list.length) {
<<<<<<< HEAD
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
=======
      set({ currencies: [{ code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 }] });
    }
  },

  loadPaymentSettings: async () => {
    try {
      const settings = await apiClient.system.paymentSettings();
      set({
        paymentSettings: {
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          countryAccounts: Array.isArray(settings?.countryAccounts) ? settings.countryAccounts : [],
          instructions: settings?.instructions || '',
          whatsappNumber: settings?.whatsappNumber || getDefaultWhatsAppNumber(),
          paymentGroups: normalizePaymentGroups(settings?.paymentGroups),
<<<<<<< HEAD
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
=======
        },
      });
    } catch (_error) {
      set({
        paymentSettings: {
          countryAccounts: [],
          instructions: '',
          whatsappNumber: getDefaultWhatsAppNumber(),
          paymentGroups: createDefaultPaymentGroups(),
        },
      });
    }
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  },

  savePaymentSettings: async (payload, actor) => {
    const saved = await apiClient.system.updatePaymentSettings(payload, actor);
    set({
      paymentSettings: {
        countryAccounts: Array.isArray(saved?.countryAccounts) ? saved.countryAccounts : [],
        instructions: saved?.instructions || '',
        whatsappNumber: saved?.whatsappNumber || getDefaultWhatsAppNumber(),
        paymentGroups: normalizePaymentGroups(saved?.paymentGroups),
      },
<<<<<<< HEAD
      paymentSettingsLastLoadedAt: Date.now(),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    });
    return saved;
  },
}));

export default useSystemStore;
