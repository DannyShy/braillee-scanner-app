import fs from 'fs';
import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { logger } from './logger';
import { createWindow } from './helpers';
import { performDetectScanners, performScan } from './utils/perform-manage-scanning';
import { addFileToQueue, performCancelRecognizeBraille } from './utils/perform-braille-recognition';
import { performCancelInitialSetup, performInitialSetup } from './utils/perform-initial-setup';
import { IS_PROD, PATH_TO_MODEL } from './utils/constants';
import { performCheckDiskSpace } from './utils/perform-check-disk-space';
import { performReadDocuments, performUpdateDocument } from './utils/perform-manage-document';
import { performExportDocument } from './utils/perform-export-document';
import { performLogFromRenderer } from './utils/perform-log-from-renderer';
import { store } from './utils/store';
import { performDeleteDocument } from './utils/perform-delete-document';
import { performBrailleTranslation } from './utils/perform-braille-translation';
import { performDeletePage } from './utils/perform-delete-page';
import {
  performPrepareFileForRecognition,
  performSaveFileAndPrepareForRecognition,
} from './utils/perform-prepare-file-for-recognition';
import { processError } from './error';
import { init as initAutoUpdate } from './auto-update/auto-update';

if (IS_PROD) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
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
  ipcMain.on('translate-text', (event, brailleText, documentID, pageID, translationLanguage) => {
    performBrailleTranslation(brailleText, documentID, pageID, translationLanguage, mainWindow);
  });
  ipcMain.on('delete-page', (event, documentID, file, pageID) =>
    performDeletePage(documentID, file, pageID, mainWindow),
  );
  ipcMain.handle('get-scanners-list', () => performDetectScanners(mainWindow));
  ipcMain.handle('read-documents', () => performReadDocuments(mainWindow));
  ipcMain.handle('check-disk-space', async () => {
    await performCheckDiskSpace(mainWindow);
  });
  ipcMain.on('process-uploaded-file', async (event, fileBytes, fileName, documentID, pageID, translationLanguage) => {
    try {
      await performSaveFileAndPrepareForRecognition(
        fileBytes,
        fileName,
        documentID,
        pageID,
        translationLanguage,
        mainWindow,
      );
    } catch (error) {
      logger.error(`Error processing uploaded file: ${error.message}`);
      processError(mainWindow, error);
    }
  });
  ipcMain.handle('initial-setup', async () => {
    try {
      await performInitialSetup(mainWindow);
    } catch (error) {
      logger.error(`Error performing initial setup: ${error.message}`);
      processError(mainWindow, error);
    }
  });
  ipcMain.handle('scan-file', async (event, documentID, pageID, selectedScanner, paperSource, translationLanguage) => {
    try {
      const pathToScannedFile = await performScan(documentID, selectedScanner, paperSource);
      await performPrepareFileForRecognition(pathToScannedFile, documentID, pageID, translationLanguage, mainWindow);
    } catch (err) {
      logger.error(`Error scanning file: ${err.message}`);
      performUpdateDocument(mainWindow, 'editFile', documentID, null, pageID);
      processError(mainWindow, err);
    }
  });
  ipcMain.on('recognize-braille', async (event, fileName, documentID, pageID, translationLanguage) => {
    addFileToQueue(fileName, documentID, pageID, translationLanguage, mainWindow);
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

initAutoUpdate();

app.on('window-all-closed', () => {
  app.quit();
});
