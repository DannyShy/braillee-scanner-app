import { useState, useEffect } from 'react';
import { UnstyledButton, Menu, Image, Group, VisuallyHidden } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { LanguagePickerData } from 'components/types';
import classes from './LanguagePicker.module.css';
import images from './images/images';

const data: LanguagePickerData[] = [
  { label: 'en', image: images.english, description: 'english' },
  { label: 'sk', image: images.slovak, description: 'slovenský' },
];

const findLanguageByLabel = (storedLanguage: string) => {
  return data.findIndex((item) => item.label === storedLanguage);
};

interface LanguagePickerProps {
  i18n: typeof i18n;
}

const LanguagePicker: React.FC<LanguagePickerProps> = ({ i18n }) => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState<boolean>(false);
  const currentLanguage = i18n.language;
  const languageLabel = findLanguageByLabel(currentLanguage);
  const [selected, setSelected] = useState<LanguagePickerData>(data[languageLabel]);

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
