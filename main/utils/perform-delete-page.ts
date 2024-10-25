import path from 'path';
import fs from 'fs';
import { BrowserWindow } from 'electron';
import { logger } from '../logger';
import { MY_DOCUMENTS_PATH } from './constants';

import { performUpdateDocument } from './perform-manage-document';

const performDeletePage = async (
  documentID: string,
  file: string | null,
  pageID: string,
  mainWindow: BrowserWindow,
) => {
  const documentDirectory = path.join(MY_DOCUMENTS_PATH, documentID.toString());

  if (file) {
    const imagePath = path.join(documentDirectory, 'images', pageID, path.basename(file));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      logger.info(`Successfully deleted image at path: ${imagePath}`);
    } else {
      logger.warn(`Image not found at path: ${imagePath}`);
    }
    const nameWithoutExtension = path.basename(file, path.extname(file));
    const brlFileName = `${nameWithoutExtension}.marked.brl`;
    const brlFilePath = path.join(documentDirectory, 'recognized-files', brlFileName);
    if (fs.existsSync(brlFilePath)) {
      fs.unlinkSync(brlFilePath);
      logger.info(`Successfully deleted BRL file at path: ${brlFilePath}`);
    } else {
      logger.warn(`BRL file not found at path: ${brlFilePath}`);
    }
  }

  // Update the document to remove the page
  performUpdateDocument(mainWindow, 'deletePage', documentID, undefined, pageID);
};

export { performDeletePage };
