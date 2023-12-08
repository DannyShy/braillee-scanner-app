import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import fs from 'fs';
import { mkdirSync } from 'original-fs';
import { BrowserWindow } from 'electron';
import { Document } from './types';
import * as crypto from 'node:crypto';

const getDocPathFromDocID = (documentID: number | string): string => {
  return path.resolve(MY_DOCUMENTS_PATH, String(documentID), 'document.json');
};

const getJsonFromFile = (documentID: number | string): Document => {
  const documentPath = getDocPathFromDocID(documentID);
  const buffferData = fs.readFileSync(documentPath);
  const stringData = buffferData.toString();
  const jsonData = JSON.parse(stringData);
  return jsonData;
};

const writeJsonToFile = (jsonData: Document, documentID: number | string): void => {
  const jsonStringifiedData = JSON.stringify(jsonData);
  fs.writeFileSync(getDocPathFromDocID(documentID), jsonStringifiedData);
};

const performUpdateDocument = (
  documentID: number | string,
  action: string,
  data: string,
  pageID: number | string,
): void => {
  // based on unix time stamp number folder is found.
  // property which is to be updated needs to be defined
  // new value has to be defined.
  const jsonData = getJsonFromFile(documentID);
  switch (action) {
    case 'editTitle':
      jsonData.title = data;
      break;
    case 'addPage':
      const newPage = {
        pageID: crypto.randomUUID(),
        file: null,
      };
      jsonData.pages.push(newPage);
      break;
    case 'editPage':
      const pageIndex = jsonData.pages.findIndex((page) => page.pageID === pageID);
      if (pageIndex !== -1) {
        jsonData.pages[pageIndex].file = data;
      }
      break;
  }
  writeJsonToFile(jsonData, documentID);
};

// creates document folder, creates content of file, creates json file
const performCreateDocument = (mainWindow: BrowserWindow): Document => {
  if (!fs.existsSync(MY_DOCUMENTS_PATH)) {
    mkdirSync(MY_DOCUMENTS_PATH);
  }
  //creating unix timestamp file
  const documentID = Date.now();
  mkdirSync(path.resolve(MY_DOCUMENTS_PATH, String(documentID)));
  const documentData: Document = {
    title: 'New Document',
    documentID: documentID,
    pages: [
      {
        pageID: crypto.randomUUID(),
        file: null,
      },
    ],
  };
  writeJsonToFile(documentData, documentID);

  const documents = performReadDocuments();

  mainWindow.webContents.send('create-doc-output', documents);

  return documentData;
};

// 1. read folder content and make array of its folders.
// 2. create documents array
// 3. read content of each folder and append its content to supper array
// 4. repeat that using for each loop
// 5. returns documents array
const performReadDocuments = (): Document[] => {
  let documents: Document[] = [];
  try {
    const files = fs.readdirSync(MY_DOCUMENTS_PATH);
    files.forEach((element) => {
      const jsonData = getJsonFromFile(element);
      documents.push(jsonData);
    });
  } catch (err) {
    console.error('Error reading directory synchronously:', err);
  }
  return documents;
};

export { performUpdateDocument, performCreateDocument, performReadDocuments };
