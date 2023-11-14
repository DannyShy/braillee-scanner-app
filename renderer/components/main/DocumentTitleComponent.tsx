import React from 'react';
import classes from '../main/DocumentTitleComponent.module.css';
import { Button, Title } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

const DocumentTitleComponent = ({ setEditTitleState, pageContent }) => {
  const handleEditButtonClick = () => {
    setEditTitleState(true);
  };
  return (
    <>
      <Title className={classes.title} size="h2">
        {pageContent.title}
      </Title>
      <Button className={classes.editButton} size="md" variant="transparent" onClick={handleEditButtonClick}>
        <IconPencil></IconPencil>
      </Button>
    </>
  );
};

export default DocumentTitleComponent;
