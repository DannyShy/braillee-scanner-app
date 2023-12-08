import OpenDocumentComponent from './Document/OpenDocumentComponent';
import { useEffect, useState } from 'react';
import classes from '../MyDocuments/MyDocuments.module.css';
import { Button, Title } from '@mantine/core';
import EmptyComponent from './Document/EmptyComponent';
import { Document } from '../types';
import ViewDocumentComponent from './Document/ViewDocument/ViewDocumentComponent';

const MyDocuments: React.FC = () => {
  // contains data from all documents
  const [documents, setDocuments] = useState<Document[]>(null);
  // contains data from active document
  const [activeDocument, setActiveDocument] = useState<Document>(null);

  const onCreateDocument = async () => {
    const createdDocument = await window.electronAPI.createDocument();
    setActiveDocument(createdDocument);
  };

  const onClose = () => {
    setActiveDocument(null);
  };

  const onOpen = (document) => {
    setActiveDocument(document);
  };

  const onUpdate = async (action: string, data?: string, activePage?: number | string) => {
    window.electronAPI.updateDocument(activeDocument.documentID, action, data, activePage);
    const documents = await window.electronAPI.readDocuments();
    setDocuments(documents);
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

  // updates the value of activeDocument variable after change of its data
  useEffect(() => {
    if (activeDocument) {
      const doc = documents.find((document) => {
        return document.documentID === activeDocument.documentID;
      });
      setActiveDocument(doc);
    }
  }, [documents]);

  return (
    <div className={classes.myDocuments}>
      {!activeDocument && (
        <>
          <div className={classes.header}>
            <Title className={classes.title} size="h2">
              My Documents
            </Title>
            <Button className={classes.createDocButton} radius="xs" onClick={onCreateDocument}>
              + Create Document
            </Button>
          </div>
          <>
            {documents !== null && documents.length ? (
              <OpenDocumentComponent documents={documents} onOpen={onOpen} />
            ) : (
              <EmptyComponent onCreateDocument={onCreateDocument} />
            )}
          </>
        </>
      )}
      {activeDocument ? (
        <ViewDocumentComponent activeDocument={activeDocument} onClose={onClose} onUpdate={onUpdate} />
      ) : null}
    </div>
  );
};

export default MyDocuments;
