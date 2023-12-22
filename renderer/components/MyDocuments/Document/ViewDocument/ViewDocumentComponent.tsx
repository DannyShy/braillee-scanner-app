import React, { useEffect, useState } from 'react';
import classes from '../ViewDocument/ViewDocumentComponent.module.css';
import { Button, Text, Container, Image, Tabs, Paper, Loader, Pagination, Tooltip, FileButton } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import DocumentTitleComponent from './DocumentTitle/DocumentTitleComponent';
import { Document } from '../../../types';
import MainContent from '@renderer/components/MainContent';

type Props = {
  activeDocument: Document;
  onClose: () => void;
};

const ViewDocumentComponent: React.FC<Props> = ({ activeDocument, onClose }) => {
  const [activePage, setActivePage] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File>(null);

  const onUpdate = async (action: string, data?: string, activePage?: number | string) => {
    window.electronAPI.updateDocument(action, activeDocument.documentID, data, activePage);
  };

  //adds page and reads updated document
  const handleAddPage = async () => {
    onUpdate('addPage');
  };

  const handleScan = async () => {
    try {
      await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
      const scannedOutput = await window.electronAPI.scanFile();
      const formattedURI = 'file:///' + scannedOutput.replace(/\\/g, '/');
      await onUpdate('editFile', formattedURI, activeDocument.pages[activePage].pageID);
      await onUpdate('editBrailleStatus', 'recognitionInProgress', activeDocument.pages[activePage].pageID);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickRejectScan = async () => {
    await onUpdate('editFile', null, activeDocument.pages[activePage].pageID);
    if (activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress') {
      window.electronAPI.cancelRecognition();
    }
    await onUpdate('editBrailleStatus', null, activeDocument.pages[activePage].pageID);
    await onUpdate('editBrailleText', null, activeDocument.pages[activePage].pageID);
  };

  const handleClickCancelRecognition = async () => {
    await window.electronAPI.cancelRecognition();
    await onUpdate('editBrailleStatus', 'recognitionCanceled', activeDocument.pages[activePage].pageID);
  };

  const handleUploadFile = async () => {
    const pathToUploadedFile = (uploadedFile as any).path;
    const correctedPathToFile = 'file:///' + pathToUploadedFile.replace(/\\/g, '/');
    await onUpdate('editFile', correctedPathToFile, activeDocument.pages[activePage].pageID);
    await onUpdate('editBrailleStatus', 'recognitionInProgress', activeDocument.pages[activePage].pageID);
    setUploadedFile(null);
  };

  // creates marked.brl file and updates value of page.brailleText to 'brailleTextAvailable'
  const handleRecognizeBraille = async () => {
    await window.electronAPI.recognizeBraille(
      activeDocument.pages[activePage].file,
      activeDocument.documentID,
      activeDocument.pages[activePage].pageID,
    );
  };

  const handleClickMiniPage = (index) => {
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
        {activeDocument.pages[index].file && activeDocument.pages[index].file !== 'scanInProgress' ? (
          <Image src={activeDocument.pages[index].file} className={classes.miniImage}></Image>
        ) : null}
      </Paper>
    ));
  };

  const renderPagePreview = () => {
    return activeDocument.pages[activePage].file === 'scanInProgress' ? (
      <Container className={classes.docPreviewEmpty}>
        <Loader color="blue" />
        <Text>Scan in progress...</Text>
      </Container>
    ) : activeDocument.pages[activePage].file === null ? (
      <Container className={classes.docPreviewEmpty}>
        <Button onClick={handleScan} size="xl">
          Scan
        </Button>
        <Text>or</Text>
        <FileButton onChange={setUploadedFile} accept="image/png,image/jpeg">
          {(props) => (
            <Button size="xl" {...props}>
              Upload file
            </Button>
          )}
        </FileButton>
      </Container>
    ) : (
      <div className={classes.imageAndButtonDiv}>
        <Image src={activeDocument.pages[activePage].file} className={classes.imagePreview} />
        <Tooltip label="Clear page">
          <Button
            className={classes.rejectScannedDocument}
            size="xl"
            variant="transparent"
            onClick={handleClickRejectScan}
            color="red"
          >
            <IconX size={35}></IconX>
          </Button>
        </Tooltip>
      </div>
    );
  };

  const renderRecognizedBraille = () => {
    return activeDocument.pages[activePage].brailleStatus === 'recognitionInProgress' ? (
      <div className={classes.brailleTextContainer}>
        <Tooltip label="Cancel recognition">
          <Button
            className={classes.cancelRecognition}
            size="xl"
            variant="transparent"
            onClick={handleClickCancelRecognition}
            color="red"
          >
            <IconX size={35}></IconX>
          </Button>
        </Tooltip>
        <Loader color="blue" />
        <Text>Recognition in progress...</Text>
      </div>
    ) : activeDocument.pages[activePage].brailleStatus === 'brailleTextAvailable' ? (
      activeDocument.pages[activePage].brailleText
    ) : null;
  };

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

  // updates the value of file in doccument after update of file
  useEffect(() => {
    if (uploadedFile) {
      handleUploadFile();
    }
  }, [uploadedFile]);

  const newestPageIndex = activeDocument ? activeDocument.pages.length - 1 : 0;

  // code below makes newest page focused once the number of pages changes
  useEffect(() => {
    setActivePage(newestPageIndex);
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
            </Button>
          </div>
        </div>
        <div className={classes.paginationWrapper}>
          <Pagination
            value={activePage + 1}
            total={activeDocument.pages.length}
            size="md"
            onChange={(page) => setActivePage(page - 1)}
            withEdges
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
              <Tabs.Panel value="unicode" className={classes.brailleText}>
                {renderRecognizedBraille()}
              </Tabs.Panel>
              <Tabs.Panel value="text">Coming soon...</Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </MainContent>
  );
};

export default ViewDocumentComponent;
