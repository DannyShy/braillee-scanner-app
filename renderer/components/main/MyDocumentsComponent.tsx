import { Button, Title } from '@mantine/core';
import classes from '../main/MyDocumentsComponent.module.css';
import { Text } from '@mantine/core';
import React from 'react';

const MyDocumentsComponent = () => {
  return (
    <div className={classes.main}>
      <div className={classes.topLine}>
        <Title className={classes.title} size="h2">
          My Documents
        </Title>
        <Button className={classes.createDocButton} radius="xs">
          + Create Document
        </Button>
      </div>
      <div className={classes.centeredDiv}>
        <Text className={classes.centeredText}>
          You have no documents. Use the button bellow to create your first document.
        </Text>
        <Button className={classes.createDocButtonCentered} variant="outline" radius="xs">
          + Create Document
        </Button>
      </div>
    </div>
  );
};

export default MyDocumentsComponent;
