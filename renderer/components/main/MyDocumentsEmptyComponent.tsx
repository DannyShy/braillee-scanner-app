import { Button, Title } from '@mantine/core';
import classes from '../main/MyDocumentsEmptyComponent.module.css';
import { Text } from '@mantine/core';
import React from 'react';

const MyDocumentsEmptyComponent = ({ updateDocsState, setActiveDocument }) => {
  const handleCreateDocButtonClick = async () => {
    window.electronAPI.createDocument();
    await window.electronAPI.addDocDataListener((docUnixTimeStamp) => {
      setActiveDocument(docUnixTimeStamp);
      window.electronAPI.removeDocDataListener();
    });
    updateDocsState(true);
  };

  return (
    <div className={classes.main}>
      <div className={classes.topLine}>
        <Title className={classes.title} size="h2">
          My Documents
        </Title>
        <Button className={classes.createDocButton} radius="xs" onClick={handleCreateDocButtonClick}>
          + Create Document
        </Button>
      </div>
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

export default MyDocumentsEmptyComponent;
