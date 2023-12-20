export type Document = {
  title: string;
  documentID?: number | null;
  pages: Page[];
};

export type Page = {
  pageID?: string | null;
  file?: string | null;
  brailleText?: BrailleText;
};

export type BrailleText = null | 'brailleTextAvailable' | 'recognitionCanceled' | 'recognitionInProgress';

export type UpdateDocumentAction = 'createDocument' | 'editTitle' | 'addPage' | 'editFile' | 'editBrailleText';
