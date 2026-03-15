import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';

const resources = {
  ar: { translation: arCommon },
  en: { translation: enCommon }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

const detectedLanguage = (i18n.resolvedLanguage || i18n.language || '').toLowerCase();
if (!['ar', 'en'].includes(detectedLanguage)) {
  i18n.changeLanguage('ar');
  localStorage.setItem('language', 'ar');
}

export default i18n;
