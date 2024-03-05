import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import fs from 'fs';
import { mkdirSync } from 'original-fs';
import { BrowserWindow } from 'electron';
import { BrailleStatus, Document, UpdateDocumentAction, TranslatedTextStatus } from './types';
import * as crypto from 'node:crypto';
import { logger } from '../logger';

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

const createDocumentData = (documentID): Document => {
  return {
    title: 'New Document',
    documentID: documentID,
    pages: [
      {
        pageID: crypto.randomUUID(),
        file: null,
        brailleStatus: null,
        brailleText: null,
        translatedTextStatus: null,
        translations: {
          slovak: null,
        },
      },
    ],
  };
};

// based on unix time stamp number folder is found.
// property which is to be updated needs to be defined
// new value has to be defined.
const performUpdateDocument = (
  mainWindow: BrowserWindow,
  action: UpdateDocumentAction,
  documentID?: number | string,
  data?: string | BrailleStatus,
  pageID?: number | string,
): Document => {
  let pageIndex;
  let jsonData: Document;
  if (documentID) {
    jsonData = getJsonFromFile(documentID);
  }
  if (pageID) {
    pageIndex = jsonData.pages.findIndex((page) => page.pageID === pageID);
  }
  switch (action) {
    case 'createDocument':
      if (!fs.existsSync(MY_DOCUMENTS_PATH)) {
        mkdirSync(MY_DOCUMENTS_PATH, {
          recursive: true,
        });
      }
      documentID = Date.now();
      const documentDirectoryPath = path.resolve(MY_DOCUMENTS_PATH, String(documentID));
      try {
        mkdirSync(documentDirectoryPath);
        logger.info(`Document directory created successfully for document number: ${documentID}`);
      } catch (error) {
        logger.error(`Error creating document directory: ${error.message}`);
      }

      try {
        mkdirSync(path.resolve(documentDirectoryPath, 'recognized-files'));
        logger.info(`Recognized-files directory created successfully for document number: ${documentID}`);
      } catch (error) {
        logger.error(`Error creating recognized-files directory: ${error.message}`);
      }

      try {
        mkdirSync(path.resolve(documentDirectoryPath, 'images'));
        logger.info(`Images directory created successfully for document number: ${documentID}`);
      } catch (error) {
        logger.error(`Error creating images directory: ${error.message}`);
      }

      try {
        mkdirSync(path.resolve(documentDirectoryPath, 'translated-files'));
        logger.info(`Translated-files directory created successfully for document number: ${documentID}`);
      } catch (error) {
        logger.error(`Error Translated-files directory: ${error.message}`);
      }

      jsonData = createDocumentData(documentID);
      mainWindow.webContents.send('create-document-output', jsonData);
      break;
    case 'editTitle':
      jsonData.title = data;
      break;
    case 'addPage':
      const newPage = {
        pageID: crypto.randomUUID(),
        file: null,
        brailleStatus: null,
        brailleText: null,
        translatedTextStatus: null,
        translations: {
          slovak: null,
        },
      };
      jsonData.pages.push(newPage);
      break;
    case 'editFile':
      if (pageIndex !== -1) {
        jsonData.pages[pageIndex].file = data;
      }
      break;
    case 'editBrailleStatus':
      if (pageIndex !== -1) {
        jsonData.pages[pageIndex].brailleStatus = data as BrailleStatus;
      }
      break;
    case 'editBrailleText':
      if (pageIndex !== -1) {
        jsonData.pages[pageIndex].brailleText = data;
      }
    case 'editTranslatedTextStatus':
      if (pageIndex !== -1) {
        jsonData.pages[pageIndex].translatedTextStatus = data as TranslatedTextStatus;
      }
      break;
  }
  writeJsonToFile(jsonData, documentID);
  performReadDocuments(mainWindow);

  return jsonData;
};

// 1. read folder content and make array of its folders.
// 2. create documents array
// 3. read content of each folder and append its content to documents
// 4. repeat that using for each loop
// 5. sends documents array
const performReadDocuments = (mainWindow: BrowserWindow): void => {
  let documents: Document[] = [];
  try {
    if (fs.existsSync(MY_DOCUMENTS_PATH)) {
      const files = fs.readdirSync(MY_DOCUMENTS_PATH);
      files.forEach((element) => {
        const jsonData = getJsonFromFile(element);
        documents.push(jsonData);
      });
    }
  } catch (err) {
    console.error('Error reading directory synchronously:', err);
  }
  mainWindow.webContents.send('read-documents-output', documents);
};

export { performUpdateDocument, performReadDocuments };
