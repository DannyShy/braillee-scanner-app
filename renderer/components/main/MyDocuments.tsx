import MyDocumentsEmptyComponent from './MyDocumentsEmptyComponent';
import MyPagesComponent from './MyPagesComponent';
import { MyDocumentsProps } from './types';

const MyDocuments: React.FC<MyDocumentsProps> = ({ docsState, setDocsState, activeDocument, setActiveDocument }) => {
  if (docsState) {
    return <MyPagesComponent setDocsState={setDocsState} activeDocument={activeDocument} />;
  } else {
    return <MyDocumentsEmptyComponent setDocsState={setDocsState} setActiveDocument={setActiveDocument} />;
  }
};

export default MyDocuments;
