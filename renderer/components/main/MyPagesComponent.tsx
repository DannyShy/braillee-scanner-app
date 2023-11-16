import React, { useEffect, useState } from 'react';
import classes from '../main/MyPagesComponent.module.css';
import { Button, Text, Container, Image } from '@mantine/core';
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
  const [clickedContainer, setClickedContainer] = useState(0);
  const handleReturnButtonClick = () => {
    updateDocsState(false);
  };

  const handleAddPage = async () => {
    window.electronAPI.updateDocument(1699949242679, 'addPage');
    window.electronAPI.readPages(1699949242679);
    await window.electronAPI.addPagesDataListener((pageData) => {
      setPageContent(pageData);
      window.electronAPI.removePagesDataListener();
    });
  };

  const renderTopLine = () => {
    if (editTitleState) {
      return (
        <EditDocumentTitleComponent
          pageContent={pageContent}
          setEditTitleState={setEditTitleState}
          setPageContent={setPageContent}
        />
      );
    } else {
      return <DocumentTitleComponent setEditTitleState={setEditTitleState} pageContent={pageContent} />;
    }
  };

  const renderMiniPages = () => {
    if (pageContent !== emptyDocumentData) {
      return pageContent.pages.map((page, index) => (
        <Container
          key={index}
          className={` ${clickedContainer === index ? `${classes.scannedDocClicked}` : `${classes.scannedDoc}`} `}
          onClick={() => setClickedContainer(index)}
        >
          <p>Page {index + 1}</p>
        </Container>
      ));
    } else {
      return null;
    }
  };

  const renderPagePreview = () => {
    if (pageContent.pages[clickedContainer].file === null) {
      return (
        <Container className={classes.docPreview}>
          {/* <Text>Page {clickedContainer + 1}</Text> */}
          <Button>Scan</Button>
          <Text>or</Text>
          <Button>Upload file</Button>
        </Container>
      );
    } else {
      return (
        <Container className={classes.docPreview}>
          <Image src={pageContent.pages[clickedContainer].file} className={classes.imagePreview}></Image>
        </Container>
      );
    }
  };

  useEffect(() => {
    if (pageContent !== emptyDocumentData) {
      const maxIndex = pageContent.pages.reduce(
        (max, page, index) => (page.createdAt > pageContent.pages[max].createdAt ? index : max),
        0,
      );

      setClickedContainer(maxIndex);
    }
  }, [pageContent]);

  return (
    <div className={classes.main}>
      <div className={classes.topLine}>
        <Button className={classes.returnButton} size="md" variant="transparent" onClick={handleReturnButtonClick}>
          <IconArrowLeft></IconArrowLeft>
        </Button>
        <div> {renderTopLine()}</div>
      </div>
      <div className={classes.contentDiv}>
        <div className={classes.scannedDocsMiniAndPlus}>
          {renderMiniPages()}
          <Container className={classes.addDocButtonCont}>
            <Button className={classes.addDocButton} size="xl" variant="transparent" onClick={handleAddPage}>
              <IconPlus className={classes.iconPlus}></IconPlus>
            </Button>
          </Container>
        </div>
        <div className={classes.scannedDocs}>
          {renderPagePreview()}
          <div className={classes.translatedDocs}></div>
        </div>
      </div>
    </div>
  );
};

export default MyPagesComponent;
