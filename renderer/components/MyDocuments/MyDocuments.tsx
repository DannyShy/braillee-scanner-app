import CardsComponent from './Document/CardsComponent';
import { useEffect, useState } from 'react';
import classes from '../MyDocuments/MyDocuments.module.css';
import { Button, Title } from '@mantine/core';
import PagesComponent from './Document/Pages/PagesComponent';
import EmptyComponent from './Document/EmptyComponent';
import { Document } from '../types';
import { emptyDocumentData } from '../constants';

const MyDocuments: React.FC = () => {
  // says if we have at least 1 document saved in memory
  const [docsState, setDocsState] = useState<boolean>(false);
  // contains data from all documents
  const [documents, setDocuments] = useState<Document[]>(null);
  // contains data from active document
  const [activeDocument, setActiveDocument] = useState<Document>(emptyDocumentData);
  // editTitleState serves for rendering EditDocumentTitleComponent
  const [editTitleState, setEditTitleState] = useState<boolean>(false);

  const handleCreateDocButtonClick = async () => {
    const createdDocument = await window.electronAPI.createDocument();
    setActiveDocument(createdDocument);
    setEditTitleState(true);
  };

  // getting inital data
  useEffect(() => {
    const loadDocuments = async () => {
      const documents = await window.electronAPI.readDocuments();
      setDocuments(documents);
    };
    void loadDocuments();
  }, []);

  // mounting the listener
  useEffect(() => {
    window.electronAPI.addCreatedDocumentDataListener((newDocuments) => {
      setDocuments(newDocuments);
    });
    return () => {
      window.electronAPI.removeCreatedDocumentDataListener();
    };
  }, []);

  useEffect(() => {
    // setting DocsState
    if (documents !== null) {
      setDocsState(true);
    }
  }, [documents]);

  return (
    <div className={classes.myDocuments}>
      {activeDocument === emptyDocumentData && (
        <>
          <div className={classes.header}>
            <Title className={classes.title} size="h2">
              My Documents
            </Title>
            <Button className={classes.createDocButton} radius="xs" onClick={handleCreateDocButtonClick}>
              + Create Document
            </Button>
          </div>
          <>
            {docsState ? (
              <CardsComponent documents={documents} setActiveDocument={setActiveDocument} />
            ) : (
              <EmptyComponent onCreateDocument={handleCreateDocButtonClick} />
            )}
          </>
        </>
      )}
      {activeDocument !== emptyDocumentData ? (
        <PagesComponent
          setActiveDocument={setActiveDocument}
          activeDocument={activeDocument}
          setDocuments={setDocuments}
          documents={documents}
          editTitleState={editTitleState}
          setEditTitleState={setEditTitleState}
        />
      ) : null}
    </div>
  );
};

export default MyDocuments;
