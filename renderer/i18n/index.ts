import i18n, { InitOptions } from 'i18next';
import Fetch from 'i18next-fetch-backend';
import { initReactI18next } from 'react-i18next';

// const languages = ['sk', 'en'];

export const DEFAULT_INTL_NAMESPACE = 'translation';

const i18nConfig: InitOptions = {
  // whitelist: languages,
  fallbackLng: 'en',
  debug: process.env.NODE_ENV !== 'production',
  lowerCaseLng: true,
  ns: [DEFAULT_INTL_NAMESPACE],
  defaultNS: DEFAULT_INTL_NAMESPACE,
  interpolation: {
    escapeValue: false, // react escapes by default
  },
  lng: 'en',
  backend: {
    loadPath: 'C:/Users/hotovo/braille-scanner/renderer/public/locales/{{lng}}/{{ns}}.json',
  },
};

// When other languages are used add language detection and logic to change language
// for now this is only to simplify future work

export const i18nInit = i18n
  .use(Fetch)
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init(i18nConfig);

export default i18n;
