import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { InitOptions } from 'i18next';
import Fetch from 'i18next-fetch-backend';

const languages = ['sk', 'en'];
const DEFAULT_INTL_NAMESPACE = 'common';

const i18nConfig: InitOptions = {
  supportedLngs: languages,
  fallbackLng: 'sk',
  debug: process.env.NODE_ENV !== 'production',
  lowerCaseLng: true,
  ns: [DEFAULT_INTL_NAMESPACE],
  defaultNS: DEFAULT_INTL_NAMESPACE,
  interpolation: {
    escapeValue: false, // react escapes by default
  },
  lng: 'sk',
  backend: {
    loadPath: 'locales/{{lng}}/{{ns}}.json',
  },
};

i18n.use(initReactI18next).use(Fetch).init(i18nConfig);

export default i18n;
