import { MY_DOCUMENTS_PATH } from './constants';
import fs from 'fs';
import path from 'path';

const deleteDirectory = (directory: string) => {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((file) => {
      const currentPath = path.join(directory, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        // Recurse if the current path is a directory
        deleteDirectory(currentPath);
      } else {
        // Delete file
        fs.unlinkSync(currentPath);
      }
    });
    // Delete directory
    fs.rmdirSync(directory);
  }
};

const performDeleteDocument = (documentID: number) => {
  const directory = path.join(MY_DOCUMENTS_PATH, documentID.toString());
  deleteDirectory(directory);
};

export { performDeleteDocument };
