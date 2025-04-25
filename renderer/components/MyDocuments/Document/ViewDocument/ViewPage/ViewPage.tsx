import { useEffect, useRef, useState } from 'react';
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
  Radio,
  Group,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import useLogMount from 'hooks/useLogMount';
import { IconChevronDown, IconX } from '@tabler/icons-react';
import { Document, ScannerPaperSource } from '../../../../types';
import classes from '../ViewPage/ViewPage.module.css';
import { DEFAULT_SCAN_DELAY } from '../../../../../constants';
import ScannerPicker from './ScannerPicker/ScannerPicker';

type Props = {
  activeDocument: Document;
  activePage: number;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
  translationLanguage: string;
  onDelete: () => void;
};

const scanDelayValues: number[] = [0, 1, 3, 5, 10];

const ViewPage: React.FC<Props> = ({ activeDocument, activePage, onUpdate, onDelete, translationLanguage }) => {
  useLogMount('ViewPage');
  const { t } = useTranslation();
  const [selectedScanner, setSelectedScanner] = useState<string | null>(null);
  const [scannersList, setScannersList] = useState<string[]>([]);
  const [delayMenuOpened, setDelayMenuOpened] = useState<boolean>(false);
  const [scanDelay, setScanDelay] = useState<number>(DEFAULT_SCAN_DELAY);
  const [autoScanIsRunning, setAutoScanIsRunning] = useState<boolean>(false);
  const [uploadKey, setUploadKey] = useState<number>(0);
  const [scanSource, setScanSource] = useState<ScannerPaperSource>('Glass');
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(true);

  const activePageRef = useRef(activePage);
  const activeDocumentRef = useRef(activeDocument);
  const activeDocumentFile = activeDocument.pages[activePage].file;

  const fetchScannersList = async () => {
    setScannersList([]);
    await window.electronAPI.addScannersListListener((scannersList) => {
      const sanitizedScannerList = scannersList.filter((i) => i);
      setScannersList(sanitizedScannerList);
    });
    window.electronAPI.getScannersList();
  };
  const handleUploadFile = async (uploadedFile: File | null) => {
    if (!uploadedFile) {
      return;
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);

      window.electronAPI.log('debug', `User uploaded file ${uploadedFile.name}.`);
      window.electronAPI.processUploadedFile(
        fileBytes,
        uploadedFile.name,
        activeDocument.documentID,
        activeDocument.pages[activePage].pageID,
        translationLanguage,
      );

      // Reset the key to allow the same file to be selected again
      setUploadKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error handling file upload:', error);
      window.electronAPI.log('error', `Error uploading file: ${error}`);
    }
  };

  const handleScanSingle = async () => {
    window.electronAPI.log('debug', `Scan button clicked by user. Scanning with scanner: ${selectedScanner}.`);
    await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
    await window.electronAPI.scanFile(
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
      selectedScanner,
      scanSource,
      translationLanguage,
    );
  };

  const handleScanAuto = async () => {
    //render stop button instead of other buttons
    window.electronAPI.log('debug', `Auto scan button clicked by user. Scanning with scanner: ${selectedScanner}.`);
    setAutoScanIsRunning(true);
    await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
    await window.electronAPI.scanFile(
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
      selectedScanner,
      scanSource,
      translationLanguage,
    );
  };

  const handleStopScanAuto = async () => {
    setAutoScanIsRunning(false);
    window.electronAPI.log('debug', JSON.stringify(activeDocument.pages[activePage]));
    // remove only empty page
    if (!activeDocument.pages[activePage].file) {
      await onUpdate('editFile', null, activeDocument.pages[activePage].pageID);
    }
    window.electronAPI.log('debug', 'Auto scan stopped by user.');
  };

  const handleDeletePage = () => {
    window.electronAPI.log('debug', 'Delete page button clicked by user.');
    if (activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress') {
      window.electronAPI.cancelRecognition();
    }
    onDelete();
  };

  // run autoscan loop once the file of active page is available

  useEffect(() => {
    if (activeDocumentFile && activeDocumentFile !== 'scanInProgress' && autoScanIsRunning) {
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
  }, [activeDocumentFile]);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    activeDocumentRef.current = activeDocument;
  }, [activeDocument]);

  // get list of available scanners
  useEffect(() => {
    void fetchScannersList();
    return () => {
      window.electronAPI.removeScannersListListener();
    };
  }, []);

  // checks if the stored scanner is available
  useEffect(() => {
    const checkStoredScannerAvailability = async () => {
      const storedScanner = await window.electronAPI.getStoreValue('scanner');
      window.electronAPI.log('debug', `Available scanners: ${JSON.stringify(scannersList)}`);
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
    void checkStoredScannerAvailability();
  }, [scannersList]);

  // stores value of selectedScanner
  useEffect(() => {
    if (selectedScanner) {
      window.electronAPI.setStoreValue('scanner', selectedScanner);
    }
  }, [selectedScanner]);

  // checks if the stored scanDelay is available
  useEffect(() => {
    const checkStoredScanDelay = async () => {
      const storedScanDelay = await window.electronAPI.getStoreValue('scan-delay');
      if (storedScanDelay) setScanDelay(storedScanDelay);
    };
    void checkStoredScanDelay();
  }, []);

  // stores value of scanDelay
  useEffect(() => {
    window.electronAPI.setStoreValue('scan-delay', scanDelay);
  }, [scanDelay]);

  return (
    <div className={classes.viewPage}>
      {activeDocumentFile === 'scanInProgress' && !autoScanIsRunning ? (
        <Container className={classes.docPreviewEmpty}>
          <Loader color="blue" />
          <Text tabIndex={0}>{t('view_document.view_page.scan_runs')}</Text>
        </Container>
      ) : autoScanIsRunning ? (
        <Container className={classes.docPreviewEmpty}>
          <Loader color="blue" />
          <Text tabIndex={0}>{t('view_document.view_page.scan_runs')}</Text>
          <Button size="xl" color="red" onClick={handleStopScanAuto}>
            {t('view_document.view_page.stop_auto_scan')}
          </Button>
        </Container>
      ) : activeDocumentFile === null ? (
        <Container className={classes.docPreviewEmpty}>
          <ScannerPicker
            selectedScanner={selectedScanner}
            setSelectedScanner={setSelectedScanner}
            fetchScannersList={fetchScannersList}
            scannersList={scannersList}
          />
          <div className={classes.sourceGroup}>
            <Text className={classes.sourceLabel}>{t('view_document.view_page.source_selection_description')}</Text>
            <Group>
              <Radio
                label={t('view_document.view_page.source.Glass')}
                value="Glass"
                checked={scanSource === 'Glass'}
                onChange={() => {
                  setAutoScanEnabled(true);
                  setScanSource('Glass');
                }}
                classNames={{ labelWrapper: classes.radioButton }}
              />
              <Radio
                label={t('view_document.view_page.source.Feeder')}
                value="Feeder"
                checked={scanSource === 'Feeder'}
                onChange={() => {
                  setAutoScanEnabled(false);
                  setScanSource('Feeder');
                }}
                classNames={{ labelWrapper: classes.radioButton }}
              />
            </Group>
          </div>
          <div className={classes.scanGroup}>
            <Tooltip label={t('view_document.view_page.scan_button_tooltip')}>
              <Button
                className={classes.scanButton}
                onClick={handleScanSingle}
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
                onClick={handleScanAuto}
                size="xl"
                disabled={!scannersList.length || !autoScanEnabled}
              >
                <VisuallyHidden>{t('view_document.view_page.scan_with_break_button_tooltip')}</VisuallyHidden>
                {t('view_document.view_page.auto_scan_button')}
              </Button>
            </Tooltip>
            <VisuallyHidden>{t('view_document.view_page.delay_selection_description')}</VisuallyHidden>
            <Menu
              onOpen={() => setDelayMenuOpened(true)}
              onClose={() => setDelayMenuOpened(false)}
              radius="md"
              width="target"
              withinPortal
              disabled={!autoScanEnabled}
            >
              <Menu.Target>
                <UnstyledButton
                  h={60}
                  w={60}
                  className={classes.control}
                  data-expanded={delayMenuOpened || undefined}
                  disabled={!autoScanEnabled}
                >
                  <span className={classes.label}>{scanDelay}s</span>
                  <IconChevronDown size="1rem" className={classes.icon} stroke={1.5} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <ScrollArea h={150}>
                  {scanDelayValues.map((item) => (
                    <Menu.Item onClick={() => setScanDelay(item)} key={item}>
                      {item}s
                    </Menu.Item>
                  ))}
                </ScrollArea>
              </Menu.Dropdown>
            </Menu>
          </div>
          <Text>{t('view_document.view_page.or')}</Text>
          <FileButton onChange={handleUploadFile} accept="image/*,.pdf" key={uploadKey}>
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
            src={activeDocumentFile}
            alt={t('view_document.view_page.image_description')}
            className={classes.imagePreview}
            tabIndex={0}
          />
        </div>
      )}
      {!autoScanIsRunning && (
        <Tooltip label={t('view_document.view_page.clear_button')}>
          <Button
            className={classes.rejectScannedDocument}
            size="xl"
            variant="transparent"
            onClick={handleDeletePage}
            color="red"
          >
            <IconX size={35}></IconX>
            <VisuallyHidden>{t('view_document.view_page.clear_button')}</VisuallyHidden>
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export { ViewPage };
