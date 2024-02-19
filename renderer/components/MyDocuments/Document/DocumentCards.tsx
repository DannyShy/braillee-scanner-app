import classes from './DocumentCards.module.css';
import { TextInput, Notification } from '@mantine/core';
import React, { useMemo, useState, useEffect } from 'react';
import DocumentCard from './DocumentCard/DocumentCard';
import { Document } from '../../types';
import useLogMount from 'hooks/useLogMount';
import { useTranslation } from 'react-i18next';
import { IconX, IconCheck } from '@tabler/icons-react';

type Props = {
  documents: Document[];
  onOpen: (document: Document) => void;
};

const DocumentCards: React.FC<Props> = ({ documents, onOpen }) => {
  useLogMount('DocumentCards');
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletionSuccessful, setDeletionSuccessful] = useState<null | boolean>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  // Filter documents based on the search term
  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => document.title.toLowerCase().includes(searchTerm));
  }, [documents, searchTerm]);

  // changing searchTerm based on value of textFieldInput
  const handleSearchChange = (event) => {
    const { value } = event.target;
    window.electronAPI.log('info', `Searched term in DocumentCards component is: ${searchTerm}.`);
    setSearchTerm(value.toLowerCase());
  };

  const renderDocumentCards = () => {
    return filteredDocuments.map((document, index) => (
      <DocumentCard key={document.documentID} onOpen={onOpen} document={document} />
    ));
  };

  const xIcon = <IconX style={{ width: 20, height: 20 }} />;
  const checkIcon = <IconCheck style={{ width: 20, height: 20 }} />;

  useEffect(() => {
    window.electronAPI.addDeleteDocumentStatusListener((deletionStatus, error) => {
      setDeletionSuccessful(deletionStatus);
      setErrorMessage(error);
      setTimeout(() => {
        setDeletionSuccessful(null);
      }, 5000);
    });
    return () => {
      window.electronAPI.removeDeleteDocumentStatusListener();
    };
  }, []);

  return (
    <div className={classes.cards}>
      <TextInput
        className={classes.searchDocument}
        placeholder={t('document_cards.search_bar')}
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className={classes.documentCardsWrapper}>
        <div className={classes.documentCards}>
          {renderDocumentCards()}
          {deletionSuccessful === false && errorMessage && (
            <Notification
              className={classes.notification}
              icon={xIcon}
              color="red"
              aria-live="polite"
              title={t('document_cards.deletion_error.notification_title')}
              onClose={() => {
                setErrorMessage(null);
              }}
              closeButtonProps={{ 'aria-label': t('document_cards.close_button') }}
            >
              {t('document_cards.deletion_error.notification_text', { path: errorMessage })}
            </Notification>
          )}
          {deletionSuccessful === true && (
            <Notification
              className={classes.notification}
              icon={checkIcon}
              color="teal"
              aria-live="polite"
              title={t('document_cards.deletion_success.notification_title')}
              onClose={() => {
                setDeletionSuccessful(null);
              }}
              closeButtonProps={{ 'aria-label': t('document_cards.close_button') }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCards;
