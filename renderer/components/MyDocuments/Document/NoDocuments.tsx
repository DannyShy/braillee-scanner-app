import { Button } from '@mantine/core';
import classes from './NoDocuments.module.css';
import { Text } from '@mantine/core';
import React, { useEffect } from 'react';

type Props = { onCreateDocument: () => void };

const NoDocuments: React.FC<Props> = ({ onCreateDocument }) => {
  useEffect(() => {
    window.electronAPI.log('debug', 'NoDocuments component mounted.');
    return () => {
      window.electronAPI.log('debug', 'NoDocuments component unmounted.');
    };
  }, []);
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
