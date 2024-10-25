import { Text, Button, Title, Card, VisuallyHidden, Tooltip, Modal, SimpleGrid, Center, Flex } from '@mantine/core';
import React from 'react';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { Document } from '../../../types';
import classes from '../DocumentCard/DocumentCard.module.css';

type Props = {
  document: Document;
  onOpen: (document: Document) => void;
};

const DocumentCard: React.FC<Props> = ({ document, onOpen }) => {
  useLogMount('DocumentCard');
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  //opens the card
  const handleClickDocumentCard = () => {
    window.electronAPI.log('debug', `Document: ${document.documentID} clicked by user and set to active.`);
    onOpen(document);
  };

  const handleDeleteDocument = (document: Document) => {
    window.electronAPI.log('debug', `Document: ${document.documentID} deleted by user.`);
    window.electronAPI.deleteDocument(document.documentID!);
    // Fetch the updated list of documents
    window.electronAPI.readDocuments();
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
      <Tooltip label={t('document_card.hidden_delete_button')}>
        <Button
          className={classes.deleteDocumentButton}
          onClick={() => {
            open();
            window.electronAPI.log('debug', 'Modal for deletion of document opened.');
          }}
          variant="transparent"
          size="md"
          color="black"
        >
          <IconX></IconX>
          <VisuallyHidden>{t('document_card.hidden_delete_button')}</VisuallyHidden>
        </Button>
      </Tooltip>
      <Modal opened={opened} onClose={close} centered>
        <SimpleGrid>
          <Center>
            <Text className={classes.modalText} tabIndex={0}>
              {t('document_card.modal_text')}
            </Text>
          </Center>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'sm', sm: 'lg' }} justify={{ sm: 'center' }}>
            <Button
              onClick={() => {
                handleDeleteDocument(document);
                close();
                window.electronAPI.log('debug', 'Button for confirming deletion of document clicked in modal.');
              }}
            >
              {t('yes_button')}
            </Button>
            <Button
              onClick={() => {
                close();
                window.electronAPI.log('debug', 'Button for closing modal clicked.');
              }}
            >
              {t('no_button')}
            </Button>
          </Flex>
        </SimpleGrid>
      </Modal>
    </Card>
  );
};

export default DocumentCard;
