import { useEffect, useState } from 'react';
import classes from '../ViewPage/ViewPage.module.css';
import { Button, Text, Container, Image, Loader, Tooltip, FileButton, VisuallyHidden, Group } from '@mantine/core';
import { Document } from '../../../../types';
import ScannerPicker from './ScannerPicker/ScannerPicker';
import { useTranslation } from 'react-i18next';
import useLogMount from 'hooks/useLogMount';
import { IconX } from '@tabler/icons-react';

type Props = {
  activeDocument: Document;
  activePage: number;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
  translationLanguage: string;
};

const ViewPage: React.FC<Props> = ({ activeDocument, activePage, onUpdate, translationLanguage }) => {
  useLogMount('ViewPage');
  const { t } = useTranslation();
  const [selectedScanner, setSelectedScanner] = useState<string | null>(null);
  const [scannersList, setScannersList] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File>(null);

  const fetchScannersList = async () => {
    setScannersList([]);
    window.electronAPI.getScannersList();
    await window.electronAPI.addScannersListListener((scannersList) => {
      setScannersList(scannersList);
    });
  };

  const handleUploadFile = async () => {
    const pathToUploadedFile = (uploadedFile as any).path;
    window.electronAPI.log('debug', `User uploaded file ${pathToUploadedFile}.`);
    window.electronAPI.processUploadedFile(
      pathToUploadedFile,
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
      translationLanguage,
    );
    setUploadedFile(null);
  };

  const handleScan = async () => {
    window.electronAPI.log('debug', `Scan button clicked by user. Scanning with scanner: ${selectedScanner}.`);
    await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
    await window.electronAPI.scanFile(
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
      selectedScanner,
      translationLanguage,
    );
  };

  const handleClickRejectImage = async () => {
    window.electronAPI.log('debug', 'Reject image button clicked by user.');
    window.electronAPI.clearPage(activeDocument.documentID, activeDocument.pages[activePage].file);
    await onUpdate('editFile', null, activeDocument.pages[activePage].pageID);
    if (activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress') {
      window.electronAPI.cancelRecognition();
    }
    await onUpdate('editBrailleStatus', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editBrailleText', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editTranslatedTextStatus', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editTranslatedText', null, activeDocument.pages[activePage].pageID);
  };

  // get list of available scanners
  useEffect(() => {
    fetchScannersList();
    return () => {
      window.electronAPI.removeScannersListListener();
    };
  }, []);

  //checks if the stored scanner is available
  useEffect(() => {
    const checkStoredScannerAvailability = async () => {
      const storedScanner = await window.electronAPI.getStoreValue('scanner');
      if (scannersList && !scannersList.includes(storedScanner)) {
        window.electronAPI.log(
          'debug',
          `Stored scanner: ${storedScanner} is not available. Setting first available scanner as selected.`,
        );
        setSelectedScanner(scannersList[0]);
      } else {
        window.electronAPI.log('debug', `Stored scanner: ${storedScanner} is available. Setting it as selected.`);
        setSelectedScanner(storedScanner);
      }
    };
    checkStoredScannerAvailability();
  }, [scannersList]);

  // stores value of selectedScanner
  useEffect(() => {
    if (selectedScanner) {
      window.electronAPI.setStoreValue('scanner', selectedScanner);
    }
  }, [selectedScanner]);

  // updates the value of file in document after update of file
  useEffect(() => {
    if (uploadedFile) {
      handleUploadFile();
    }
  }, [uploadedFile]);

  return activeDocument.pages[activePage].file === 'scanInProgress' ? (
    <Container className={classes.docPreviewEmpty}>
      <Loader color="blue" />
      <Text tabIndex={0}>{t('view_document.scan_runs')}</Text>
    </Container>
  ) : activeDocument.pages[activePage].file === null ? (
    <Container className={classes.docPreviewEmpty}>
      <ScannerPicker
        selectedScanner={selectedScanner}
        setSelectedScanner={setSelectedScanner}
        fetchScannersList={fetchScannersList}
        scannersList={scannersList}
      />
      <Button onClick={handleScan} size="xl" disabled={!scannersList.length}>
        {t('view_document.scan_button')}
      </Button>
      <Text>{t('view_document.or')}</Text>
      <FileButton onChange={setUploadedFile} accept="image/*,.pdf">
        {(props) => (
          <Button size="xl" {...props}>
            {t('view_document.upload_button')}
          </Button>
        )}
      </FileButton>
    </Container>
  ) : (
    <div className={classes.imageAndButtonDiv}>
      <Image
        src={activeDocument.pages[activePage].file}
        alt={t('view_document.image_description')}
        className={classes.imagePreview}
        tabIndex={0}
      />
      <Tooltip label={t('view_document.clear_button')}>
        <Button
          className={classes.rejectScannedDocument}
          size="xl"
          variant="transparent"
          onClick={handleClickRejectImage}
          color="red"
        >
          <IconX size={35}></IconX>
          <VisuallyHidden>{t('view_document.clear_button')}</VisuallyHidden>
        </Button>
      </Tooltip>
    </div>
  );
};

export { ViewPage };
