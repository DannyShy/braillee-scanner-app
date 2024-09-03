import { useEffect, useRef, useState } from 'react';
import classes from '../ViewPage/ViewPage.module.css';
import {
  Button,
  Text,
  Container,
  Image,
  Loader,
  Tooltip,
  FileButton,
  VisuallyHidden,
  Menu,
  UnstyledButton,
  ScrollArea,
} from '@mantine/core';
import { Document } from '../../../../types';
import ScannerPicker from './ScannerPicker/ScannerPicker';
import { useTranslation } from 'react-i18next';
import useLogMount from 'hooks/useLogMount';
import { IconChevronDown, IconX } from '@tabler/icons-react';
import { DEFAULT_SCAN_DELAY } from '../../../../../constants';

type Props = {
  activeDocument: Document;
  activePage: number;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
  translationLanguage: string;
};

const scanDelayValues: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

const ViewPage: React.FC<Props> = ({ activeDocument, activePage, onUpdate, translationLanguage }) => {
  useLogMount('ViewPage');
  const { t } = useTranslation();
  const [selectedScanner, setSelectedScanner] = useState<string | null>(null);
  const [scannersList, setScannersList] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [opened, setOpened] = useState<boolean>(false);
  const [scanDelay, setScanDelay] = useState<number>(DEFAULT_SCAN_DELAY);
  const [autoScanIsRunning, setAutoScanIsRunning] = useState<boolean>(false);

  const activePageRef = useRef(activePage);
  const activeDocumentRef = useRef(activeDocument);

  const items = scanDelayValues.map((item) => (
    <Menu.Item onClick={() => setScanDelay(item)} key={item}>
      {item}s
    </Menu.Item>
  ));

  const fetchScannersList = async () => {
    console.log("=>(ViewPage.tsx:53) fetchScannersList");
    setScannersList([]);
    window.electronAPI.getScannersList();
    await window.electronAPI.addScannersListListener((scannersList) => {
      const sanitizedScannerList = scannersList.filter(i => i);
      setScannersList(sanitizedScannerList);
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

  const handleContinuousScan = async () => {
    window.electronAPI.log('debug', `Scan button clicked by user. Scanning with scanner: ${selectedScanner}.`);
    await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
    await window.electronAPI.scanFile(
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
      selectedScanner,
      translationLanguage,
    );
  };

  const handleScanWithBreak = async () => {
    //render stop button instead of other buttons
    window.electronAPI.log('debug', `Auto scan button clicked by user. Scanning with scanner: ${selectedScanner}.`);
    setAutoScanIsRunning(true);
    await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
    await window.electronAPI.scanFile(
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
      selectedScanner,
      translationLanguage,
    );
  };

  const handleStopScanWithBreak = async () => {
    setAutoScanIsRunning(false);
    await onUpdate('editFile', null, activeDocument.pages[activePage].pageID);
    window.electronAPI.log('debug', 'Auto scan stopped by user.');
  };

  const handleClickRejectImage = async () => {
    window.electronAPI.log('debug', 'Reject image button clicked by user.');
    window.electronAPI.clearPage(
      activeDocument.documentID,
      activeDocument.pages[activePage].file,
      activeDocument.pages[activePage].pageID,
    );
    await onUpdate('editFile', null, activeDocument.pages[activePage].pageID);
    if (activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress') {
      window.electronAPI.cancelRecognition();
    }
    await onUpdate('editBrailleStatus', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editBrailleText', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editTranslatedTextStatus', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editTranslatedText', null, activeDocument.pages[activePage].pageID);
  };

  // run autoscan loop once the file of active page is available

  useEffect(() => {
    if (
      activeDocument.pages[activePage].file &&
      activeDocument.pages[activePage].file !== 'scanInProgress' &&
      autoScanIsRunning
    ) {
      onUpdate('addPage'); // during time delay new page is added and set to be active
      setTimeout(() => {
        const newActiveDocument = activeDocumentRef.current;
        onUpdate('editFile', 'scanInProgress', newActiveDocument.pages[activePageRef.current].pageID);
        window.electronAPI.scanFile(
          activeDocument.documentID,
          newActiveDocument.pages[activePageRef.current].pageID,
          selectedScanner,
          translationLanguage,
        );
      }, scanDelay * 1000);
    }
  }, [activeDocument.pages[activePage].file]);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    activeDocumentRef.current = activeDocument;
  }, [activeDocument]);

  // get list of available scanners
  useEffect(() => {
    fetchScannersList();
    return () => {
      window.electronAPI.removeScannersListListener();
    };
  }, []);

  // checks if the stored scanner is available
  useEffect(() => {
    const checkStoredScannerAvailability = async () => {
      const storedScanner = await window.electronAPI.getStoreValue('scanner');
      if (scannersList && !scannersList.includes(storedScanner) && storedScanner !== undefined) {
        window.electronAPI.log(
          'debug',
          `Stored scanner: ${storedScanner} is not available.`,
        );
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

  // checks if the stored scanDelay is available
  useEffect(() => {
    const checkStoredScanDealay = async () => {
      const storedScanDelay = await window.electronAPI.getStoreValue('scan-delay');
      if (storedScanDelay) setScanDelay(storedScanDelay);
    };
    checkStoredScanDealay();
  }, []);

  // stores value of scanDelay
  useEffect(() => {
    window.electronAPI.setStoreValue('scan-delay', scanDelay);
  }, [scanDelay]);

  // updates the value of file in document after update of file
  useEffect(() => {
    if (uploadedFile) {
      handleUploadFile();
    }
  }, [uploadedFile]);

  return activeDocument.pages[activePage].file === 'scanInProgress' && !autoScanIsRunning ? (
    <Container className={classes.docPreviewEmpty}>
      <Loader color="blue" />
      <Text tabIndex={0}>{t('view_document.view_page.scan_runs')}</Text>
    </Container>
  ) : autoScanIsRunning ? (
    <Container className={classes.docPreviewEmpty}>
      <Loader color="blue" />
      <Text tabIndex={0}>{t('view_document.view_page.scan_runs')}</Text>
      <Button size="xl" color="red" onClick={handleStopScanWithBreak}>
        {t('view_document_view_page.stop_auto_scan')}
      </Button>
    </Container>
  ) : activeDocument.pages[activePage].file === null ? (
    <Container className={classes.docPreviewEmpty}>
      <ScannerPicker
        selectedScanner={selectedScanner}
        setSelectedScanner={setSelectedScanner}
        fetchScannersList={fetchScannersList}
        scannersList={scannersList}
      />
      <div className={classes.scanGroup}>
        <Tooltip label={t('view_document.view_page.scan_button_tooltip')}>
          <Button
            className={classes.scanButton}
            onClick={handleContinuousScan}
            size="xl"
            disabled={!scannersList.length}
          >
            <VisuallyHidden>{t('view_document.view_page.scan_button_tooltip')}</VisuallyHidden>
            {t('view_document.view_page.scan_button')}
          </Button>
        </Tooltip>
        <Tooltip label={t('view_document.view_page.scan_with_break_button_tooltip')}>
          <Button
            className={classes.autoScanButton}
            onClick={handleScanWithBreak}
            size="xl"
            disabled={!scannersList.length}
          >
            <VisuallyHidden>{t('view_document.view_page.scan_with_break_button_tooltip')}</VisuallyHidden>
            {t('view_document.view_page.auto_scan_button')}
          </Button>
        </Tooltip>
        <VisuallyHidden>
          {t('view_document.view_page.delay_selection_description', { scannersCount: scannersList.length })}
        </VisuallyHidden>
        <Menu onOpen={() => setOpened(true)} onClose={() => setOpened(false)} radius="md" width="target" withinPortal>
          <Menu.Target>
            <UnstyledButton h={60} className={classes.control} data-expanded={opened || undefined}>
              <span className={classes.label}>{scanDelay}s</span>
              <IconChevronDown size="1rem" className={classes.icon} stroke={1.5} />
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <ScrollArea h={150}>{items}</ScrollArea>
          </Menu.Dropdown>
        </Menu>
      </div>
      <Text>{t('view_document.view_page.or')}</Text>
      <FileButton onChange={setUploadedFile} accept="image/*,.pdf">
        {(props) => (
          <Button size="xl" {...props}>
            {t('view_document.view_page.upload_button')}
          </Button>
        )}
      </FileButton>
    </Container>
  ) : (
    <div className={classes.imageAndButtonDiv}>
      <Image
        src={activeDocument.pages[activePage].file}
        alt={t('view_document.view_page.image_description')}
        className={classes.imagePreview}
        tabIndex={0}
      />
      <Tooltip label={t('view_document.view_page.clear_button')}>
        <Button
          className={classes.rejectScannedDocument}
          size="xl"
          variant="transparent"
          onClick={handleClickRejectImage}
          color="red"
        >
          <IconX size={35}></IconX>
          <VisuallyHidden>{t('view_document.view_page.clear_button')}</VisuallyHidden>
        </Button>
      </Tooltip>
    </div>
  );
};

export { ViewPage };
