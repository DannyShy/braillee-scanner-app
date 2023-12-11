import React, { useEffect, useState } from 'react';
import classes from '../ViewDocument/ViewDocumentComponent.module.css';
import { Button, Text, Container, Image, Tabs, Center, Loader } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import DocumentTitleComponent from './DocumentTitle/DocumentTitleComponent';
import { Document } from '../../../types';

type Props = {
  activeDocument: Document;
  onClose: () => void;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
};

const ViewDocumentComponent: React.FC<Props> = ({ activeDocument, onClose, onUpdate }) => {
  const [activePage, setActivePage] = useState<number>(0);
  const [scanInProgress, setScanInProgress] = useState<boolean>(false);
  const [scanOutputConfirmed, setScanOutputConfirmed] = useState<boolean>(true);

  //adds page and reads updated document
  const handleAddPage = async () => {
    onUpdate('addPage');
  };

  const handleScan = async () => {
    try {
      setScanInProgress(true);
      setScanOutputConfirmed(false);
      const scannedOutput = await window.electronAPI.scanFile();
      const formattedURI = 'file:///' + scannedOutput.replace(/\\/g, '/');
      onUpdate('editPage', formattedURI, activeDocument.pages[activePage].pageID);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickRejectScan = () => {
    onUpdate('editPage', null, activeDocument.pages[activePage].pageID);
  };

  const handleClickConfirmScan = () => {
    setScanOutputConfirmed(true);
  };

  const renderMiniPages = () => {
    return activeDocument.pages.map((page, index) => (
      <Container
        key={index}
        className={` ${activePage === index ? `${classes.scannedDocMiniClicked}` : `${classes.scannedDocMini}`} `}
        onClick={() => setActivePage(index)}
      >
        {activeDocument.pages[index].file ? (
          <Image src={activeDocument.pages[index].file} className={classes.miniImage}></Image>
        ) : null}
      </Container>
    ));
  };

  const renderPagePreview = () => {
    const fileValue = activeDocument.pages[activePage].file;
    return scanInProgress ? (
      <Center>
        <Loader color="blue" />
      </Center>
    ) : fileValue === null ? (
      <Container className={classes.docPreviewEmpty}>
        <Button onClick={handleScan}>Scan</Button>
        <Text>or</Text>
        <Button>Upload file</Button>
      </Container>
    ) : (
      <Container className={classes.docPreview}>
        <div className={classes.imageContainer}>
          <Image src={activeDocument.pages[activePage].file} className={classes.imagePreview} />
          <>
            {!scanOutputConfirmed ? (
              <div className={classes.buttonsContainer}>
                <Button
                  className={classes.editButton}
                  size="md"
                  variant="transparent"
                  color="green"
                  onClick={handleClickConfirmScan}
                >
                  <IconCheck></IconCheck>
                </Button>
                <Button
                  className={classes.editButton}
                  size="md"
                  variant="transparent"
                  onClick={handleClickRejectScan}
                  color="red"
                >
                  <IconX></IconX>
                </Button>
              </div>
            ) : null}
          </>
        </div>
      </Container>
    );
  };

  const maxIndex = activeDocument ? activeDocument.pages.length - 1 : 0;

  useEffect(() => {
    if (activeDocument.pages[activePage].file !== null) {
      setScanInProgress(false);
    }
  }, [activeDocument.pages[activePage].file]);

  // useEffect(() => {
  //   await window.electronAPI.readBraille(activeDocument.pages[activePage].file);
  // }, [activeDocument.pages[activePage].file]);

  // code below makes newest page focused once the number of pages changes
  useEffect(() => {
    setActivePage(maxIndex);
  }, [maxIndex]);

  return (
    <div className={classes.main}>
      <div className={classes.topLine}>
        <DocumentTitleComponent activeDocument={activeDocument} onUpdate={onUpdate} onClose={onClose} />
      </div>
      <div className={classes.contentDiv}>
        <div className={classes.scannedDocsMiniAndPlus}>
          <div className={classes.scannedDocumentsMini}>{renderMiniPages()}</div>
          <div className={classes.addDocButtonCont}>
            <Button className={classes.addDocButton} size="xl" variant="transparent" onClick={handleAddPage}>
              <IconPlus className={classes.iconPlus}></IconPlus>
            </Button>
          </div>
        </div>
        <div className={classes.scannedDocs}>
          {renderPagePreview()}
          <div className={classes.translatedDocs}>
            <Tabs defaultValue="unicode">
              <Tabs.List>
                <Tabs.Tab value="unicode">Unicode</Tabs.Tab>
                <Tabs.Tab value="text">Text</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="unicode">
                ⠠⠞⠑⠉⠓⠝⠕⠧⠊⠝⠅⠽ ⠠⠙⠕⠞⠗⠊⠎⠀⠤⠀⠃⠗⠁⠊⠇⠕⠧⠯ ⠠⠞⠑⠞⠗⠊⠎⠀⠏⠗⠑⠀⠃⠗⠁⠊⠇⠕⠧⠯ ⠗⠊⠁⠙⠕⠅ ⠠⠞⠕⠂⠀⠮⠑⠀⠎⠁⠀⠧⠀⠎⠬⠩⠁⠎⠝⠕⠎⠞⠊⠀⠧⠑⠸⠁
                ⠬⠎⠊⠇⠊⠁⠀⠧⠑⠝⠥⠚⠑⠀⠏⠗⠊⠎⠏⠾⠎⠕⠃⠕⠧⠁⠝⠊⠥ ⠏⠕⠩⠌⠞⠁⠩⠕⠧⠯⠉⠓⠀⠓⠊⠑⠗⠀⠁⠚ ⠝⠑⠧⠊⠙⠊⠁⠉⠊⠍⠀⠚⠑⠀⠋⠁⠝⠞⠁⠎⠞⠊⠉⠅⠡
                ⠎⠏⠗⠡⠧⠁⠂⠀⠅⠞⠕⠗⠬⠀⠎⠍⠑⠀⠥⠮⠀⠝⠁⠀⠞⠯⠉⠓⠞⠕ ⠎⠞⠗⠡⠝⠅⠁⠉⠓⠀⠕⠎⠇⠡⠧⠊⠇⠊⠲⠀⠠⠵⠁⠓⠨⠃⠊⠳ ⠎⠁⠀⠙⠕⠀⠵⠧⠥⠅⠕⠧⠀⠏⠗⠌⠃⠑⠓⠕⠧⠀⠁⠀⠓⠊⠑⠗
                ⠁⠀⠝⠑⠉⠓⠁⠳⠐⠎⠧⠕⠚⠥⠀⠋⠁⠝⠞⠡⠵⠊⠥⠀⠃⠇⠬⠙⠊⠳ ⠎⠏⠕⠇⠥⠀⠎⠀⠏⠗⠎⠞⠁⠍⠊⠀⠝⠁⠀⠅⠇⠡⠧⠑⠎⠝⠊⠉⠊ ⠚⠑⠀⠝⠁⠕⠵⠁⠚⠀⠙⠥⠱⠥⠀⠓⠗⠑⠚⠬⠉⠊
                ⠵⠡⠮⠊⠞⠕⠅⠲⠀⠠⠁⠚⠀⠧⠀⠍⠕⠃⠊⠇⠝⠯⠉⠓ ⠞⠑⠇⠑⠋⠪⠝⠕⠉⠓⠀⠝⠡⠍⠀⠥⠮⠀⠵⠁⠩⠌⠝⠁ ⠎⠧⠊⠞⠁⠳⠀⠝⠁⠀⠇⠑⠏⠱⠊⠑⠀⠩⠁⠎⠽⠂⠀⠁⠚⠀⠞⠥
                ⠓⠗⠽⠀⠏⠕⠍⠁⠇⠊⠩⠅⠽⠀⠏⠗⠊⠃⠬⠙⠁⠚⠬⠲⠀⠠⠚⠁ ⠎⠕⠍⠀⠧⠱⠁⠅⠀⠧⠹⠁⠅⠁⠀⠞⠊⠏⠥⠀⠕⠙
              </Tabs.Panel>
              <Tabs.Panel value="text">This is Text content</Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentComponent;
