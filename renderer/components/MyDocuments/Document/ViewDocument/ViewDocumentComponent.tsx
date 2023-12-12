import React, { useEffect, useState } from 'react';
import classes from '../ViewDocument/ViewDocumentComponent.module.css';
import { Button, Text, Container, Image, Tabs, Paper, Loader, Pagination, Tooltip } from '@mantine/core';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import DocumentTitleComponent from './DocumentTitle/DocumentTitleComponent';
import { Document } from '../../../types';
import MainContent from '@renderer/components/MainContent';

type Props = {
  activeDocument: Document;
  onClose: () => void;
  onUpdate: (action: string, data?: string, activePage?: number | string) => void;
};

const ViewDocumentComponent: React.FC<Props> = ({ activeDocument, onClose, onUpdate }) => {
  const [activePage, setActivePage] = useState<number>(0);
  const [scanInProgress, setScanInProgress] = useState<boolean>(false);

  //adds page and reads updated document
  const handleAddPage = async () => {
    onUpdate('addPage');
  };

  const handleScan = async () => {
    try {
      setScanInProgress(true);
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

  const renderMiniPages = () => {
    return activeDocument.pages.map((page, index) => (
      <Paper
        key={index}
        className={` ${activePage === index ? `${classes.scannedDocMiniClicked}` : `${classes.scannedDocMini}`} `}
        onClick={() => setActivePage(index)}
        withBorder
      >
        {activeDocument.pages[index].file ? (
          <Image src={activeDocument.pages[index].file} className={classes.miniImage}></Image>
        ) : null}
      </Paper>
    ));
  };

  const renderPagePreview = () => {
    const fileValue = activeDocument.pages[activePage].file;
    return scanInProgress ? (
      <Container className={classes.docPreviewEmpty}>
        <Loader color="blue" />
        <Text>Scan in progress...</Text>
      </Container>
    ) : fileValue === null ? (
      <Container className={classes.docPreviewEmpty}>
        <Button onClick={handleScan} size="xl">
          Scan
        </Button>
        <Text>or</Text>
        <Button size="xl">Upload file</Button>
      </Container>
    ) : (
      <div className={classes.imageAndButtonDiv}>
        <Image src={activeDocument.pages[activePage].file} className={classes.imagePreview} />
        <Tooltip label="Clear page">
          <Button
            className={classes.editButton}
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

  const maxIndex = activeDocument ? activeDocument.pages.length - 1 : 0;

  useEffect(() => {
    if (activeDocument.pages[activePage].file !== null) {
      setScanInProgress(false);
    }
  }, [activeDocument.pages[activePage].file]);

  // code below makes newest page focused once the number of pages changes
  useEffect(() => {
    setActivePage(maxIndex);
  }, [maxIndex]);

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
    </MainContent>
  );
};

export default ViewDocumentComponent;
