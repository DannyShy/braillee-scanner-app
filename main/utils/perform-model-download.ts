import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { mkdirSync } from 'original-fs';

const perfomModelDownload = async (mainWindow, app) => {
  const pathFolder = path.resolve(app.getPath('userData'), '.braille-scanner');
  const pathToModel = path.resolve(pathFolder, 'model.t7');
  const modelUrl = 'http://ovdv.ru/files/retina_chars_eced60.clr.008';
  const chunkSize = 1024 * 1414;
  const modelSizeInBytes = 144771584;
  let offset = 0;
  mkdirSync(pathFolder);
  while (true) {
    try {
      const response = await axios.get(modelUrl, {
        responseType: 'arraybuffer',
        headers: {
          Range: `bytes=${offset}-${offset + chunkSize - 1}`,
        },
      });
      const chunk = Buffer.from(response.data, 'binary');
      fs.appendFileSync(pathToModel, chunk);
      offset += chunk.length;
      const progressPercentage = Math.round((offset / modelSizeInBytes) * 100);
      mainWindow.webContents.send('download-model-progress', progressPercentage);
      //1447936 is size of regular chunk. if its less than 1447936 it was last one.
      if (chunk.length < 1447936) {
        break;
      }
    } catch (error) {
      console.error('Error downloading chunk:', error);
      break;
    }
  }
};

export { perfomModelDownload };
