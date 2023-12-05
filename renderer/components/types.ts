export type Document = {
  title: string;
  documentID?: number | null;
  pages: Page[];
};

export type Page = {
  pageID?: number | null;
  file?: string | null;
};
