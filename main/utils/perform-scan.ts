import twain, { TwainSDK } from 'node-twain';
import { logger } from '../logger';
import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';

let app: TwainSDK;
let defaultSource: string;
let sources: string[];

const performScan = async (documentID: number, pageID: string): Promise<string> => {
  logger.debug(`Scanner util opened.`);
  if (!app) {
    app = new twain.TwainSDK({
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
    logger.info(`Created Scanner identity in app.`);
    sources = app.getDataSources();
    logger.info(`Loaded Scanner Data Sources: ${sources}`);
    defaultSource = app.getDefaultSource();
    logger.info(`Loaded Scanner Default Data Source: ${defaultSource}`);
    app.setDefaultSource(sources[0]);
    logger.info(`Setted Scanner Data Source.`);
    await app.openDataSource(defaultSource);
    logger.info(`Opened Scanner Data Source.`);
  }

  app.setCallback();
  logger.info(`Scanner callback executed.`);
  return new Promise<string>((resolve, reject) => {
    const scannedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), pageID.toString() + '.bmp');
    try {
      app.scan(twain.TWSX_FILE, scannedImagePath);
      logger.info(`Scanning executed for document ${documentID}, page ${pageID}.`);
      resolve(scannedImagePath + '.bmp'); // Resolve with the path to the scanned image
    } catch (error) {
      logger.error(`Error occurred during scanning for document ${documentID}, page ${pageID}: ${error}`);
      reject(error); // Reject with the error
    }
  });
};

export { performScan };
