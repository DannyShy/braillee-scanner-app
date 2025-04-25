export type Document = {
  title: string;
  documentID?: number | null;
  translationLanguage: null | string;
  pages: Page[];
};

export type Page = {
  pageID?: string | null;
  file?: string | null;
  brailleStatus?: BrailleStatus;
  brailleText?: null | string;
  translatedTextStatus?: TranslatedTextStatus;
  translation: null | string;
};

export type BrailleStatus = null | 'brailleTextAvailable' | 'recognitionCanceled' | 'recognitionInProgress';
export type TranslatedTextStatus = null | 'translatedTextAvailable';

export type LanguagePickerData = {
  label: string;
  image: string;
  description: string;
};

export type ScannerPaperSource = 'Glass' | 'Feeder';
