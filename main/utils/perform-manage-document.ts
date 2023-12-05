import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import fs from 'fs';
import { mkdirSync } from 'original-fs';
import { BrowserWindow } from 'electron';

const getDocPathFromDocID = (documentID) => {
  return path.resolve(MY_DOCUMENTS_PATH, String(documentID), 'document.json');
};

const getJsonFromFile = (documentID) => {
  const documentPath = getDocPathFromDocID(documentID);
  const buffferData = fs.readFileSync(documentPath);
  const stringData = buffferData.toString();
  const jsonData = JSON.parse(stringData);
  return jsonData;
};

const writeJsonToFile = (jsonData, documentID) => {
  const jsonStringifiedData = JSON.stringify(jsonData);
  fs.writeFileSync(getDocPathFromDocID(documentID), jsonStringifiedData);
};

// 1. read folder content and make array of its folders.
// 2. create documents array
// 3. read content of each folder and append its content to supper array
// 4. repeat that using for each loop
const readDocuments = () => {
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

const performUpdateDocument = (documentID, action, data, pageID) => {
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
        documentID: Date.now(),
        file: null,
      };
      jsonData.pages.push(newPage);
      break;
    case 'editPage':
      const pageIndex = jsonData.pages.findIndex((page) => page.createdAt === pageID);
      if (pageIndex !== -1) {
        jsonData.pages[pageIndex].file = data;
      }
      break;
  }
  writeJsonToFile(jsonData, documentID);
};

// creates document folder, creates content of file, creates json file
const performCreateDocument = (mainWindow: BrowserWindow) => {
  if (!fs.existsSync(MY_DOCUMENTS_PATH)) {
    mkdirSync(MY_DOCUMENTS_PATH);
  }
  //creating unix timestamp file
  const documentID = Date.now();
  mkdirSync(path.resolve(MY_DOCUMENTS_PATH, String(documentID)));
  const documentData = {
    title: 'New Document',
    documentID: documentID,
    pages: [
      {
        documentID: documentID,
        file: null,
      },
    ],
  };
  writeJsonToFile(documentData, documentID);

  const documents = readDocuments();

  mainWindow.webContents.send('create-doc-output', documentID, documents);
};

const performReadDocuments = (mainWindow: BrowserWindow) => {
  // sends documents array to renderer
  const documents = readDocuments();
  mainWindow.webContents.send('read-documents-output', documents);
};

export { performUpdateDocument, performCreateDocument, performReadDocuments };
