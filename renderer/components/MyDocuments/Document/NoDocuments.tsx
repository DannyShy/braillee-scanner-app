import { Button } from '@mantine/core';
import classes from './NoDocuments.module.css';
import { Text } from '@mantine/core';
import React from 'react';
import useLogMount from 'hooks/useLogMount';

type Props = { onCreateDocument: () => void };

const NoDocuments: React.FC<Props> = ({ onCreateDocument }) => {
  useLogMount('NoDocuments');
  return (
    <div className={classes.main}>
      <div className={classes.centeredDiv}>
        <Text className={classes.centeredText}>
          You have no documents. Use the button bellow to create your first document.
        </Text>
        <Button
          className={classes.createDocButtonCentered}
          variant="outline"
          radius="sm"
          size="lg"
          onClick={onCreateDocument}
        >
          + Create Document
        </Button>
      </div>
    </div>
  );
};

export default NoDocuments;
