import twain, { TwainSDK } from 'node-twain';
import { logger } from '../logger';
import { BrowserWindow } from 'electron';

let scannerApp: TwainSDK;
let sources: string[];

const performDetectScanners = async (mainWindow: BrowserWindow) => {
  logger.debug(`Detect scanners util opened.`);
  if (!scannerApp) {
    scannerApp = new twain.TwainSDK({
      productName: 'DotSight',
      productFamily: 'tools',
      manufacturer: 'Hotovo',
      version: {
        country: twain.TWCY_SLOVAKIA,
        language: twain.TWLG_SLOVAK,
        majorNum: 0,
        minorNum: 1,
        info: '0.1.0',
      },
    });
    logger.info(`Created Scanner identity in scannerApp.`);
  }
  sources = scannerApp.getDataSources();
  mainWindow.webContents.send('scanners-list', sources);
};

export { performDetectScanners, scannerApp };
