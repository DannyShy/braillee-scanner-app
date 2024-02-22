import twain, { TwainSDK } from 'node-twain';
import { logger } from '../logger';
import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import { BrowserWindow } from 'electron';

let scannerApp: TwainSDK;
let sourceSetAndOpened: boolean;

const createScannerApp = () => {
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
};

const performDetectScanners = async (mainWindow: BrowserWindow) => {
  logger.debug(`Detect scanners util opened.`);
  if (!scannerApp) {
    createScannerApp();
  }
  const sources: string[] = scannerApp.getDataSources();
  mainWindow.webContents.send('scanners-list', sources);
};

const performScan = async (documentID: number, pageID: string, selectedScanner: string): Promise<string> => {
  logger.debug(`Scanner util opened.`);
  if (!scannerApp) {
    createScannerApp();
  }
  if (!sourceSetAndOpened) {
    scannerApp.setDefaultSource(selectedScanner);
    logger.info(`Setted Scanner Data Source to:`);
    logger.info(selectedScanner);
    await scannerApp.openDataSource(selectedScanner);
    sourceSetAndOpened = true;
  }
  scannerApp.setCallback();
  logger.info(`Scanner callback executed.`);
  return new Promise<string>((resolve, reject) => {
    const scannedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', pageID);
    try {
      scannerApp.scan(twain.TWSX_FILE, scannedImagePath);
      logger.info(`Scanning executed for document ${documentID}, page ${pageID}.`);
      resolve(scannedImagePath + '.bmp'); // Resolve with the path to the scanned image
    } catch (error) {
      logger.error(`Error occurred during scanning for document ${documentID}, page ${pageID}: ${error}`);
      reject(error); // Reject with the error
    }
  });
};

export { performDetectScanners, performScan };
