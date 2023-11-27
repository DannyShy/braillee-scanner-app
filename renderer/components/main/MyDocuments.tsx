import MyDocumentsEmptyComponent from './MyDocumentsEmptyComponent';
import MyPagesComponent from './MyPagesComponent';
import { useState } from 'react';

const MyDocuments: React.FC = () => {
  const [docsState, setDocsState] = useState<boolean>(false);
  const [activeDocument, setActiveDocument] = useState<number>(null);

  if (docsState) {
    return <MyPagesComponent setDocsState={setDocsState} activeDocument={activeDocument} />;
  } else {
    return <MyDocumentsEmptyComponent setDocsState={setDocsState} setActiveDocument={setActiveDocument} />;
  }
};

export default MyDocuments;
