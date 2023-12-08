import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { performScan } from './utils/perform-scan';
import { ipcMain } from 'electron';
import { performCancelPreview } from './utils/perform-cancel-preview';
import { performReadBraille } from './utils/perform-read-braille';
import { performCancelInitialSetup, performInitialSetup } from './utils/perform-initial-setup';
import fs from 'fs';
import { PATH_TO_MODEL, IS_PROD } from './utils/constants';
import { performCheckDiskSpace } from './utils/perform-check-disk-space';
import { performCreateDocument, performReadDocuments, performUpdateDocument } from './utils/perform-manage-document';

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

  if (IS_PROD) {
    await mainWindow.loadURL(`app://./${firstPageHtml}`);
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/${firstPage}`);
    mainWindow.webContents.openDevTools();
  }
  ipcMain.handle('read-documents', () => performReadDocuments());

  ipcMain.handle('check-disk-space', async () => {
    await performCheckDiskSpace(mainWindow);
  });

  ipcMain.handle('initial-setup', async () => {
    await performInitialSetup(mainWindow);
  });
  ipcMain.handle('scan-file', performScan);
  ipcMain.on('send-data-to-main', (event, scannedOutputURI) => {
    performCancelPreview(scannedOutputURI);
  });
  ipcMain.on('send-file-to-main', async (event, brailleInput) => {
    const brailleOutput = await performReadBraille(brailleInput);
    mainWindow.webContents.send('braille', brailleOutput);
  });
  ipcMain.handle('cancel-setup', () => {
    performCancelInitialSetup();
  });
  ipcMain.handle('create-document', () => performCreateDocument(mainWindow));
  ipcMain.on('update-document', (event, documentID, action, data, pageID) => {
    performUpdateDocument(documentID, action, data, pageID);
  });
  ipcMain.handle('close-app', () => {
    app.quit();
  });
})();

app.on('window-all-closed', () => {
  app.quit();
});
