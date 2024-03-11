import pdf2img from 'pdf-img-convert';
import fs from 'fs';
import { logger } from '../logger';
import path from 'path';

const performImageExtensionValidation = (pathToFile: string) => {
  const extension = path.extname(pathToFile);
  if (extension === '.pdf') {
    // performFileDivision(pathToFile);
  } else if (extension === '.jpeg' || extension === '.jpg' || extension === '.png') {
    // file recognition
  } else {
    logger.error(`In performImageExtensionValidation, invalid file extension: ${extension}`);
  }
};

const performConvertPdfToImages = async (pathToFile: string) => {
  const pdfArray = await pdf2img.convert(pathToFile);
  console.log('saving');
  for (let i = 0; i < pdfArray.length; i++) {
    fs.writeFile('output' + i + '.png', pdfArray[i], function (error) {
      if (error) {
        console.error('Error: ' + error);
      }
    });
  }
  return pdfArray.length;
};
