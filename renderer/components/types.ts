export type Document = {
  title: string;
  documentID?: number | null;
  pages: Page[];
};

export type Page = {
  pageID?: string | null;
  file?: string | null;
  brailleStatus?: null | 'brailleTextAvailable' | 'recognitionCanceled' | 'recognitionInProgress';
  brailleText?: null | string;
};

export type LanguagePickerData = {
  label: string;
  image: string;
  description: string;
};
