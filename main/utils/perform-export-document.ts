import { dialog } from 'electron';
import { Document } from './types';
import fs from 'fs';
import { logger } from '../logger';

const performExportDocument = async (activeDocument: Document) => {
  logger.debug(`Export Document util opened.`);
  const userInputPath = await dialog.showSaveDialog({
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });

  if (userInputPath.canceled) {
    logger.info(`SaveDialog for exporting document cancelled by user.`);
    return;
  }
  activeDocument.pages.forEach((page) => {
    if (page.brailleText !== null) {
      // Append brailleText to the file
      fs.appendFileSync(userInputPath.filePath, `${page.brailleText}\n\n`, 'utf-8');
    }
  });
  logger.info(`Braille document successfully exported.`);
  logger.debug(`Export Document util closed.`);
};

export { performExportDocument };
