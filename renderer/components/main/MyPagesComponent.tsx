import React, { useEffect, useState } from 'react';
import classes from '../main/MyPagesComponent.module.css';
import { Button, Text, Container, Image, Title, Tabs } from '@mantine/core';
import { IconArrowLeft, IconPencil, IconPlus } from '@tabler/icons-react';
import EditDocumentTitleComponent from './EditDocumentTitleComponent';
import { Document, MyPagesComponentProps } from './types';

const emptyDocumentData: Document = {
  title: 'New Document',
  createdAt: null,
  pages: [
    {
      createdAt: null,
      file: null,
    },
  ],
};

const MyPagesComponent: React.FC<MyPagesComponentProps> = ({ setDocsState, activeDocument }) => {
  // editTitleState serves for rendering EditDocumentTitleComponent
  const [editTitleState, setEditTitleState] = useState<boolean>(true);
  const [pageContent, setPageContent] = useState<Document>(emptyDocumentData);
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const handleReturnButtonClick = () => {
    setDocsState(false);
  };

  const handleAddPage = async () => {
    window.electronAPI.updateDocument(activeDocument, 'addPage');
    window.electronAPI.readPages(activeDocument);
    await window.electronAPI.addPagesDataListener((pageData) => {
      setPageContent(pageData);
      window.electronAPI.removePagesDataListener();
    });
  };

  const handleEditButtonClick = () => {
    setEditTitleState(true);
  };

  const renderTopLine = () => {
    if (editTitleState) {
      return (
        <EditDocumentTitleComponent
          pageContent={pageContent}
          setEditTitleState={setEditTitleState}
          setPageContent={setPageContent}
          activeDocument={activeDocument}
        />
      );
    } else {
      return (
        <>
          <Title className={classes.title} size="h2">
            {pageContent.title}
          </Title>
          <Button className={classes.editButton} size="md" variant="transparent" onClick={handleEditButtonClick}>
            <IconPencil></IconPencil>
          </Button>
        </>
      );
    }
  };

  const renderMiniPages = () => {
    return pageContent.pages.map((page, index) => (
      <Container
        key={index}
        className={` ${selectedPage === index ? `${classes.scannedDocMiniClicked}` : `${classes.scannedDocMini}`} `}
        onClick={() => setSelectedPage(index)}
      >
        {pageContent.pages[index].file ? (
          <Image src={pageContent.pages[index].file} className={classes.miniImage}></Image>
        ) : null}
      </Container>
    ));
  };

  const renderPagePreview = () => {
    if (pageContent.pages[selectedPage].file === null) {
      return (
        <Container className={classes.docPreviewEmpty}>
          <Button>Scan</Button>
          <Text>or</Text>
          <Button>Upload file</Button>
        </Container>
      );
    } else {
      return (
        <Container className={classes.docPreview}>
          <Image src={pageContent.pages[selectedPage].file} className={classes.imagePreview}></Image>
        </Container>
      );
    }
  };

  const maxIndex = pageContent.pages.reduce(
    (max, page, index) => (page.createdAt > pageContent.pages[max].createdAt ? index : max),
    0,
  );

  // code below makes newest page focused once the number of pages changes
  useEffect(() => {
    setSelectedPage(maxIndex);
  }, [maxIndex]);

  return (
    <div className={classes.main}>
      <div className={classes.topLine}>
        <Button className={classes.returnButton} size="md" variant="transparent" onClick={handleReturnButtonClick}>
          <IconArrowLeft></IconArrowLeft>
        </Button>
        {renderTopLine()}
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

export default MyPagesComponent;
