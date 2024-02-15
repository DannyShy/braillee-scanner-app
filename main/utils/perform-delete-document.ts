import { BrowserWindow } from 'electron';
import { MY_DOCUMENTS_PATH } from './constants';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';

// const deleteDirectory = (directory: string, mainWindow: BrowserWindow) => {
//   let errorOccurred = false;
//   if (fs.existsSync(directory)) {
//     fs.readdirSync(directory).forEach((file) => {
//       const currentPath = path.join(directory, file);
//       try {
//         if (fs.lstatSync(currentPath).isDirectory()) {
//           // Recurse if the current path is a directory
//           deleteDirectory(currentPath, mainWindow);
//         } else {
//           // Delete file
//           fs.unlinkSync(currentPath);
//         }
//       } catch (error) {
//         logger.error('Failed to delete file or subdirectory:', error);
//         mainWindow.webContents.send('delete-document-status', false, currentPath);
//         errorOccurred = true;
//         return;
//       }
//     });
//     if (!errorOccurred) {
//       try {
//         // Delete directory
//         fs.rmdirSync(directory);
//       } catch (error) {
//         logger.error('Failed to delete directory:', error);
//         mainWindow.webContents.send('delete-document-status', false, directory);
//         errorOccurred = true;
//       }
//     }
//   }
//   return errorOccurred;
// };

const deleteDirectory = (directory: string, mainWindow: BrowserWindow) => {
  // Always throw an error for testing purposes
  const error = new Error('Test error');
  logger.error('Failed to delete file or subdirectory:', error);
  mainWindow.webContents.send('delete-document-status', false, directory);
  return true; // Indicate that an error occurred
};

const performDeleteDocument = (documentID: number, mainWindow: BrowserWindow) => {
  const directory = path.join(MY_DOCUMENTS_PATH, documentID.toString());
  const errorOccurred = deleteDirectory(directory, mainWindow);
  if (!errorOccurred) {
    mainWindow.webContents.send('delete-document-status', true, null);
  }
};

export { performDeleteDocument };
