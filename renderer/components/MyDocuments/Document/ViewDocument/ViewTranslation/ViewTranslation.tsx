import { useEffect, useState } from 'react';
import { Text, Menu, UnstyledButton, Group } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import useLogMount from 'hooks/useLogMount';
import { Document } from '../../../../types';
import classes from './ViewTranslation.module.css';

type Props = {
  activeDocument: Document;
  activePage: number;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
  translationLanguage: string;
  setTranslationLanguage: (language: string) => void;
};

const languages = ['sk', 'en'];

const ViewTranslation: React.FC<Props> = ({
  activeDocument,
  activePage,
  onUpdate,
  translationLanguage,
  setTranslationLanguage,
}) => {
  useLogMount('ViewTranslation');
  const { t } = useTranslation();
  const [opened, setOpened] = useState<boolean>(false);

  const items = languages.map((language) => (
    <Menu.Item
      onClick={() => {
        window.electronAPI.log('debug', `Language selected: ${language}`);
        setTranslationLanguage(language);
      }}
      key={language}
    >
      {t(`view_translation.menu_item.${language}`)}
    </Menu.Item>
  ));

  // update of translation in case of language change
  useEffect(() => {
    onUpdate('editTranslationLanguage', translationLanguage, activeDocument.pages[activePage].pageID);
    if (
      activeDocument.pages[activePage].translatedTextStatus === 'translatedTextAvailable' &&
      activeDocument.pages[activePage].brailleStatus === 'brailleTextAvailable' &&
      activeDocument.pages[activePage].translation !== null
    ) {
      window.electronAPI.log('debug', 'Translating text due to language change.');
      window.electronAPI.translateText(
        activeDocument.pages[activePage].brailleText,
        activeDocument.documentID,
        activeDocument.pages[activePage].pageID,
        translationLanguage,
      );
    }
  }, [translationLanguage]);

  useEffect(() => {
    const fetchTranslationLanguage = async () => {
      if (activeDocument.translationLanguage === null) {
        window.electronAPI.log('debug', 'Fetching stored language.');
        const storedLanguage = await window.electronAPI.getStoreValue('language');
        setTranslationLanguage(storedLanguage);
      } else {
        window.electronAPI.log('debug', 'Setting translation language from document.json.');
        setTranslationLanguage(activeDocument.translationLanguage);
      }
    };
    fetchTranslationLanguage();
  }, []);

  return (
    <div className={classes.ViewTranslation}>
      <div className={classes.translationLanguageSelector}>
        <Text>{t('view_translation.description')}</Text>
        <Menu onOpen={() => setOpened(true)} onClose={() => setOpened(false)} radius="md" width="target" withinPortal>
          <Menu.Target>
            <UnstyledButton className={classes.control} data-expanded={opened || undefined}>
              <Group gap="xs">
                <span className={classes.label}>{t(`view_translation.menu_item.${translationLanguage}`)}</span>
              </Group>
              <IconChevronDown size="1rem" className={classes.icon} stroke={1.5} />
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>{items}</Menu.Dropdown>
        </Menu>
      </div>
      {activeDocument.pages[activePage].translatedTextStatus === 'translatedTextAvailable' &&
      activeDocument.pages[activePage].translation !== null ? (
        <Text tabIndex={0}>{activeDocument.pages[activePage].translation}</Text>
      ) : null}
    </div>
  );
};

export default ViewTranslation;
