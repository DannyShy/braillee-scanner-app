import { Button } from '@mantine/core';
import classes from '../Document/EmptyComponent.module.css';
import { Text } from '@mantine/core';
import React from 'react';

type Props = { onCreateDocument: () => void };

const EmptyComponent: React.FC<Props> = ({ onCreateDocument }) => {
  return (
    <div className={classes.main}>
      <div className={classes.centeredDiv}>
        <Text className={classes.centeredText}>
          You have no documents. Use the button bellow to create your first document.
        </Text>
        <Button className={classes.createDocButtonCentered} variant="outline" radius="xs" onClick={onCreateDocument}>
          + Create Document
        </Button>
      </div>
    </div>
  );
};

export default EmptyComponent;
