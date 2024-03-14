import pdf from 'pdf-poppler';
import fs from 'fs';
import { logger } from '../logger';
import path from 'path';
import { addFileToQueue } from './perform-braille-recognition';
import { BrowserWindow } from 'electron';
import { MY_DOCUMENTS_PATH } from './constants';
import { performUpdateDocument } from './perform-manage-document';

const prepareFileForRecognition = (
  filePath: string,
  documentID: number,
  pageID: string,
  translationLanguage: string,
  mainWindow: BrowserWindow,
) => {
  const extension = path.extname(filePath);
  if (extension === '.pdf') {
    performConvertPdfToImages(filePath, documentID, pageID, translationLanguage, mainWindow);
  } else if (extension === '.jpeg' || extension === '.jpg' || extension === '.png') {
    addFileToQueue(filePath, documentID, pageID, translationLanguage, mainWindow);
  } else {
    logger.error(`In performImageExtensionValidation, invalid file extension: ${extension}`);
  }
};

const performConvertPdfToImages = async (
  filePath: string,
  documentID: number,
  pageID: string,
  translationLanguage: string,
  mainWindow: BrowserWindow,
) => {
  pdf.convert(filePath, {
    format: 'png',
    out_dir: path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images'),
  });

  const pdfArray = await pdf2img.convert(filePath);
  for (let i = 0; i < pdfArray.length; i++) {
    if (i !== 0) {
      const updatedDocument = performUpdateDocument(mainWindow, 'addPage', documentID);
      pageID = updatedDocument.pages[updatedDocument.pages.length - 1].pageID;
    }
    const slicedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', pageID, 'scan' + i + '.png');
    fs.writeFile(slicedImagePath, pdfArray[i], function (error) {
      if (error) {
        logger.error('Error: ' + error);
      }
    });
    addFileToQueue(slicedImagePath, documentID, pageID, translationLanguage, mainWindow);
  }
};

export default prepareFileForRecognition;
