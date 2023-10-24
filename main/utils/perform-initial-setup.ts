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
import { spawn } from 'child_process';
import { BrowserWindow } from 'electron';
import treeKill from 'tree-kill';

const controller = new AbortController();

let pipUpgrade;
let installRequirements;

const performInitialSetup = async (mainWindow: BrowserWindow) => {
  let progressPercentage;
  let isFinished;
  let requirementsStatus = 1;

  mainWindow.webContents.send('initial-setup-progress', progressPercentage, isFinished, requirementsStatus);
  pipUpgrade = spawn(PYTHON_EXE, [`-m`, `pip`, `install`, `--upgrade pip`], {
    detached: false,
  });
  installRequirements = spawn(PYTHON_EXE, [`-m`, `pip`, `install`, `-r`, `${REQUIREMENTS_PATH}`], {
    detached: false,
  });
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
        signal: controller.signal,
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
      if (error.code === 'ERR_CANCELED') {
        console.log('Download cancelled by user.');
      } else {
        console.error('Error downloading chunk:', error);
      }
      break;
    }
  }
};

const performCancelInitialSetup = async () => {
  if (pipUpgrade.exitCode === null) {
    treeKill(pipUpgrade.pid, 9);
    controller.abort();
  } else if (typeof pipUpgrade.exitCode === 'number' && installRequirements.exitCode === null) {
    treeKill(installRequirements.pid, 9);
    controller.abort();
  } else if (typeof pipUpgrade.exitCode === 'number' && typeof installRequirements.exitCode === 'number') {
    controller.abort();
  }
};

export { performInitialSetup, performCancelInitialSetup };
