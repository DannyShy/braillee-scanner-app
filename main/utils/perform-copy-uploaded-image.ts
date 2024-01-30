import fs from 'fs';
import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import { logger } from '../logger';

const performCopyUploadedImage = (imagePath: string, documentID: number) => {
  const decodedImagePath = decodeURIComponent(imagePath.replace('file:///', ''));
  const destinationPath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', path.basename(imagePath));
  fs.copyFile(decodedImagePath, destinationPath, (err) => {
    if (err) {
      logger.error(`Error copying file from ${imagePath} to ${destinationPath}:`, err);
    } else {
      logger.info(`File copied successfully from ${imagePath} to ${destinationPath}.`);
    }
  });
};

export { performCopyUploadedImage };
