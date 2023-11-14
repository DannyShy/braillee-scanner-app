import React, { useEffect, useState } from 'react';
import classes from '../main/MyPagesComponent.module.css';
import { Button, Text, Container } from '@mantine/core';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import DocumentTitleComponent from './DocumentTitleComponent';
import EditDocumentTitleComponent from './EditDocumentTitleComponent';

const emptyDocumentData = {
  title: 'New Document',
  createdAt: '',
  pages: [
    {
      createdAt: '',
      file: null,
    },
  ],
};

const MyPagesComponent = ({ updateDocsState }) => {
  // editTitleState serves for rendering EditDocumentTitleComponent
  const [editTitleState, setEditTitleState] = useState<boolean>(true);
  const [pageContent, setPageContent] = useState(emptyDocumentData);
  const handleReturnButtonClick = () => {
    updateDocsState(false);
  };

  const handleAddPage = () => {
    window.electronAPI.addPage(pageContent.createdAt);
  };

  window.onload = async () => {
    const readPagesOutput = await window.electronAPI.readPages('1699949242679');
    setPageContent(readPagesOutput);
    console.log(readPagesOutput);
  };

  const renderTopLine = () => {
    if (editTitleState) {
      return <EditDocumentTitleComponent pageContent={pageContent} setEditTitleState={setEditTitleState} />;
    } else {
      return <DocumentTitleComponent setEditTitleState={setEditTitleState} pageContent={pageContent} />;
    }
  };

  return (
    <div className={classes.main}>
      <div className={classes.topLine}>
        <Button className={classes.returnButton} size="md" variant="transparent" onClick={handleReturnButtonClick}>
          <IconArrowLeft></IconArrowLeft>{' '}
        </Button>
        <div> {renderTopLine()}</div>
      </div>
      <div className={classes.contentDiv}>
        <div className={classes.scannedDocsMini}>
          <Container className={classes.scannedDoc}> </Container>
          <Container className={classes.scannedDoc}> </Container>
          <Container className={classes.scannedDoc}> </Container>
          <Button className={classes.addDocButton} size="xl" variant="transparent" onClick={handleAddPage}>
            <IconPlus></IconPlus>
          </Button>
        </div>
        <div className={classes.scannedDocs}>
          <Container className={classes.docPreview}>
            <Text>cec</Text>
          </Container>
          <div className={classes.translatedDocs}></div>
        </div>
      </div>
    </div>
  );
};

export default MyPagesComponent;
