import { create } from 'zustand';
import apiClient from '../services/client';
import { getDefaultWhatsAppNumber } from '../utils/whatsapp';
import { createDefaultPaymentGroups, normalizePaymentGroups } from '../utils/paymentSettings';

const useSystemStore = create((set, get) => ({
  currencies: [],
  isLoadingCurrencies: false,
  paymentSettings: {
    countryAccounts: [],
    instructions: '',
    whatsappNumber: getDefaultWhatsAppNumber(),
    paymentGroups: createDefaultPaymentGroups(),
  },

  loadCurrencies: async () => {
    set({ isLoadingCurrencies: true });
    try {
      const items = await apiClient.system.currencies();
      set({ currencies: Array.isArray(items) ? items : [], isLoadingCurrencies: false });
    } catch (_error) {
      set({ isLoadingCurrencies: false });
    }
  },

  addCurrency: async (payload, actor) => {
    const created = await apiClient.system.addCurrency(payload, actor);
    set((state) => ({ currencies: [...state.currencies, created] }));
    return created;
  },

  updateCurrency: async (code, updates, actor) => {
    const updated = await apiClient.system.updateCurrency(code, updates, actor);
    set((state) => ({
      currencies: state.currencies.map((item) => (item.code === code ? updated : item)),
    }));
    return updated;
  },

  deleteCurrency: async (code, actor) => {
    await apiClient.system.deleteCurrency(code, actor);
    set((state) => ({
      currencies: state.currencies.filter((item) => item.code !== code),
    }));
  },

  ensureDefaultCurrency: () => {
    const list = get().currencies || [];
    if (!list.length) {
      set({ currencies: [{ code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 }] });
    }
  },

  loadPaymentSettings: async () => {
    try {
      const settings = await apiClient.system.paymentSettings();
      set({
        paymentSettings: {
          countryAccounts: Array.isArray(settings?.countryAccounts) ? settings.countryAccounts : [],
          instructions: settings?.instructions || '',
          whatsappNumber: settings?.whatsappNumber || getDefaultWhatsAppNumber(),
          paymentGroups: normalizePaymentGroups(settings?.paymentGroups),
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
    });
    return saved;
  },
}));

export default useSystemStore;
