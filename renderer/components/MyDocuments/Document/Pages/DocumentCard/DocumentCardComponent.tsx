import classes from '../DocumentCard/DocumentCardComponent.module.css';
import { Text, Button, Title, Card } from '@mantine/core';
import React from 'react';
import { Document } from '../../../../types';

type Props = {
  document: Document;
  setActiveDocument: (document: Document) => void;
};

const DocumentCardComponent: React.FC<Props> = ({ document, setActiveDocument }) => {
  //opens the card
  const handleClickDocumentCard = () => {
    setActiveDocument(document);
  };

  return (
    <Card className={classes.documentCard} withBorder radius="sm" padding="lg" shadow="sm">
      <Title className={classes.cardTitle} size="h4">
        {document.title}
      </Title>
      <Text>Pages: {document.pages.length}</Text>
      <Button
        key={document.documentID}
        className={classes.cardButton}
        onClick={handleClickDocumentCard}
        variant="default"
      >
        Open
      </Button>
    </Card>
  );
};

export default DocumentCardComponent;
