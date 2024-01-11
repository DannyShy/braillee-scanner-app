import classes from '../DocumentCard/DocumentCard.module.css';
import { Text, Button, Title, Card } from '@mantine/core';
import React, { useEffect } from 'react';
import { Document } from '../../../types';

type Props = {
  document: Document;
  onOpen: (document: Document) => void;
};

const DocumentCard: React.FC<Props> = ({ document, onOpen }) => {
  //opens the card
  const handleClickDocumentCard = () => {
    window.electronAPI.log('debug', `Document: ${document.documentID} clicked by user and set to active.`);
    onOpen(document);
  };

  useEffect(() => {
    window.electronAPI.log('debug', 'DocumentCard component mounted.');
    return () => {
      window.electronAPI.log('debug', 'DocumentCard component unmounted.');
    };
  }, []);

  return (
    <Card className={classes.documentCard} withBorder radius="sm" padding="lg" shadow="sm">
      <Title className={classes.cardTitle} size="h4">
        {document.title}
      </Title>
      <Text c="dimmed">Pages: {document.pages.length}</Text>
      <Button
        key={document.documentID}
        className={classes.cardButton}
        onClick={handleClickDocumentCard}
        variant="light"
        size="md"
      >
        Open
      </Button>
    </Card>
  );
};

export default DocumentCard;
