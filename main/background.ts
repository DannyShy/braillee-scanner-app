import { app, ipcRenderer, webContents } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { performScan } from './utils/perform-scan';
import { ipcMain } from 'electron';
import { performCancelPreview } from './utils/perform-cancel-preview';
import { performReadBraille } from './utils/perform-read-braille';
import { performInstallationAndCheck } from './utils/perform-installation-and-check';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
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

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
  performInstallationAndCheck();
  ipcMain.handle('dialog:scanFile', performScan);
  ipcMain.on('send-data-to-main', (event, scannedOutputURI) => {
    performCancelPreview(scannedOutputURI);
  });
  ipcMain.on('send-file-to-main', async (event, brailleInput) => {
    const brailleOutput = await performReadBraille(brailleInput);
    mainWindow.webContents.send('braille', brailleOutput);
  });
})();

app.on('window-all-closed', () => {
  app.quit();
});
