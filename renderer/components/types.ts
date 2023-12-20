export type Document = {
  title: string;
  documentID?: number | null;
  pages: Page[];
};

export type Page = {
  pageID?: string | null;
  file?: string | null;
  brailleText?: null | 'brailleTextAvailable' | 'recognitionCanceled' | 'recognitionInProgress';
};
