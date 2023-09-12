import twain from 'node-twain';
import tmp from 'tmp';

const performScan = async (): Promise<string> => {
  const app = new twain.TwainSDK({
    //data below are accepted also with dummy values
    productName: 'x',
    productFamily: 'x',
    manufacturer: 'x',
    version: {
      country: 1,
      language: 1,
      majorNum: 1,
      minorNum: 1,
      info: 'x',
    },
  });

  const sources = app.getDataSources(); // ["PaperStream IP SP-1120N #2"] -> object
  // here if there is more than 1 scanner user should be able to pick which scanner to use.

  const defaultSource = app.getDefaultSource(); // "PaperStream IP SP-1120N #2" -> string

  app.setDefaultSource(sources[0]); //set which scanner to work

  await app.openDataSource(defaultSource);

  app.setCallback();
  const options = {};
  // runs scanner and create unique name of file
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
