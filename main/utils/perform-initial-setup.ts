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
  OS_PLATFORM,
  PYTHON_PKG,
  NAPS_SCAN_PKG
} from './constants';
import { spawn, exec } from 'child_process';
import { BrowserWindow } from 'electron';
import treeKill from 'tree-kill';
import { logger } from '../logger';
import path from 'path';
const controller = new AbortController();

let pipUpgrade;
let installRequirements;

const waitUntilFinished = async (process, processName) => {
  process.stdout.on('data', (data) => {
    logger.info(`${processName} stdout: ${data}`);
  });
  process.stderr.on('data', (data) => {
    logger.error(`${processName} stderr: ${data}`);
  });
  return new Promise((resolve, reject) => {
    process.on('close', (code) => {
      if (code !== 0) {
        logger.error(`${processName} exited with non-zero status code: ${code}`);
      }
      resolve(code);
    });
    process.on('error', (error) => {
      logger.error(`Error occurred while waiting for ${processName} to finish: ${error.message}`);
      reject(error);
    });
  });
};
const performInitialSetup = async (mainWindow: BrowserWindow) => {
  if(OS_PLATFORM === 'win32') {
    logger.debug(`Initial Setup for win32 util opened.`);
    mainWindow.webContents.send('initial-setup-progress', 'python', null, false);
    pipUpgrade = spawn(PYTHON_EXE, [`-m`, `pip`, `install`, `pip`, `--upgrade`], {
      detached: false,
    });
    logger.info(`Pip installations started.`);
    await waitUntilFinished(pipUpgrade, 'pipUpgrade');
    pipUpgrade = null;

    logger.info(`Pip installations finished.`);

    mainWindow.webContents.send('initial-setup-progress', 'requirements', null, false);
    logger.info(`Requirements installations started.`);
    installRequirements = spawn(PYTHON_EXE, [`-m`, `pip`, `install`, `-r`, `${REQUIREMENTS_PATH}`], {
      detached: false,
    });
    await waitUntilFinished(installRequirements, 'installRequirements');
    installRequirements = null;
    logger.info(`Requirements installations for win32 finished.`);

  } else if (OS_PLATFORM === 'darwin'){
    logger.debug(`Initial Setup for darwin util opened.`);
    mainWindow.webContents.send('initial-setup-progress', 'python', null, false);

    let pythonInstallation= exec(`installer -pkg ${PYTHON_PKG} -target CurrentUserHomeDirectory`);
    await waitUntilFinished(pythonInstallation, 'pythonInstallation');
    pythonInstallation = null;
    logger.info(`Pip installations finished.`);

    let napsInstallation = exec(`installer -pkg ${NAPS_SCAN_PKG} -target CurrentUserHomeDirectory`);
    await waitUntilFinished(napsInstallation, 'napsInstallation');
    napsInstallation = null;
    logger.info(`Naps installations finished`);
  } else if (OS_PLATFORM === 'linux'){
  //   TODO FINISH LINUX INSTALLATION
  }

  // model installer
  logger.info(`Model download started.`);
  let progressPercentage = 0;
  mainWindow.webContents.send('initial-setup-progress', 'model', progressPercentage, false);

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
      mainWindow.webContents.send('initial-setup-progress', 'model', progressPercentage, false);
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
