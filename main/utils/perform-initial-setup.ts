import fs from 'fs';
import axios from 'axios';
import { mkdirSync } from 'original-fs';
import {
  APP_DATA_PATH,
  PATH_TO_MODEL,
  MODEL_URL,
  CHUNK_SIZE,
  MODEL_SIZE,
  PYTHON_EXE,
  REQUIREMENTS_PATH,
} from './constants';
import util from 'util';
import { exec as execAsync } from 'child_process';
import { BrowserWindow } from 'electron';

const performInitialSetup = async (mainWindow: BrowserWindow) => {
  let progressPercentage;
  let isFinished;
  let requirementsStatus = 1;
  const exec = util.promisify(execAsync);

  mainWindow.webContents.send('initial-setup-progress', progressPercentage, isFinished, requirementsStatus);
  await exec(`${PYTHON_EXE} -m pip install --upgrade pip`);
  await exec(`${PYTHON_EXE} -m pip install -r ${REQUIREMENTS_PATH}`);
  requirementsStatus = 0;
  progressPercentage = '1';
  mainWindow.webContents.send('initial-setup-progress', progressPercentage, isFinished, requirementsStatus);

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
      progressPercentage = Math.round((offset / MODEL_SIZE) * 100);
      isFinished = chunk.length < CHUNK_SIZE;
      mainWindow.webContents.send('initial-setup-progress', progressPercentage, isFinished, requirementsStatus);
      if (isFinished) {
        break;
      }
    } catch (error) {
      console.error('Error downloading chunk:', error);
      break;
    }
  }
};

export { performInitialSetup };
