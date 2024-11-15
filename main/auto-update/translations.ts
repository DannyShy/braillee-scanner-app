const translations = {
  sk: {
    update_dialog: {
      restart: 'Reštartovať',
      later: 'Neskôr',
      title: 'Aktualizácia je dostupná',
      message: 'Nová verzia aplikácie je stiahnutá a pripravená. Reštartujte aplikáciu pre spustenie novej verzie.',
      error: 'Nastal problém pri kontrole novej verzie aplikácie.',
    },
  },
  en: {
    update_dialog: {
      restart: 'Restart',
      later: 'Later',
      title: 'Application Update',
      message: 'A new version has been downloaded. Restart the application to apply the updates.',
      error: 'There was a problem updating the application',
    },
  },
};

const getTranslations = (lng: 'sk' | 'en' | string) => {
  if (lng === 'sk') {
    return translations.sk;
  }
  return translations.en;
};

export { translations, getTranslations };
