import { Button } from '@mantine/core';
import classes from '../Document/EmptyComponent.module.css';
import { Text } from '@mantine/core';
import React, { useEffect, useRef } from 'react';
import { Document } from '../../types';

type Props = {
  setDocsState: (state: boolean) => void;
  setActiveDocument: (document: Document) => void;
  setEditTitleState: (state: boolean) => void;
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
};

const EmptyComponent: React.FC<Props> = ({
  setDocsState,
  setActiveDocument,
  setEditTitleState,
  documents,
  setDocuments,
}) => {
  const newDocumentIDRef = useRef(null);

  const handleCreateDocButtonClick = async () => {
    await window.electronAPI.createDocument();
    await window.electronAPI.addCreatedDocumentDataListener((newDocumentID, newDocuments) => {
      newDocumentIDRef.current = newDocumentID;
      setDocuments(newDocuments);
      window.electronAPI.removeCreatedDocumentDataListener();
    });
    setEditTitleState(true);
  };

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
    <div className={classes.main}>
      <div className={classes.centeredDiv}>
        <Text className={classes.centeredText}>
          You have no documents. Use the button bellow to create your first document.
        </Text>
        <Button
          className={classes.createDocButtonCentered}
          variant="outline"
          radius="xs"
          onClick={handleCreateDocButtonClick}
        >
          + Create Document
        </Button>
      </div>
    </div>
  );
};

export default EmptyComponent;
