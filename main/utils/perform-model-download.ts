import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { mkdirSync } from 'original-fs';

const downloadModelWithProgress = async (mainWindow, app) => {
  const userDataPath = app.getPath('userData');
  const pathFolder = path.resolve(userDataPath, '.braille-scanner');
  const pathFile = path.resolve(pathFolder, 'model.t7');
  const modelUrl = 'http://ovdv.ru/files/retina_chars_eced60.clr.008';
  try {
    if (!fs.existsSync(pathFolder)) {
      mkdirSync(pathFolder);
      const response = await axios.get(modelUrl, {
        method: 'GET',
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          const { progress } = progressEvent;
          const progressPercentage = Math.round(progress * 100);
          mainWindow.webContents.send('download-model-progress', progressPercentage);
        },
      });

      const buffer = Buffer.from(response.data, 'binary');
      fs.writeFileSync(pathFile, buffer);
    } else {
      console.log('Model is already downloaded');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

export { downloadModelWithProgress };
