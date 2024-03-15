import pdf from 'pdf-poppler';
import fs from 'fs';
import { logger } from '../logger';
import path from 'path';
import { addFileToQueue } from './perform-braille-recognition';
import { BrowserWindow } from 'electron';
import { MY_DOCUMENTS_PATH } from './constants';
import { performUpdateDocument } from './perform-manage-document';

let numberOfFiles;
const supportedExtensions = ['.pdf', '.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.ico', '.jfif', '.webp'];

const prepareFileForRecognition = async (
  filePath: string,
  documentID: number,
  pageID: string,
  translationLanguage: string,
  mainWindow: BrowserWindow,
) => {
  const extension = path.extname(filePath);
  try {
    if (supportedExtensions.includes(extension)) {
      if (extension === '.pdf') {
        numberOfFiles = await performConvertPdfToImages(filePath, documentID);
        // remove pdf file if it comes from scanning
        if (filePath === path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', path.basename(filePath))) {
          fs.unlinkSync(filePath);
        }
      } else {
        numberOfFiles = 1;
        filePath = performCopyUploadedImage(filePath, documentID);
      }
    } else {
      logger.error(`Unsupported file extension: ${extension}`);
      return;
    }

    for (let i = 0; i < numberOfFiles; i++) {
      if (i > 0) {
        const updatedDocument = performUpdateDocument(mainWindow, 'addPage', documentID);
        pageID = updatedDocument.pages[updatedDocument.pages.length - 1].pageID;
      }

      if (extension === '.pdf') {
        filePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', `scan-${i + 1}.png`);
      }

      const pathToPageDirectory = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', pageID);
      if (!fs.existsSync(pathToPageDirectory)) {
        fs.mkdirSync(pathToPageDirectory);
      }

      await performMoveImageToPageDirectory(filePath, pathToPageDirectory);
      filePath = path.join(pathToPageDirectory, path.basename(filePath));

      const correctedPathToFile = 'file:///' + filePath.replace(/\\/g, '/');
      performUpdateDocument(mainWindow, 'editFile', documentID, correctedPathToFile, pageID);
      performUpdateDocument(mainWindow, 'editBrailleStatus', documentID, 'recognitionInProgress', pageID);

      addFileToQueue(filePath, documentID, pageID, translationLanguage, mainWindow);
      filePath = filePath.replace(pageID, '');
    }

    logger.info(`Prepared ${numberOfFiles} file(s) for recognition.`);
  } catch (err) {
    logger.error(`Error in prepareFileForRecognition: ${err}`);
  }
};

const performConvertPdfToImages = async (filePath: string, documentID: number) => {
  try {
    const outputDir = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images');
    await pdf.convert(filePath, {
      format: 'png',
      out_dir: outputDir,
      out_prefix: 'scan',
    });
    const files = fs.readdirSync(outputDir);

    const pngFiles = files.filter((file) => path.extname(file).toLowerCase() === '.png');
    logger.info(`Converted PDF to ${pngFiles.length} PNG image(s).`);

    return pngFiles.length;
  } catch (err) {
    logger.error(`Error in performConvertPdfToImages: ${err}`);
  }
};

const performMoveImageToPageDirectory = async (imagePath: string, pathToPageDirectory: string) => {
  try {
    const destinationPath = path.join(pathToPageDirectory, path.basename(imagePath));
    fs.copyFileSync(imagePath, destinationPath);
    fs.unlinkSync(imagePath);
    logger.info(`Moved image from ${imagePath} to ${destinationPath}`);
  } catch (err) {
    logger.error(`Error in performMoveImageToPageDirectory: ${err}`);
  }
};

const performCopyUploadedImage = (imagePath: string, documentID: number): string => {
  try {
    const destinationPath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', path.basename(imagePath));
    fs.copyFileSync(imagePath, destinationPath);
    logger.info(`Copied uploaded image from ${imagePath} to ${destinationPath}`);
    return destinationPath;
  } catch (err) {
    logger.error(`Error in performCopyUploadedImage: ${err}`);
  }
};

export default prepareFileForRecognition;
