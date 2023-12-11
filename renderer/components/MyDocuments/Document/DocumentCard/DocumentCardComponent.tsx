import classes from '../DocumentCard/DocumentCardComponent.module.css';
import { Text, Button, Title, Card } from '@mantine/core';
import React from 'react';
import { Document } from '../../../types';

type Props = {
  document: Document;
  onOpen: (document: Document) => void;
};

const DocumentCardComponent: React.FC<Props> = ({ document, onOpen }) => {
  //opens the card
  const handleClickDocumentCard = () => {
    onOpen(document);
  };

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

export default DocumentCardComponent;
