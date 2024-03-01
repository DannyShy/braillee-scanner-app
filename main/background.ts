import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { performScan, performDetectScanners } from './utils/perform-manage-scanning';
import { ipcMain } from 'electron';
import { addFileToQueue, performCancelRecognizeBraille } from './utils/perform-braille-recognition';
import { performCancelInitialSetup, performInitialSetup } from './utils/perform-initial-setup';
import fs from 'fs';
import { PATH_TO_MODEL, IS_PROD } from './utils/constants';
import { performCheckDiskSpace } from './utils/perform-check-disk-space';
import { performReadDocuments, performUpdateDocument } from './utils/perform-manage-document';
import { performExportDocument } from './utils/perform-export-document';
import { performLogFromRenderer } from './utils/perform-log-from-renderer';
import { performCopyUploadedImage } from './utils/perform-copy-uploaded-image';
import { store } from './utils/store';
import { performDeleteDocument } from './utils/perform-delete-document';

if (IS_PROD) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')}(development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });

  let firstPageHtml: string;
  let firstPage: string;

  if (!fs.existsSync(PATH_TO_MODEL)) {
    firstPageHtml = 'welcome-screen.html';
    firstPage = 'welcome-screen';
  } else {
    firstPageHtml = 'home-screen.html';
    firstPage = 'home-screen';
  }

  ipcMain.handle('getStoreValue', (event, key) => {
    return store.get(key);
  });
  ipcMain.on('setStoreValue', (event, key, value) => {
    store.set(key, value);
  });
  ipcMain.on('delete-document', (event, documentID) => performDeleteDocument(documentID, mainWindow));
  ipcMain.handle('get-scanners-list', () => performDetectScanners(mainWindow));
  ipcMain.handle('read-documents', () => performReadDocuments(mainWindow));
  ipcMain.handle('check-disk-space', async () => {
    await performCheckDiskSpace(mainWindow);
  });
  ipcMain.on('copy-image', async (event, imagePath, documentID) => {
    performCopyUploadedImage(imagePath, documentID);
  });
  ipcMain.handle('initial-setup', async () => {
    await performInitialSetup(mainWindow);
  });
  ipcMain.handle('scan-file', async (event, documentID, pageID, selectedScanner) => {
    return performScan(documentID, pageID, selectedScanner);
  });
  ipcMain.on('recognize-braille', async (event, fileName, documentID, pageID) => {
    addFileToQueue(fileName, documentID, pageID, mainWindow);
  });
  ipcMain.handle('cancel-setup', () => {
    performCancelInitialSetup();
  });
  ipcMain.handle('cancel-recognition', () => {
    performCancelRecognizeBraille();
  });
  ipcMain.on('update-document', (event, action, documentID, data, pageID) => {
    performUpdateDocument(mainWindow, action, documentID, data, pageID);
  });
  ipcMain.handle('export-document', (event, activeDocument) => {
    performExportDocument(activeDocument);
  });
  ipcMain.on('log-from-renderer', (event, level, message) => {
    performLogFromRenderer(level, message);
  });
  ipcMain.handle('close-app', () => {
    app.quit();
  });

  if (IS_PROD) {
    await mainWindow.loadURL(`app://./${firstPageHtml}`);
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/${firstPage}`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});
