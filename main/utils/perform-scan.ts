import twain, { TwainSDK } from 'node-twain';
import tmp from 'tmp';

let app: TwainSDK;
let defaultSource: string;
let sources: string[];

const performScan = async (): Promise<string> => {
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
    sources = app.getDataSources();
    defaultSource = app.getDefaultSource();
    app.setDefaultSource(sources[0]);
    await app.openDataSource(defaultSource);
  }

  app.setCallback();

  return new Promise<string>((resolve, reject) => {
    const options = {};

    tmp.tmpName(options, (err, path) => {
      if (err) {
        reject(err);
      } else {
        app.scan(twain.TWSX_FILE, path);
        resolve(path + '.bmp');
      }
    });
  });
};

export { performScan };
