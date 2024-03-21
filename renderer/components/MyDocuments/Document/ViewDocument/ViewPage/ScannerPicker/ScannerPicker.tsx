import { useState, Dispatch, SetStateAction } from 'react';
import { UnstyledButton, Menu, Group, VisuallyHidden, Button, Text } from '@mantine/core';
import { IconChevronDown, IconRefresh } from '@tabler/icons-react';
import classes from './ScannerPicker.module.css';
import { useTranslation } from 'react-i18next';

type Props = {
  selectedScanner: string | null;
  setSelectedScanner: Dispatch<SetStateAction<string>>;
  fetchScannersList: () => void;
  scannersList: string[];
};

const ScannerPicker: React.FC<Props> = ({ selectedScanner, setSelectedScanner, fetchScannersList, scannersList }) => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);

  const items = scannersList.map((item) => (
    <Menu.Item onClick={() => setSelectedScanner(item)} key={item}>
      <VisuallyHidden>{t('scanner_picker.scanner')}</VisuallyHidden>
      {item}
    </Menu.Item>
  ));

  const handleRefreshButtonClick = () => {
    fetchScannersList();
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 100); // match transition duration
  };

  return (
    <div className={classes.detectedScanners}>
      {scannersList.length === 0 ? (
        <Text>{t('scanner_picker.scanner_text_zero')}</Text>
      ) : scannersList.length === 1 ? (
        <Text>
          {t('scanner_picker.scanner_text_one', {
            selectedScanner: selectedScanner,
          })}
        </Text>
      ) : (
        <div className={classes.scannerSelection}>
          <div className={classes.combobox}>
            <VisuallyHidden>
              {t('scanner_picker.scanner_text_multiple', { scannersCount: scannersList.length })}
            </VisuallyHidden>
            <Menu
              onOpen={() => setOpened(true)}
              onClose={() => setOpened(false)}
              radius="md"
              width="target"
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton className={classes.control} data-expanded={opened || undefined}>
                  <Group gap="xs">
                    <span className={classes.label}>{selectedScanner}</span>
                  </Group>
                  <IconChevronDown size="1rem" className={classes.icon} stroke={1.5} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>{items}</Menu.Dropdown>
            </Menu>
          </div>
        </div>
      )}
      <Button
        className={clicked ? `${classes.refreshButton}` : `${classes.refreshButtonClicked}`}
        variant="transparent"
        onClick={handleRefreshButtonClick}
      >
        <IconRefresh size={25}></IconRefresh>
        <VisuallyHidden>{t('scanner_picker.hidden_refresh_button')}</VisuallyHidden>
      </Button>
    </div>
  );
};

export default ScannerPicker;
