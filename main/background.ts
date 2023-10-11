import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { performScan } from './utils/perform-scan';
import { ipcMain } from 'electron';
import { performCancelPreview } from './utils/perform-cancel-preview';
import { performReadBraille } from './utils/perform-read-braille';
import { perfomModelDownload } from './utils/perform-model-download';
import fs from 'fs';
import { PATH_TO_MODEL } from './utils/constants';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
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
    firstPageHtml = 'download-model.html';
    firstPage = 'download-model';
  } else {
    firstPageHtml = 'home.html';
    firstPage = 'home';
  }

  if (isProd) {
    await mainWindow.loadURL(`app://./${firstPageHtml}`);
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/${firstPage}`);
    mainWindow.webContents.openDevTools();
  }

  ipcMain.handle('download-model', async () => {
    await perfomModelDownload(mainWindow);
  });
  ipcMain.handle('scan-file', performScan);
  ipcMain.on('send-data-to-main', (event, scannedOutputURI) => {
    performCancelPreview(scannedOutputURI);
  });
  ipcMain.on('send-file-to-main', async (event, brailleInput) => {
    const brailleOutput = await performReadBraille(brailleInput, app);
    mainWindow.webContents.send('braille', brailleOutput);
  });
})();

app.on('window-all-closed', () => {
  app.quit();
});
