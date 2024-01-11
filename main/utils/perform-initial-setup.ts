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
import { logger } from '../logger';

const controller = new AbortController();

let pipUpgrade;
let installRequirements;

const waitUntilFinished = async (process) => {
  return new Promise((resolve, reject) => {
    process.on('close', (code) => {
      resolve(code);
    });
  });
};

const performInitialSetup = async (mainWindow: BrowserWindow) => {
  logger.debug(`Initial Setup util opened.`);
  mainWindow.webContents.send('initial-setup-progress', 'Installing Python library...', null, false);

  pipUpgrade = spawn(PYTHON_EXE, [`-m`, `pip`, `install`, `--upgrade pip`], {
    detached: false,
  });
  logger.info(`Pip installations started.`);
  await waitUntilFinished(pipUpgrade);
  pipUpgrade = null;
  logger.info(`Pip installations finished.`);

  mainWindow.webContents.send('initial-setup-progress', 'Installing requirements...', null, false);
  logger.info(`Requirements installations started.`);
  installRequirements = spawn(PYTHON_EXE, [`-m`, `pip`, `install`, `-r`, `${REQUIREMENTS_PATH}`], {
    detached: false,
  });
  await waitUntilFinished(installRequirements);
  installRequirements = null;
  logger.info(`Requirements installations finished.`);

  logger.info(`Model download started.`);
  let progressPercentage = 0;
  mainWindow.webContents.send('initial-setup-progress', 'Downloading model...', progressPercentage, false);

  let offset = 0;
  if (!fs.existsSync(APP_DATA_PATH)) {
    mkdirSync(APP_DATA_PATH);
  }
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

      const isFinished = chunk.length < CHUNK_SIZE;
      logger.info(`Model download is at ${progressPercentage}%.`);
      if (isFinished) {
        progressPercentage = null;
        mainWindow.webContents.send('initial-setup-progress', null, progressPercentage, true);
        logger.info(`Model download finished.`);
        break;
      }
      mainWindow.webContents.send('initial-setup-progress', 'Downloading model...', progressPercentage, false);
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        logger.error('Download cancelled by user.');
      } else {
        logger.error('Error downloading chunk:', error);
      }
      break;
    }
  }
  logger.debug(`Initial Setup util closed.`);
};

const performCancelInitialSetup = async () => {
  if (pipUpgrade !== null) {
    treeKill(pipUpgrade.pid, 9);
  } else if (installRequirements !== null) {
    treeKill(installRequirements.pid, 9);
  } else {
    controller.abort();
  }
  logger.info(`Initial setup cancelled by user.`);
};

export { performInitialSetup, performCancelInitialSetup };
