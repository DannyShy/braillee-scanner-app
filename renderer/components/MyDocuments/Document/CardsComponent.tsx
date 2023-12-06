import classes from '../Document/CardsComponent.module.css';
import { TextInput } from '@mantine/core';
import React, { useState } from 'react';
import DocumentCardComponent from './Pages/DocumentCard/DocumentCardComponent';
import { Document } from '../../types';

type Props = {
  documents: Document[];
  setActiveDocument: (document: Document) => void;
};

const CardsComponent: React.FC<Props> = ({ documents, setActiveDocument }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<Document[]>(documents);

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value.toLowerCase());
    // Filter files based on the search term
    const filtered = documents.filter((document) => document.title.toLowerCase().includes(value));
    setFilteredFiles(filtered);
  };

  const renderDocumentCards = () => {
    return filteredFiles.map((document, index) => (
      <DocumentCardComponent key={document.documentID} setActiveDocument={setActiveDocument} document={document} />
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

export default CardsComponent;
