import classes from '../DocumentCard/DocumentCard.module.css';
import { Text, Button, Title, Card, VisuallyHidden } from '@mantine/core';
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
      <div tabIndex={0}>
        <VisuallyHidden>
          Document card with document title: {document.title} which contains {document.pages.length} pages.
        </VisuallyHidden>
        <Title className={classes.cardTitle} size="h4" aria-hidden="true">
          {document.title}
        </Title>
        <Text className={classes.cardText} c="dimmed" aria-hidden="true">
          Pages: {document.pages.length}
        </Text>
      </div>
      <Button
        key={document.documentID}
        className={classes.cardButton}
        onClick={handleClickDocumentCard}
        variant="light"
        size="md"
      >
        Open
        <VisuallyHidden>Document</VisuallyHidden>
      </Button>
    </Card>
  );
};

export default DocumentCard;
