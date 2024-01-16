import classes from './DocumentCards.module.css';
import { TextInput } from '@mantine/core';
import React, { useMemo, useState } from 'react';
import DocumentCardComponent from './DocumentCard/DocumentCard';
import { Document } from '../../types';
import useLogMount from 'hooks/useLogMount';

type Props = {
  documents: Document[];
  onOpen: (document: Document) => void;
};

const DocumentCards: React.FC<Props> = ({ documents, onOpen }) => {
  useLogMount('DocumentCards');
  const [searchTerm, setSearchTerm] = useState('');

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
      <DocumentCardComponent key={document.documentID} onOpen={onOpen} document={document} />
    ));
  };

  return (
    <div className={classes.cards}>
      <TextInput
        className={classes.searchDocument}
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className={classes.documentCardsWrapper}>
        <div className={classes.documentCards}>{renderDocumentCards()}</div>
      </div>
    </div>
  );
};

export default DocumentCards;
