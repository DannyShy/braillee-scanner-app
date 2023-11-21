import React, { useEffect, useRef, useState } from 'react';
import classes from '../main/EditDocumentTitleComponent.module.css';
import { Button, TextInput } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

const EditDocumentTitleComponent = ({ pageContent, setEditTitleState, setPageContent, activeDocument }) => {
  const [value, setValue] = useState(pageContent.title);
  const ref = useRef(null);

  const handleClickConfirm = async () => {
    window.electronAPI.updateDocument(activeDocument, 'editTitle', value, null);
    window.electronAPI.readPages(activeDocument);
    await window.electronAPI.addPagesDataListener((pageData) => {
      setPageContent(pageData);
      window.electronAPI.removePagesDataListener();
    });

    setEditTitleState(false);
  };

  const handleClickReject = async () => {
    window.electronAPI.readPages(activeDocument);
    await window.electronAPI.addPagesDataListener((pageData) => {
      setPageContent(pageData);
      window.electronAPI.removePagesDataListener();
    });
    setValue(pageContent.title);
    setEditTitleState(false);
  };

  const handleFocus = (event) => {
    if (event.currentTarget.value === pageContent.title) {
      event.target.select();
    }
  };

  useEffect(() => {
    ref.current.focus();
  }, []);

  return (
    <div className={classes.editTitle}>
      <TextInput
        className={classes.textInput}
        ref={ref}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        onFocus={handleFocus}
        // onBlur={handleClickConfirm}
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
