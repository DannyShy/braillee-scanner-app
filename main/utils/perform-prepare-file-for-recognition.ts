import fs from 'fs';
import path from 'path';
import { BrowserWindow } from 'electron';
import { logger } from '../logger';
import { IS_PROD, MY_DOCUMENTS_PATH } from './constants';
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

const performConvertPdfToImages = async (filePath: string, documentID: number): Promise<number> => {
  try {
    const outputDir = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images');

    logger.info('Using mupdf for PDF to image conversion (no ImageMagick required)');

    // Dynamically import mupdf (ESM module) - works in both dev and production
    // mupdf is pure WASM, no system-level ImageMagick/GraphicsMagick needed
    // In production, mupdf is placed in extraResources/node_modules/mupdf by electron-builder
    // In dev, it is loaded from node_modules directly
    // On Windows, dynamic import() requires file:// URLs (not raw C:\ paths)
    const mupdfAbsPath = IS_PROD
      ? path.join(process.resourcesPath, 'node_modules', 'mupdf', 'dist', 'mupdf.js')
      : path.join(__dirname, '..', '..', '..', 'node_modules', 'mupdf', 'dist', 'mupdf.js');

    // Convert Windows path to file:// URL for ESM dynamic import compatibility
    const mupdfFileUrl = 'file:///' + mupdfAbsPath.replace(/\\/g, '/');

    // @ts-ignore - dynamic path import, types not resolvable statically
    const mupdf = await import(/* webpackIgnore: true */ mupdfFileUrl);

    // Read the PDF file as a buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // Open the PDF document using mupdf (pure WASM, no native dependencies)
    const doc = mupdf.Document.openDocument(pdfBuffer, 'application/pdf');
    const pageCount = doc.countPages();

    logger.info(`PDF has ${pageCount} page(s)`);

    // Render each page at 300 DPI (scale factor: 300/72 ≈ 4.167)
    const scale = 300 / 72;
    const matrix = mupdf.Matrix.scale(scale, scale);

    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);
      const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false);
      const pngData = pixmap.asPNG();

      const outputPath = path.join(outputDir, `scan.${i + 1}.png`);
      fs.writeFileSync(outputPath, pngData);

      pixmap.destroy();
      page.destroy();

      logger.info(`Converted page ${i + 1} to ${outputPath}`);
    }

    doc.destroy();

    logger.info(`Converted PDF to ${pageCount} PNG image(s) using mupdf`);
    return pageCount;
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
