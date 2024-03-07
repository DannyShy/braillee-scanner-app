import { MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import fs from 'fs';

const performDeletePage = async (documentID: string, file: string) => {
  const documentDirectory = path.join(MY_DOCUMENTS_PATH, documentID.toString());
  const imagePath = path.join(documentDirectory, 'images', path.basename(file));
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  const nameWithoutExtension = path.basename(file, path.extname(file));
  const brlFileName = `${nameWithoutExtension}.marked.brl`;
  const brlFilePath = path.join(documentDirectory, 'recognized-files', brlFileName);
  if (fs.existsSync(brlFilePath)) fs.unlinkSync(brlFilePath);
};

export { performDeletePage };
