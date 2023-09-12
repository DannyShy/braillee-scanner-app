import * as fs from 'fs';

const performCancelPreview = (scannedOutputURI: string) => {
  const absolutePath = scannedOutputURI.replace(/^file:\/\/\//, '');
  fs.unlink(absolutePath, (err) => {
    if (err) throw err;
  });
};

export { performCancelPreview };
