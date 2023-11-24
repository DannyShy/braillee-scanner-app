import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import fs from 'fs';
import { mkdirSync } from 'original-fs';
import { BrowserWindow } from 'electron';

const performUpdateDocument = (documentID, action, data, pageID) => {
  // based on unix time stamp number folder is found.
  // property which is to be updated needs to be defined
  // new value has to be defined.
  const documentsPath = path.resolve(MY_DOCUMENTS_PATH, String(documentID), 'document.json');
  const buffferData = fs.readFileSync(documentsPath);
  const stringData = buffferData.toString();
  const jsonData = JSON.parse(stringData);

  switch (action) {
    case 'editTitle':
      jsonData.title = data;
      break;
    case 'addPage':
      const newPage = {
        createdAt: Date.now(),
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

  const jsonStringifiedData = JSON.stringify(jsonData);

  fs.writeFileSync(documentsPath, jsonStringifiedData);
};

// creates document folder, creates content of file, creates json file
const performCreateDocument = (mainWindow: BrowserWindow) => {
  if (!fs.existsSync(MY_DOCUMENTS_PATH)) {
    mkdirSync(MY_DOCUMENTS_PATH);
  }
  //creating unix timestamp file
  const documentID = Date.now();

  mkdirSync(path.resolve(MY_DOCUMENTS_PATH, String(documentID)));
  // below is option with using proper date. but for now lets use unix timestamp even in documents.json
  // const createdAt = new Date(fileName);
  // const dateTimeString =
  //   createdAt.toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'numeric',
  //     day: 'numeric',
  //   }) +
  //   ' ' +
  //   createdAt.toLocaleTimeString('en-US', {
  //     hour: 'numeric',
  //     minute: 'numeric',
  //   });
  // console.log(dateTimeString);

  const documentData = {
    title: 'New Document',
    createdAt: documentID,
    pages: [
      {
        createdAt: documentID,
        file: null,
      },
    ],
  };

  const documentDataString = JSON.stringify(documentData);

  const documentsPath = path.resolve(MY_DOCUMENTS_PATH, String(documentID), 'document.json');

  fs.writeFileSync(documentsPath, documentDataString);

  mainWindow.webContents.send('create-doc-output', documentID);
};

const performReadDocuments = () => {
  // to be done as part of different task
};

// util below serves for rendering of pages inside MyPagesComponent

const performReadPages = (documentID: number, mainWindow: BrowserWindow) => {
  // Convert documentUnixTimeStamp to a string explicitly
  const timeStampString = String(documentID);

  const documentsPath = path.resolve(MY_DOCUMENTS_PATH, timeStampString, 'document.json');

  try {
    // Use fs.existsSync to check if the file exists before reading it
    if (fs.existsSync(documentsPath)) {
      const buffferData = fs.readFileSync(documentsPath);
      const stringData = buffferData.toString();
      const jsonData = JSON.parse(stringData);
      mainWindow.webContents.send('read-pages-output', jsonData);
    } else {
      console.error('File not found:', documentsPath);
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }
};

export { performUpdateDocument, performCreateDocument, performReadDocuments, performReadPages };
