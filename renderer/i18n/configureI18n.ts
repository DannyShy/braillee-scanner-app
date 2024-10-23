import { initReactI18next } from 'react-i18next';
import Fetch from 'i18next-fetch-backend';
import { InitOptions } from 'i18next';
import i18n from 'i18next';

const languages = ['sk', 'en'];
const DEFAULT_INTL_NAMESPACE = 'common';

const fetchStoredLanguage = async (setConfiguredI18n: React.Dispatch<React.SetStateAction<typeof i18n>>) => {
  const storedLanguage = await window.electronAPI.getStoreValue('language') || languages[0];
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
    lng: storedLanguage,
    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
    },
  };

  i18n
    .use(initReactI18next)
    .use(Fetch)
    .init(i18nConfig)
    .then(() => {
      setConfiguredI18n(i18n);
    })
    .catch((error) => {
      console.error('Error initializing i18n:', error);
    });
};

export { fetchStoredLanguage };
