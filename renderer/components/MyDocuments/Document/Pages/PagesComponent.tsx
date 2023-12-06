import React, { useEffect, useState } from 'react';
import classes from '../Pages/PagesComponent.module.css';
import { Button, Text, Container, Image, Title, Tabs } from '@mantine/core';
import { IconArrowLeft, IconPencil, IconPlus } from '@tabler/icons-react';
import EditDocumentTitleComponent from './EditDocumentTitle/EditDocumentTitleComponent';
import { Document } from '../../../types';
import { emptyDocumentData } from '../../../constants';

type Props = {
  setActiveDocument: (document: Document) => void;
  activeDocument: Document;
  setDocuments: (array: Document[]) => void;
  documents: Document[];
  editTitleState: boolean;
  setEditTitleState: (state: boolean) => void;
};

const PagesComponent: React.FC<Props> = ({
  setDocuments,
  activeDocument,
  setActiveDocument,
  documents,
  editTitleState,
  setEditTitleState,
}) => {
  const [selectedPage, setSelectedPage] = useState<number>(0);

  //adds page and reads updated document
  const handleAddPage = async () => {
    window.electronAPI.updateDocument(activeDocument.documentID, 'addPage');
    const documents = await window.electronAPI.readDocuments();
    setDocuments(documents);
  };

  const handleEditButtonClick = () => {
    setEditTitleState(true);
  };

  const renderTopLine = () => {
    if (editTitleState) {
      return (
        <EditDocumentTitleComponent
          activeDocument={activeDocument}
          setActiveDocument={setActiveDocument}
          setEditTitleState={setEditTitleState}
          setDocuments={setDocuments}
          documents={documents}
        />
      );
    } else {
      return (
        <>
          <Title className={classes.title} size="h2">
            {activeDocument.title}
          </Title>
          <Button className={classes.editButton} size="md" variant="transparent" onClick={handleEditButtonClick}>
            <IconPencil></IconPencil>
          </Button>
        </>
      );
    }
  };

  const renderMiniPages = () => {
    return activeDocument.pages.map((page, index) => (
      <Container
        key={index}
        className={` ${selectedPage === index ? `${classes.scannedDocMiniClicked}` : `${classes.scannedDocMini}`} `}
        onClick={() => setSelectedPage(index)}
      >
        {activeDocument.pages[index].file ? (
          <Image src={activeDocument.pages[index].file} className={classes.miniImage}></Image>
        ) : null}
      </Container>
    ));
  };

  const renderPagePreview = () => {
    const fileValue = activeDocument.pages[selectedPage].file;
    if (fileValue === null) {
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
          <Image src={activeDocument.pages[selectedPage].file} className={classes.imagePreview}></Image>
        </Container>
      );
    }
  };

  const handleReturnButtonClick = () => {
    setActiveDocument(emptyDocumentData);
  };

  // updates the value of activeDocument variable after change of its data
  useEffect(() => {
    const doc = documents.find((document) => {
      return document.documentID === activeDocument.documentID;
    });
    setActiveDocument(doc);
  }, [documents]);

  const maxIndex = activeDocument ? activeDocument.pages.length - 1 : 0;

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

export default PagesComponent;
