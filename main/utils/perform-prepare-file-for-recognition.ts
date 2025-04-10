import fs from 'fs';
import path from 'path';
import { BrowserWindow } from 'electron';
import { fromPath } from 'pdf2pic';
import { PDFImage } from 'pdf-image';
import { logger } from '../logger';
import { IS_LINUX, MY_DOCUMENTS_PATH } from './constants';
import { addFileToQueue } from './perform-braille-recognition';
import { performUpdateDocument } from './perform-manage-document';

const performSaveFileAndPrepareForRecognition = async (
  fileBytes: Uint8Array,
  fileName: string,
  documentID: number,
  pageID: string,
  translationLanguage: string,
  mainWindow: BrowserWindow,
) => {
  const imagesDir = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images');
  const filePath = path.join(imagesDir, fileName);

  // Ensure directory exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(filePath, fileBytes);

  // Process the saved file
  await performPrepareFileForRecognition(filePath, documentID, pageID, translationLanguage, mainWindow);
};

let numberOfFiles;
const supportedExtensions = ['.pdf', '.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.ico', '.jfif', '.webp'];

const performPrepareFileForRecognition = async (
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
        // if the file is not a pdf, it is a single image which is uploaded by the user and should be copied to the images directory
        numberOfFiles = 1;
        filePath = performCopyUploadedImage(filePath, documentID);
      }
    } else {
      logger.error(`Unsupported file extension: ${extension}`);
      return;
    }

    for (let i = 0; i < numberOfFiles; i++) {
      // If there are multiple files, add a new page for each one
      if (i > 0) {
        const updatedDocument = performUpdateDocument(mainWindow, 'addPage', documentID);
        pageID = updatedDocument.pages[updatedDocument.pages.length - 1].pageID;
      }
      // If the file is a PDF, update the file path for each image
      if (extension === '.pdf') {
        filePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', `scan.${i + 1}.png`);
      }
      // Create a new directory for each page
      const pathToPageDirectory = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', pageID);
      if (!fs.existsSync(pathToPageDirectory)) {
        fs.mkdirSync(pathToPageDirectory);
      }

      await performMoveImageToPageDirectory(filePath, pathToPageDirectory);
      filePath = path.join(pathToPageDirectory, path.basename(filePath));

      // Update the document with the new file path and status
      const correctedPathToFile = 'file:///' + filePath.replace(/\\/g, '/');
      performUpdateDocument(mainWindow, 'editFile', documentID, correctedPathToFile, pageID);
      performUpdateDocument(mainWindow, 'editBrailleStatus', documentID, 'recognitionInProgress', pageID);

      // Add the file to the queue for recognition
      addFileToQueue(filePath, documentID, pageID, translationLanguage, mainWindow);
      filePath = filePath.replace(pageID, '');
    }

    logger.info(`Prepared ${numberOfFiles} file(s) for recognition.`);
  } catch (err) {
    logger.error(`Error in prepareFileForRecognition: ${err}`);
    throw err;
  }
};

const performConvertPdfToImages = async (filePath: string, documentID: number) => {
  try {
    const outputDir = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images');

    if (IS_LINUX) {
      logger.info('Using pdf-image for Linux platform');
      // Use pdf-image for Linux
      const pdfImage = new PDFImage(filePath, {
        convertOptions: {
          '-density': '300',
          '-quality': '100',
        },
        outputDirectory: outputDir,
        combinedImage: false,
      });

      // Convert all pages
      const filePaths = await pdfImage.convertFile();

      filePaths.forEach((filePath, index) => {
        const newPath = path.join(outputDir, `scan.${index + 1}.png`);
        fs.renameSync(filePath, newPath);
      });

      logger.info(`Converted PDF to ${filePaths.length} PNG image(s) using pdf-image`);
      return filePaths.length;
    } else {
      logger.info('Using pdf2pic for Windows/Mac platform');
      // Use pdf2pic for Windows and Mac
      const conversionOptions = {
        density: 300,
        quality: 100,
        saveFilename: 'scan',
        savePath: outputDir,
        format: 'png',
      };

      const convert = fromPath(filePath, conversionOptions);
      const pageToConvertAsImage = 1;
      await convert(pageToConvertAsImage, { responseType: 'image' }).then((resolve) => {
        return resolve;
      });

      const files = fs.readdirSync(outputDir);
      const pngFiles = files.filter((file) => path.extname(file).toLowerCase() === '.png');
      logger.info(`Converted PDF to ${pngFiles.length} PNG image(s) using pdf2pic`);

      return pngFiles.length;
    }
  } catch (err) {
    logger.error(`Error in performConvertPdfToImages: ${err}`);
    throw err;
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

export { performPrepareFileForRecognition, performSaveFileAndPrepareForRecognition };
