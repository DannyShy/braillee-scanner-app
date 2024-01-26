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

type Props = {
  activeDocument: Document;
  onClose: () => void;
};

const ViewDocument: React.FC<Props> = ({ activeDocument, onClose }) => {
  useLogMount('ViewDocument');
  const [activePage, setActivePage] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File>(null);

  const onUpdate = async (action: string, data?: string, activePage?: number | string) => {
    window.electronAPI.updateDocument(action, activeDocument.documentID, data, activePage);
  };

  //adds page and reads updated document
  const handleAddPage = async () => {
    window.electronAPI.log('debug', 'Add new page button clicked by user.');
    onUpdate('addPage');
  };

  const handleScan = async () => {
    try {
      window.electronAPI.log('debug', 'Scan button clicked by user.');
      await onUpdate('editFile', 'scanInProgress', activeDocument.pages[activePage].pageID);
      const scannedOutput = await window.electronAPI.scanFile(
        activeDocument.documentID,
        activeDocument.pages[activePage].pageID,
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
        <VisuallyHidden tabIndex={0}>Miniature of page {index + 1}.</VisuallyHidden>
        {activeDocument.pages[index].file && activeDocument.pages[index].file !== 'scanInProgress' ? (
          <div>
            <Image
              src={activeDocument.pages[index].file}
              className={classes.miniImage}
              alt="This contains uploaded or scanned data."
            ></Image>
          </div>
        ) : (
          <VisuallyHidden tabIndex={0}>This page is empty.</VisuallyHidden>
        )}
      </Paper>
    ));
  };

  const renderPagePreview = () => {
    return activeDocument.pages[activePage].file === 'scanInProgress' ? (
      <Container className={classes.docPreviewEmpty}>
        <Loader color="blue" />
        <Text tabIndex={0}>Scan in progress...</Text>
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
        <Image
          src={activeDocument.pages[activePage].file}
          alt="View of current page."
          className={classes.imagePreview}
          tabIndex={0}
        />
        <Tooltip label="Clear page">
          <Button
            className={classes.rejectScannedDocument}
            size="xl"
            variant="transparent"
            onClick={handleClickRejectScan}
            color="red"
          >
            <IconX size={35}></IconX>
            <VisuallyHidden>Clear page</VisuallyHidden>
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
            <VisuallyHidden>Cancel recognition</VisuallyHidden>
          </Button>
        </Tooltip>
        <Loader color="blue" />
        <Text tabIndex={0}>Recognition in progress...</Text>
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
              <VisuallyHidden>Add page</VisuallyHidden>
            </Button>
          </div>
        </div>
        <div className={classes.paginationWrapper}>
          <VisuallyHidden>
            Below is pagination component used to navigate through pages. Button number represents page number.
          </VisuallyHidden>
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
                Coming soon...
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </MainContent>
  );
};

export default ViewDocument;
