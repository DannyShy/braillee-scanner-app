import classes from '../DocumentCard/DocumentCard.module.css';
import { Text, Button, Title, Card, VisuallyHidden } from '@mantine/core';
import React from 'react';
import { Document } from '../../../types';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';

type Props = {
  document: Document;
  onOpen: (document: Document) => void;
};

const DocumentCard: React.FC<Props> = ({ document, onOpen }) => {
  useLogMount('DocumentCard');
  const { t } = useTranslation();
  //opens the card
  const handleClickDocumentCard = () => {
    window.electronAPI.log('debug', `Document: ${document.documentID} clicked by user and set to active.`);
    onOpen(document);
  };

  return (
    <Card className={classes.documentCard} withBorder radius="sm" padding="lg" shadow="sm">
      <div tabIndex={0}>
        <VisuallyHidden>
          {t('document_card.hidden_card_description', { title: document.title, pageCount: document.pages.length })}
        </VisuallyHidden>
        <Title className={classes.cardTitle} size="h4" aria-hidden="true">
          {document.title}
        </Title>
        <Text className={classes.cardText} c="dimmed" aria-hidden="true">
          {t('document_card.pages', { pageCount: document.pages.length })}
        </Text>
      </div>
      <Button
        key={document.documentID}
        className={classes.cardButton}
        onClick={handleClickDocumentCard}
        variant="light"
        size="md"
      >
        {t('document_card.open')}
        <VisuallyHidden>{t('document_card.hidden_document')}</VisuallyHidden>
      </Button>
    </Card>
  );
};

export default DocumentCard;
