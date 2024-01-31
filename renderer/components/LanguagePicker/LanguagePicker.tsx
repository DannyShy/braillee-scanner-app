import { useState, useEffect } from 'react';
import { UnstyledButton, Menu, Image, Group, VisuallyHidden } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import images from './images/images';
import classes from './LanguagePicker.module.css';
import i18n from '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

const data = [
  { label: 'en', image: images.english, description: 'english' },
  { label: 'sk', image: images.slovak, description: 'slovenský' },
];

const findLanguageByLabel = (storedLanguage) => {
  return data.findIndex((item) => item.label === storedLanguage);
};

const LanguagePicker: React.FC = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [storedLanguage, setStoredLanguage] = useState(null);
  const [selected, setSelected] = useState(data[1]);

  const getStoredLanguage = async () => {
    const readedValueOfStoredLanguage = await window.electronAPI.getStoreValue('language');
    if (readedValueOfStoredLanguage !== storedLanguage) {
      setStoredLanguage(readedValueOfStoredLanguage);
    }
  };
  getStoredLanguage();
  const languageLabel = findLanguageByLabel(storedLanguage);
  console.log('languagelabel:', languageLabel);

  const items = data.map((item) => (
    <Menu.Item
      leftSection={<Image src={item.image} width={18} height={18} />}
      onClick={() => setSelected(item)}
      key={item.label}
    >
      {item.label}
      <VisuallyHidden>
        {t('language_picker.hidden_language_description', { language: item.description })}
      </VisuallyHidden>
    </Menu.Item>
  ));

  useEffect(() => {
    i18n.changeLanguage(selected.label);
    window.electronAPI.setStoreValue('language', selected.label);
  }, [selected]);

  useEffect(() => {
    if (languageLabel > -1 && storedLanguage !== selected.label) {
      i18n.changeLanguage(data[languageLabel].label);
    }
  }, []);

  return (
    <Menu onOpen={() => setOpened(true)} onClose={() => setOpened(false)} radius="md" width="target" withinPortal>
      <Menu.Target>
        <UnstyledButton className={classes.control} data-expanded={opened || undefined}>
          <Group gap="xs">
            <VisuallyHidden>{t('language_picker.hidden_menu_description')}</VisuallyHidden>
            <Image src={selected.image} width={22} height={22} />
            <span className={classes.label}>{selected.label}</span>
          </Group>
          <IconChevronDown size="1rem" className={classes.icon} stroke={1.5} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>{items}</Menu.Dropdown>
    </Menu>
  );
};

export default LanguagePicker;
