import React, { useState } from 'react';
import classes from '../main/EditDocumentTitleComponent.module.css';
import { Button, TextInput } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

const EditDocumentTitleComponent = ({ pageContent, setEditTitleState, setPageContent }) => {
  const [value, setValue] = useState('New Document');

  const handleClickConfirm = async () => {
    window.electronAPI.updateDocument(1699949242679, 'editTitle', value, null);
    window.electronAPI.readPages(1699949242679);
    await window.electronAPI.addPagesDataListener((pageData) => {
      setPageContent(pageData);
      window.electronAPI.removePagesDataListener();
    });
    setEditTitleState(false);
  };

  const handleClickReject = () => {
    setValue(pageContent.title);
  };

  const handleFocus = (event) => {
    if (event.currentTarget.value === pageContent.title) {
      event.target.select();
    }
  };

  return (
    <>
      <TextInput value={value} onChange={(event) => setValue(event.currentTarget.value)} onFocus={handleFocus} />
      <Button className={classes.editButton} size="md" variant="transparent" onClick={handleClickConfirm} color="green">
        <IconCheck></IconCheck>
      </Button>
      <Button className={classes.editButton} size="md" variant="transparent" onClick={handleClickReject} color="red">
        <IconX></IconX>
      </Button>
    </>
  );
};

export default EditDocumentTitleComponent;
