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
  PYTHON_HOME,
  PYTHON_MODULES,
} from './constants';
import util from 'util';
import { exec as execAsync } from 'child_process';

const performInitialSetup = async (mainWindow: Electron.CrossProcessExports.BrowserWindow) => {
  // process.env.PYTHONPATH = `${PYTHON_EXE}`;
  // process.env.PYTHONHOME = `${PYTHON_HOME}`;
  // process.env.PYTHONPATH = null;
  // process.env.PYTHONHOME = null;
  const exec = util.promisify(execAsync);
  mainWindow.webContents.send('requirements-status', 0);
  // await exec(`setx PYTHONHOME "${PYTHON_HOME}"`);
  // await exec(`setx PYTHONPATH "${PYTHON_MODULES}"`);
  await exec(`${PYTHON_EXE} -m pip install --upgrade pip`);
  await exec(`${PYTHON_EXE} -m pip install -r ${REQUIREMENTS_PATH}`);
  mainWindow.webContents.send('requirements-status', 1);

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

export { performInitialSetup };
