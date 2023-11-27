export type Document = {
  title: string;
  documentID?: number | null;
  pages: Page[];
};

export type Page = {
  pageID?: number | null;
  file?: string | null;
};

export type MyPagesComponentProps = {
  setDocsState: (state: boolean) => void;
  activeDocument: number;
};

export type MyDocumentsEmptyComponentProps = {
  setDocsState: (state: boolean) => void;
  setActiveDocument: (document: number) => void;
};

export type EditDocumentTitleComponentProps = {
  pageContent: Document;
  setEditTitleState: (state: boolean) => void;
  setPageContent: (content: Document) => void;
  activeDocument: number;
};
