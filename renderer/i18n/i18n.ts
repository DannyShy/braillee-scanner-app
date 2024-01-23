import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { useParams } from 'next/navigation';
import { useTranslation as useTranslationOrg } from 'next-i18next';
import { useState, useEffect } from 'react';
import { InitOptions } from 'i18next';
import Fetch from 'i18next-fetch-backend';

const languages = ['sk', 'en'];
const DEFAULT_INTL_NAMESPACE = 'common';

const i18nConfig: InitOptions = {
  supportedLngs: languages,
  fallbackLng: 'sk',
  debug: process.env.NODE_ENV !== 'production',
  lowerCaseLng: true,
  interpolation: {
    escapeValue: false, // react escapes by default
  },
  lng: 'sk',
  backend: {
    loadPath: 'locales/{{lng}}/{{ns}}.json',
  },
};
i18n
  .use(initReactI18next)
  // .use(LanguageDetector)
  // .use(
  //   resourcesToBackend((language: string, namespace: string) => import(`public/locales/${language}/${namespace}.json`)),
  // )
  .init(i18nConfig);

export default i18n;
