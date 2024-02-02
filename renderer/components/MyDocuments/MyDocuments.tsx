import DocumentCards from 'components/MyDocuments/Document/DocumentCards';
import { useEffect, useState } from 'react';
import classes from './MyDocuments.module.css';
import { Button, Title } from '@mantine/core';
import NoDocuments from 'components/MyDocuments/Document/NoDocuments';
import { Document } from '../types';
import ViewDocument from './Document/ViewDocument/ViewDocument';
import MainContent from '@renderer/components/MainContent';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';

const MyDocuments: React.FC = () => {
  useLogMount('MyDocuments');
  const { t } = useTranslation();
  // contains data from all documents
  const [documents, setDocuments] = useState<Document[]>(null);
  // contains data from active document
  const [activeDocument, setActiveDocument] = useState<Document>(null);

  const onCreateDocument = async () => {
    window.electronAPI.log('debug', 'Create new document clicked by user.');
    await window.electronAPI.updateDocument('createDocument');
    window.electronAPI.addCreatedDocumentListener((createdDocument) => {
      setActiveDocument(createdDocument);
      window.electronAPI.removeCreatedDocumentListener();
    });
  };

  const onClose = () => {
    setActiveDocument(null);
  };

  const onOpen = (document) => {
    window.electronAPI.log('debug', `Document: ${document.documentID} set to be activeDocument.`);
    setActiveDocument(document);
  };

  // getting inital data
  useEffect(() => {
    window.electronAPI.readDocuments();
  }, []);

  // mounting the listener
  useEffect(() => {
    window.electronAPI.addDocumentDataListener((newDocuments) => {
      setDocuments(newDocuments);
    });
    return () => {
      window.electronAPI.removeDocumentDataListener();
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

  return activeDocument ? (
    <ViewDocument activeDocument={activeDocument} onClose={onClose} />
  ) : (
    <MainContent
      header={
        <div className={classes.header}>
          <Title className={classes.title} size="h2" tabIndex={0}>
            {t('my_documents')}
          </Title>
          <Button className={classes.createDocButton} radius="sm" size="md" onClick={onCreateDocument} tabIndex={0}>
            + {t('create_document')}
          </Button>
        </div>
      }
    >
      {documents?.length > 0 ? (
        <DocumentCards documents={documents} onOpen={onOpen} />
      ) : (
        <NoDocuments onCreateDocument={onCreateDocument} />
      )}
    </MainContent>
  );
};

export default MyDocuments;
