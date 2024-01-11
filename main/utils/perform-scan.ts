import twain, { TwainSDK } from 'node-twain';
import tmp from 'tmp';
import { logger } from '../logger';

let app: TwainSDK;
let defaultSource: string;
let sources: string[];

const performScan = async (): Promise<string> => {
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
    const options = {};

    tmp.tmpName(options, (err, path) => {
      if (err) {
        logger.error(`Error occured during tmp file creation: ${err}`);
        reject(err);
      } else {
        app.scan(twain.TWSX_FILE, path);
        logger.info(`Scanning executed.`);
        logger.debug(`Scanner util closed.`);
        resolve(path + '.bmp');
      }
    });
  });
};

export { performScan };
