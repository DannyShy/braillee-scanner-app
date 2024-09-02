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
  IS_DARWIN,
  IS_LINUX,
  IS_WIN32,
  PYTHON_PKG,
  NAPS_SCAN_PKG,
  NAPS_RPM_PKG_64,
  NAPS_DEB_PKG_64,
  NAPS_DEB_PKG_arm64,
  NAPS_RPM_PKG_arm64
} from './constants';
import { spawn, exec } from 'child_process';
import { BrowserWindow } from 'electron';
import treeKill from 'tree-kill';
import { logger } from '../logger';
import path from 'path';
import {version} from 'react';
const controller = new AbortController();

let pipUpgrade;
let installRequirements;

// LINUX constants
const DEBIAN = 'debian';
const RPM = 'rpm';
const x_64 = 'x64';
const arm_64 = 'arm64';

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

function determineLinuxInstallationPackage(version, architecture) {
  switch (version) {
    case x_64:
      switch (architecture){
        case DEBIAN:
          return NAPS_DEB_PKG_64;
        case RPM:
          return NAPS_RPM_PKG_64;
      }
    case arm_64:
      switch (architecture){
        case DEBIAN:
          return NAPS_DEB_PKG_arm64;
        case RPM:
          return NAPS_RPM_PKG_arm64;
      }
  }
}
const performInitialSetup = async (mainWindow: BrowserWindow) => {
  // ### win32
  if(IS_WIN32) {
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
    logger.info(`Requirements installation for win32 finished.`);
  }
  //### MACOS
  if (IS_DARWIN){
    logger.debug(`Initial Setup for darwin util opened.`);
    mainWindow.webContents.send('initial-setup-progress', 'python', null, false);

    let pythonInstallation= exec(`installer -pkg ${PYTHON_PKG} -target CurrentUserHomeDirectory`);
    await waitUntilFinished(pythonInstallation, 'pythonInstallation');
    pythonInstallation = null;
    logger.info(`Pip installations finished.`);

    let napsInstallation = exec(`installer -pkg ${NAPS_SCAN_PKG} -target CurrentUserHomeDirectory`);
    await waitUntilFinished(napsInstallation, 'napsInstallation');
    napsInstallation = null;
    logger.info(`Requirements installation for darwin finished.`);
  }
  //### LINUX
  if (IS_LINUX) {
    const DEBIAN = 'debian';
    const RPM = 'rpm';
    const x_64 = 'x64';
    const arm_64 = 'arm64';
    let linuxVersion;
    let linuxArch;
    logger.debug(`Initial Setup for linux util opened.`);
    // DETERMINE LINUX PACKAGE MANAGER
    exec(`which dpkg`, (error, stdout, stderr) => {
      if(error || stderr){
        logger.error('Cannot determine linux distribution!');
        return;
      } else {
        linuxVersion = stdout.trim().toString() !== null ? DEBIAN : RPM;
      }
    });

    // DETERMINE LINUX ARCHITECTURE
    exec(`uname -u`, (error, stdout, stderr) => {
      if(error || stderr){
        logger.error('Cannot determine linux architecture');
        return;
      } else {
        linuxArch = stdout.trim().toString() !== 'aarch64' ? x_64: arm_64;
      }
    })

    // RUN INSTALLER COMMAND
    let command = `sudo ${linuxVersion === 'DEBIAN' ? 'dpkg' : 'rpm'} -i ${determineLinuxInstallationPackage(linuxVersion, linuxArch)} }`
    let napsInstallation = exec(command, (error, stdout, stderr) =>{
      if(error || stderr){
        logger.error('Cannot install necessary packages!');
      } else {
        logger.info('Installation started');
      }
    });
    await waitUntilFinished(napsInstallation, 'napsInstallation');
    napsInstallation = null;
    logger.info(`Requirements installation for linux finished.`);
  }

  // MODEL INSTALLER
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
