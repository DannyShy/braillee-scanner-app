import React, { useEffect, useRef, useState } from 'react';
import classes from '../EditDocumentTitle/EditDocumentTitleComponent.module.css';
import { Button, TextInput } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Document } from '../../../../types';

type Props = {
  setEditTitleState: (state: boolean) => void;
  activeDocument: Document;
  setDocuments: (array: Document[]) => void;
  documents: Document[];
  setActiveDocument: (document: Document) => void;
};

const EditDocumentTitleComponent: React.FC<Props> = ({
  setEditTitleState,
  setActiveDocument,
  activeDocument,
  setDocuments,
  documents,
}) => {
  const [value, setValue] = useState<string>(activeDocument.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 1. updates data, 2. read data, 3. sets data to be rendered accordingly, 4.exits editTitleState
  const handleClickConfirm = async () => {
    window.electronAPI.updateDocument(activeDocument.documentID, 'editTitle', value, null);
    const readDocumentsOutput = await window.electronAPI.readDocuments();
    setDocuments(readDocumentsOutput);
    const doc = documents.find((document) => {
      return document.documentID === activeDocument.documentID;
    });
    setActiveDocument(doc);
    setEditTitleState(false);
  };

  //returns original value to title and exits editTitleState
  const handleClickReject = async () => {
    setValue(activeDocument.title);
    setEditTitleState(false);
  };

  // makes selectAll effect in initual value of TextInput
  const handleFocus = (event) => {
    if (event.currentTarget.value === activeDocument.title) {
      event.target.select();
    }
  };
  // makes focus on TextInput
  useEffect(() => {
    titleInputRef.current.focus();
  }, []);

  return (
    <div className={classes.editTitle}>
      <TextInput
        className={classes.textInput}
        ref={titleInputRef}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        onFocus={handleFocus}
      />
      <div className={classes.topLineButtons}>
        <div>
          <Button
            className={classes.editButton}
            size="md"
            variant="transparent"
            onClick={handleClickConfirm}
            color="green"
          >
            <IconCheck></IconCheck>
          </Button>
        </div>
        <div>
          <Button
            className={classes.editButton}
            size="md"
            variant="transparent"
            onClick={handleClickReject}
            color="red"
          >
            <IconX></IconX>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditDocumentTitleComponent;
