export type Document = {
  title: string;
  documentID?: number | null;
  pages: Page[];
};

export type Page = {
  pageID?: string | null;
  file?: string | null;
  brailleStatus?: BrailleStatus;
  brailleText?: null | string;
  translatedTextStatus?: TranslatedTextStatus;
  translations: {
    slovak: null | string;
  };
};

export type BrailleStatus = null | 'brailleTextAvailable' | 'recognitionCanceled' | 'recognitionInProgress';
export type TranslatedTextStatus = null | 'translatedTextAvailable';

export type LanguagePickerData = {
  label: string;
  image: string;
  description: string;
};
