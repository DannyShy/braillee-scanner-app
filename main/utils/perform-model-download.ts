import fs from 'fs';
import axios from 'axios';
import { mkdirSync } from 'original-fs';
import { APP_DATA_PATH, PATH_TO_MODEL, MODEL_URL, CHUNK_SIZE, MODEL_SIZE } from './constants';

const performModelDownload = async (mainWindow: Electron.CrossProcessExports.BrowserWindow) => {
  let offset = 0;
  mkdirSync(APP_DATA_PATH);
  while (true) {
    try {
      const response = await axios.get(MODEL_URL, {
        responseType: 'arraybuffer',
        headers: {
          Range: `bytes=${offset}-${offset + CHUNK_SIZE - 1}`,
        },
      });
      const chunk = Buffer.from(response.data, 'binary');
      fs.appendFileSync(PATH_TO_MODEL, chunk);
      offset += chunk.length;
      const progressPercentage = Math.round((offset / MODEL_SIZE) * 100);
      const isFinished: boolean = chunk.length < CHUNK_SIZE;
      mainWindow.webContents.send('download-model-progress', progressPercentage, isFinished);
      if (isFinished) {
        break;
      }
    } catch (error) {
      console.error('Error downloading chunk:', error);
      break;
    }
  }
};

export { performModelDownload };
