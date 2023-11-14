import React, { useState } from 'react';
import classes from '../main/EditDocumentTitleComponent.module.css';
import { Button, TextInput } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

const EditDocumentTitleComponent = ({ pageContent, setEditTitleState }) => {
  const [value, setValue] = useState('New Document');

  const handleClickConfirm = () => {
    window.electronAPI.updateDocument(1699949242679, 'editTitle', value, null);
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
