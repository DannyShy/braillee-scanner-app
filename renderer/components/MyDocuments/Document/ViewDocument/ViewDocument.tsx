import React, { useEffect, useState } from 'react';
import classes from '../ViewDocument/ViewDocument.module.css';
import {
  Button,
  Text,
  Container,
  Image,
  Tabs,
  Paper,
  Loader,
  Pagination,
  Tooltip,
  FileButton,
  VisuallyHidden,
} from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import DocumentTitleComponent from './DocumentTitle/DocumentTitle';
import { Document } from '../../../types';
import MainContent from '@renderer/components/MainContent';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';
import ScannerPicker from './ScannerPicker/ScannerPicker';

type Props = {
  activeDocument: Document;
  onClose: () => void;
};

const ViewDocument: React.FC<Props> = ({ activeDocument, onClose }) => {
  useLogMount('ViewDocument');
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File>(null);
  const [selectedScanner, setSelectedScanner] = useState<string | null>(null);
  const [scannersList, setScannersList] = useState<string[]>([]);

  const onUpdate = async (action: string, data?: string, activePage?: number | string) => {
    window.electronAPI.updateDocument(action, activeDocument.documentID, data, activePage);
  };

  const fetchScannersList = async () => {
    window.electronAPI.getScannersList();
    await window.electronAPI.addScannersListListener((scannersList) => {
      setScannersList(scannersList);
    });
  };

  //adds page and reads updated document
  const handleAddPage = async () => {
    window.electronAPI.log('debug', 'Add new page button clicked by user.');
    onUpdate('addPage');
  };

  const handleScan = async () => {
    try {
      window.electronAPI.log('debug', `Scan button clicked by user. Scanning with scanner: ${selectedScanner}.`);
      await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
      const scannedOutput = await window.electronAPI.scanFile(
        activeDocument.documentID,
        activeDocument.pages[activePage].pageID,
        selectedScanner,
      );
      const formattedURI = 'file:///' + scannedOutput.replace(/\\/g, '/');
      await onUpdate('editFile', formattedURI, activeDocument.pages[activePage].pageID);
      await onUpdate('editBrailleStatus', 'recognitionInProgress', activeDocument.pages[activePage].pageID);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickRejectScan = async () => {
    window.electronAPI.log('debug', 'Reject scan button clicked by user.');
    await onUpdate('editFile', null, activeDocument.pages[activePage].pageID);
    if (activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress') {
      window.electronAPI.cancelRecognition();
    }
    await onUpdate('editBrailleStatus', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editBrailleText', null, activeDocument.pages[activePage].pageID);
  };

  const handleClickCancelRecognition = async () => {
    window.electronAPI.log('debug', 'Cancel recognition button clicked by user.');
    await window.electronAPI.cancelRecognition();
    await onUpdate('editBrailleStatus', 'recognitionCanceled', activeDocument.pages[activePage].pageID);
  };

  const handleUploadFile = async () => {
    const pathToUploadedFile = (uploadedFile as any).path;
    const correctedPathToFile = 'file:///' + pathToUploadedFile.replace(/\\/g, '/');
    window.electronAPI.log('debug', `User uploaded file ${correctedPathToFile}.`);
    window.electronAPI.copyImage(correctedPathToFile, activeDocument.documentID);
    await onUpdate('editFile', correctedPathToFile, activeDocument.pages[activePage].pageID);
    await onUpdate('editBrailleStatus', 'recognitionInProgress', activeDocument.pages[activePage].pageID);
    setUploadedFile(null);
  };

  // creates marked.brl file and updates value of page.brailleText to 'brailleTextAvailable'
  const handleRecognizeBraille = async () => {
    window.electronAPI.log(
      'debug',
      `Sent request to background to recognize file ${activeDocument.pages[activePage].file}.`,
    );
    await window.electronAPI.recognizeBraille(
      activeDocument.pages[activePage].file,
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
    );
  };

  const handleClickMiniPage = (index) => {
    window.electronAPI.log(
      'debug',
      `User clicked on miniPage: ${activeDocument.pages[index].pageID} and set it to be active`,
    );
    setActivePage(index);
  };

  const renderMiniPages = () => {
    return activeDocument.pages.map((page, index) => (
      <Paper
        key={index}
        className={` ${activePage === index ? `${classes.scannedDocMiniClicked}` : `${classes.scannedDocMini}`} `}
        onClick={() => handleClickMiniPage(index)}
        withBorder
      >
        <VisuallyHidden tabIndex={0}>{t('view_document.mini_page_number', { pageIndex: index + 1 })}</VisuallyHidden>
        {activeDocument.pages[index].file && activeDocument.pages[index].file !== 'scanInProgress' ? (
          <div>
            <Image
              src={activeDocument.pages[index].file}
              className={classes.miniImage}
              alt={t('view_document.mini_page_description_filled')}
            ></Image>
          </div>
        ) : (
          <VisuallyHidden tabIndex={0}>{t('view_document.mini_page_description_empty')}</VisuallyHidden>
        )}
      </Paper>
    ));
  };

  const renderPagePreview = () => {
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
        <Button onClick={handleScan} size="xl">
          {t('view_document.scan_button')}
        </Button>
        <Text>{t('view_document.or')}</Text>
        <FileButton onChange={setUploadedFile} accept="image/png,image/jpeg">
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
            onClick={handleClickRejectScan}
            color="red"
          >
            <IconX size={35}></IconX>
            <VisuallyHidden>{t('view_document.clear_button')}</VisuallyHidden>
          </Button>
        </Tooltip>
      </div>
    );
  };

  const renderRecognizedBraille = () => {
    return activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress' ? (
      <div className={classes.brailleTextContainer}>
        <Tooltip label={t('view_document.cancel_recognition_button')}>
          <Button
            className={classes.cancelRecognition}
            size="xl"
            variant="transparent"
            onClick={handleClickCancelRecognition}
            color="red"
          >
            <IconX size={35}></IconX>
            <VisuallyHidden>{t('view_document.cancel_recognition_button')}</VisuallyHidden>
          </Button>
        </Tooltip>
        <Loader color="blue" />
        <Text tabIndex={0}>{t('view_document.recognition_runs')}</Text>
      </div>
    ) : activeDocument.pages[activePage].brailleStatus === 'brailleTextAvailable' ? (
      activeDocument.pages[activePage].brailleText
    ) : null;
  };

  const renderTranslatedText = () => {
    return activeDocument.pages[activePage].translatedTextStatus === 'translatedTextAvailable' &&
      activeDocument.pages[activePage].translations.slovak !== null ? (
      <Text tabIndex={0}>{activeDocument.pages[activePage].translations.slovak}</Text>
    ) : null;
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
      if (scannersList.includes(storedScanner)) {
        setSelectedScanner(storedScanner);
      } else if (scannersList.length > 0) {
        setSelectedScanner(scannersList[0]);
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

  // makes recognition (only if needed) and reads braille file
  useEffect(() => {
    if (
      activeDocument.pages[activePage].file &&
      activeDocument.pages[activePage].file !== 'scanInProgress' &&
      !activeDocument.pages[activePage].brailleStatus
    ) {
      handleRecognizeBraille();
    }
  }, [activeDocument?.pages[activePage]?.file, activePage, activeDocument.pages[activePage].brailleStatus]);

  // updates the value of file in document after update of file
  useEffect(() => {
    if (uploadedFile) {
      handleUploadFile();
    }
  }, [uploadedFile]);

  const newestPageIndex = activeDocument ? activeDocument.pages.length - 1 : 0;

  // code below makes newest page focused once the number of pages changes
  useEffect(() => {
    setActivePage(newestPageIndex);
    window.electronAPI.log(
      'debug',
      `Created Page: ${activeDocument.pages[newestPageIndex].pageID} and set it to be active.`,
    );
  }, [newestPageIndex]);

  return (
    <MainContent
      header={
        <div className={classes.topLine}>
          <DocumentTitleComponent activeDocument={activeDocument} onUpdate={onUpdate} onClose={onClose} />
        </div>
      }
    >
      <div className={classes.contentDiv}>
        <div className={classes.scannedDocsMiniAndPlus}>
          <div className={classes.scannedDocumentsMini}>{renderMiniPages()}</div>
          <div className={classes.addDocButtonCont}>
            <Button className={classes.addDocButton} size="xl" variant="transparent" onClick={handleAddPage}>
              <IconPlus className={classes.iconPlus}></IconPlus>
              <VisuallyHidden>{t('view_document.add_page')}</VisuallyHidden>
            </Button>
          </div>
        </div>
        <div className={classes.paginationWrapper}>
          <VisuallyHidden>{t('view_document.hidden_pagination_description')}</VisuallyHidden>
          <Pagination
            value={activePage + 1}
            total={activeDocument.pages.length}
            size="md"
            onChange={(page) => {
              setActivePage(page - 1);
              window.electronAPI.log(
                'debug',
                `Pagination clicked by user. This changes active page to: ${activeDocument.pages[page - 1].pageID}.`,
              );
            }}
            withEdges
            getControlProps={(control) => {
              switch (control) {
                case 'first':
                  return { 'aria-label': 'First page' };
                case 'previous':
                  return { 'aria-label': 'Previous page' };
                case 'next':
                  return { 'aria-label': 'Next page' };
                case 'last':
                  return { 'aria-label': 'Last page' };
                default:
                  return {};
              }
            }}
            getItemProps={(page) => ({
              'aria-label': `Page ${page}`,
            })}
          />
        </div>
        <div className={classes.scannedDocs}>
          {renderPagePreview()}
          <div className={classes.translatedDocs}>
            <Tabs defaultValue="unicode" className={classes.tab}>
              <Tabs.List>
                <Tabs.Tab value="unicode">Unicode</Tabs.Tab>
                <Tabs.Tab value="text">Text</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="unicode" className={classes.brailleText} tabIndex={0}>
                {renderRecognizedBraille()}
              </Tabs.Panel>
              <Tabs.Panel value="text" tabIndex={0}>
                {renderTranslatedText()}
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </MainContent>
  );
};

export default ViewDocument;
