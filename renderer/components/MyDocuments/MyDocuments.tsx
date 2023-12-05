import CardsComponent from './Document/CardsComponent';
import { useEffect, useRef, useState } from 'react';
import classes from '../MyDocuments/MyDocuments.module.css';
import { Button, Title } from '@mantine/core';
import PagesComponent from './Document/Pages/PagesComponent';
import EmptyComponent from './Document/EmptyComponent';
import { Document } from '../types';
import { emptyDocumentData } from '../constants';

const readDocuments = async (setDocuments) => {
  window.electronAPI.readDocuments();
  await window.electronAPI.addDocumentsDataListener((documentsData) => {
    setDocuments(documentsData);
    window.electronAPI.removeDocumentsDataListener();
  });
};

const MyDocuments: React.FC = () => {
  // says if we have at least 1 document saved in memory
  const [docsState, setDocsState] = useState<boolean>(false);
  // contains data from all documents
  const [documents, setDocuments] = useState<Document[]>(null);
  // contains data from active document
  const [activeDocument, setActiveDocument] = useState<Document>(emptyDocumentData);
  // editTitleState serves for rendering EditDocumentTitleComponent
  const [editTitleState, setEditTitleState] = useState<boolean>(false);

  const newDocumentIDRef = useRef(null);

  const handleCreateDocButtonClick = async () => {
    await window.electronAPI.createDocument();
    await window.electronAPI.addCreatedDocumentDataListener((newDocumentID, newDocuments) => {
      newDocumentIDRef.current = newDocumentID;
      setDocuments(newDocuments);
      window.electronAPI.removeCreatedDocumentDataListener();
    });
  };

  // getting inital data
  useEffect(() => {
    (async () => {
      readDocuments(setDocuments);
    })();
  }, []);

  useEffect(() => {
    // setting DocsState
    if (documents !== null) {
      setDocsState(true);
    }
    //setting activeDocument in case of document creation
    if (newDocumentIDRef.current !== null) {
      const doc = documents.find((document) => {
        return document.documentID === newDocumentIDRef.current;
      });
      setActiveDocument(doc);
      newDocumentIDRef.current = null;
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
              <EmptyComponent
                setDocsState={setDocsState}
                setActiveDocument={setActiveDocument}
                setEditTitleState={setEditTitleState}
                documents={documents}
                setDocuments={setDocuments}
              />
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
