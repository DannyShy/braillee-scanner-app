import { dialog } from 'electron';
import { Document } from './types';
import fs from 'fs';

const performExportDocument = async (activeDocument: Document) => {
  const userInputPath = await dialog.showSaveDialog({
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });

  if (userInputPath.canceled) {
    return;
  }
  let pageCounter = 1;
  activeDocument.pages.forEach((page) => {
    if (page.brailleText !== null) {
      // Append brailleText to the file
      fs.appendFileSync(userInputPath.filePath, `Page ${pageCounter}:\n${page.brailleText}\n\n`, 'utf-8');
      pageCounter += 1;
    }
  });
};

export { performExportDocument };
