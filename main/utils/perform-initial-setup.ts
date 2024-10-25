import fs from 'fs';
import path from 'path';
import { ChildProcess, exec, spawn } from 'child_process';
import { mkdirSync } from 'original-fs';
import axios from 'axios';
import { BrowserWindow } from 'electron';
import treeKill from 'tree-kill';
import { logger } from '../logger';
import {
  PYTHON_VENV_PATH,
  APP_DATA_PATH,
  CHUNK_SIZE,
  IS_DARWIN,
  IS_LINUX,
  IS_WIN32,
  MODEL_SIZE,
  MODEL_URL,
  NAPS_DEB_PKG_64,
  NAPS_RPM_PKG_64,
  NAPS_SCAN_PKG,
  PATH_TO_MODEL,
  PYTHON_EXE,
  PYTHON_PKG,
  ANGELINA_REQUIREMENTS_PATH,
} from './constants';
import { getPythonPath, getLinuxPackaging, getLinuxArchitecture, DEBIAN, RPM, x_64, arm_64 } from './common';

let controller: AbortController;
let pipUpgradeProcess: ChildProcess;
let pythonVenvProcess: ChildProcess;
let installRequirements: ChildProcess;

const setupPython = async (mainWindow: BrowserWindow): Promise<[boolean, string | null]> => {
  mainWindow.webContents.send('initial-setup-progress', 'python', null, false);
  let pythonPath = null;

  if (IS_WIN32) {
    logger.debug('Setting up Python for Windows...');
    pipUpgradeProcess = spawn(PYTHON_EXE, ['-m', 'pip', 'install', 'pip', '--upgrade'], {
      detached: false,
    });
    await waitUntilFinished(pipUpgradeProcess, 'pipUpgrade');
    pipUpgradeProcess = null;
    pythonPath = PYTHON_EXE;
  } else if (IS_LINUX) {
    try {
      pythonPath = await getPythonPath(false);
    } catch (e) {
      logger.info('Unable to locate python on local machine.');
      mainWindow.webContents.send('initial-setup-progress', 'python', null, false, 'missingPython');
      return [false, null];
    }

    logger.info('Creating virtual environment...');
    pythonVenvProcess = spawn(pythonPath, ['-m', 'venv', PYTHON_VENV_PATH], {
      detached: false,
    });
    await waitUntilFinished(pythonVenvProcess, 'pythonVenvProcess');
    pythonVenvProcess = null;

    pythonPath = path.join(PYTHON_VENV_PATH, 'bin', 'python');
  } else if (IS_DARWIN) {
    logger.debug('Setting up Python for macOS...');
    const pythonInstallation = exec(`installer -pkg ${PYTHON_PKG} -target CurrentUserHomeDirectory`);
    await waitUntilFinished(pythonInstallation, 'pythonInstallation');

    try {
      pythonPath = await getPythonPath();
    } catch (e) {
      logger.info('Unable to locate python on local machine.');
      mainWindow.webContents.send('initial-setup-progress', 'python', null, false, 'missingPython');
      return [false, null];
    }
  }

  return [true, pythonPath];
};

const setupAngelinaPipRequirements = async (pythonPath: string, mainWindow: BrowserWindow): Promise<boolean> => {
  mainWindow.webContents.send('initial-setup-progress', 'requirements', null, false);

  if (IS_WIN32) {
    logger.info('Installing requirements for Windows...');
    installRequirements = spawn(pythonPath, ['-m', 'pip', 'install', '-r', `${ANGELINA_REQUIREMENTS_PATH}`], {
      detached: false,
    });
    await waitUntilFinished(installRequirements, 'installRequirements');
    installRequirements = null;
    return true;
  }

  if (IS_DARWIN) {
    logger.info('Installing requirements for macOS...');
    pipUpgradeProcess = exec('pip3 install --upgrade pip');
    await waitUntilFinished(pipUpgradeProcess, 'pipInstallation');
    pipUpgradeProcess = null;
  }

  // Install requirements for Linux/macOS
  if (IS_LINUX || IS_DARWIN) {
    logger.info('Installing requirements...');
    installRequirements = spawn(pythonPath, ['-m', 'pip', 'install', '-r', `${ANGELINA_REQUIREMENTS_PATH}`], {
      detached: false,
    });
    mainWindow.webContents.send('initial-setup-progress', 'python', null, false);
    await waitUntilFinished(installRequirements, 'installRequirements');
    installRequirements = null;
  }

  return true;
};

const setupLiblouis = async (mainWindow: BrowserWindow): Promise<boolean> => {
  if (IS_WIN32) {
    return true;
  }

  mainWindow.webContents.send('initial-setup-progress', 'liblouis', null, false);

  if (IS_DARWIN) {
    // Check if liblouis is installed via homebrew
    const checkLiblouisProcess = exec('brew list liblouis', (error) => {
      if (!error) {
        logger.info('Liblouis is already installed');
        return true;
      }
    });
    await waitUntilFinished(checkLiblouisProcess, 'checkLiblouis');

    if (checkLiblouisProcess.exitCode !== 0) {
      logger.info('Installing liblouis via homebrew...');
      const installLiblouisProcess = exec('pkexec brew install liblouis', (error) => {
        if (error) {
          logger.error(`Failed to install liblouis: ${error.message}`);
          return false;
        }
      });
      await waitUntilFinished(installLiblouisProcess, 'installLiblouis');

      if (installLiblouisProcess.exitCode !== 0) {
        mainWindow.webContents.send('initial-setup-progress', 'liblouis', null, false, 'liblouisInstallationFailed');
        return false;
      }
    }
    return true;
  }

  if (IS_LINUX) {
    const linuxPackaging = await getLinuxPackaging();
    // For Debian/Ubuntu
    if (linuxPackaging === DEBIAN) {
      const checkLiblouisProcess = exec('dpkg -l | grep -q "^ii.*liblouis"', (error) => {
        if (!error) {
          logger.info('Liblouis is already installed');
          return true;
        }
      });
      await waitUntilFinished(checkLiblouisProcess, 'checkLiblouis');

      if (checkLiblouisProcess.exitCode !== 0) {
        logger.info('Installing liblouis...');
        const installLiblouisProcess = exec('pkexec apt-get install -y liblouis', (error) => {
          if (error) {
            logger.error(`Failed to install liblouis: ${error.message}`);
            return false;
          }
        });
        await waitUntilFinished(installLiblouisProcess, 'installLiblouis');

        if (installLiblouisProcess.exitCode !== 0) {
          mainWindow.webContents.send('initial-setup-progress', 'liblouis', null, false, 'liblouisInstallationFailed');
          return false;
        }
      }
    }
    // For RPM-based systems
    else {
      // Check if zypper exists (OpenSUSE)
      const checkZypperProcess = exec('which zypper');
      await waitUntilFinished(checkZypperProcess, 'checkZypper');
      const useZypper = checkZypperProcess.exitCode === 0;

      // Check if liblouis is installed
      const checkLiblouisProcess = exec('rpm -q liblouis');
      await waitUntilFinished(checkLiblouisProcess, 'checkLiblouis');

      if (checkLiblouisProcess.exitCode !== 0) {
        logger.info('Installing liblouis...');
        const installCommand = useZypper
          ? 'pkexec zypper --non-interactive install liblouis'
          : 'pkexec dnf install -y liblouis';

        const installLiblouisProcess = exec(installCommand);
        await waitUntilFinished(installLiblouisProcess, 'installLiblouis');

        if (installLiblouisProcess.exitCode !== 0) {
          logger.error('Failed to install liblouis');
          mainWindow.webContents.send('initial-setup-progress', 'liblouis', null, false, 'liblouisInstallationFailed');
          return false;
        }
      } else {
        logger.info('Liblouis is already installed');
      }
    }
    return true;
  }

  return true;
};

const setupNaps2 = async (mainWindow: BrowserWindow): Promise<boolean> => {
  if (IS_WIN32) {
    return true;
  }

  if (IS_DARWIN) {
    let napsInstallation = exec(`installer -pkg ${NAPS_SCAN_PKG} -target CurrentUserHomeDirectory`);
    await waitUntilFinished(napsInstallation, 'napsInstallation');
    napsInstallation = null;
    logger.info('NAPS2 installation for macOS finished.');
    return true;
  }

  // Linux-specific NAPS2 setup
  let naps2Installed = false;

  const linuxPackaging = await getLinuxPackaging();
  logger.info(`Linux packaging system: ${linuxPackaging}`);

  const linuxArch = await getLinuxArchitecture();
  logger.info(`Linux architecture: ${linuxArch}`);

  // Check existing installation
  const checkNaps2Command = linuxPackaging === DEBIAN ? 'dpkg -l | grep -q "^ii.*naps2"' : 'rpm -q naps2';
  const checkNaps2Process = exec(checkNaps2Command, (error) => {
    naps2Installed = !error;
  });
  await waitUntilFinished(checkNaps2Process, 'checkNaps2');

  if (!naps2Installed) {
    logger.info('NAPS2 is not installed. Installing...');
    mainWindow.webContents.send('initial-setup-progress', 'naps2', null, false);

    const command = `pkexec ${linuxPackaging === DEBIAN ? 'dpkg' : 'rpm'} -i ${determineLinusNaps2InstallationPackage(
      linuxPackaging,
      linuxArch,
    )}`;
    const napsInstallation = exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        logger.error(`Cannot install necessary packages: ${error?.message || stderr}`);
      } else {
        logger.info('Installation started');
      }
    });
    await waitUntilFinished(napsInstallation, 'napsInstallation');

    if (napsInstallation.exitCode !== 0) {
      logger.error('Installation of NAPS2 failed!');
      mainWindow.webContents.send('initial-setup-progress', 'naps', null, false, 'napsInstallationFailed');
      return false;
    }
  }
  return true;
};

const setupModel = async (mainWindow: BrowserWindow): Promise<boolean> => {
  logger.info('Model download started.');
  let progressPercentage = 0;
  mainWindow.webContents.send('initial-setup-progress', 'model', progressPercentage, false);

  let offset = 0;
  if (!fs.existsSync(APP_DATA_PATH)) {
    mkdirSync(APP_DATA_PATH);
  }

  controller = new AbortController();
  while (controller) {
    try {
      const response = await axios.get(MODEL_URL, {
        responseType: 'arraybuffer',
        headers: {
          Range: `bytes=${offset}-${offset + CHUNK_SIZE - 1}`,
        },
        signal: controller.signal,
      });
      if (!controller) {
        return;
      }

      const chunk = Buffer.from(response.data, 'binary');
      fs.appendFileSync(PATH_TO_MODEL, chunk as unknown as Uint8Array);
      offset += chunk.length;
      progressPercentage = Math.round((offset / MODEL_SIZE) * 100);

      const isFinished = chunk.length < CHUNK_SIZE;
      logger.info(`Model download is at ${progressPercentage}%.`);
      if (isFinished) {
        progressPercentage = null;
        mainWindow.webContents.send('initial-setup-progress', null, progressPercentage, true);
        logger.info('Model download finished.');
        return true;
      }
      mainWindow.webContents.send('initial-setup-progress', 'model', progressPercentage, false);
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        logger.error('Download cancelled by user.');
      } else {
        logger.error('Error downloading chunk:', error);
      }
      return false;
    }
  }
  return false;
};

const waitUntilFinished = async (process: ChildProcess, processName: string) => {
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

const determineLinusNaps2InstallationPackage = (packaging: string, architecture: string) => {
  switch (architecture) {
    case x_64:
      switch (packaging) {
        case DEBIAN:
          return NAPS_DEB_PKG_64;
        case RPM:
          return NAPS_RPM_PKG_64;
      }
      break;
    case arm_64:
      // TODO: not supported yet
      // switch (architecture) {
      //   case DEBIAN:
      //     return NAPS_DEB_PKG_arm64;
      //   case RPM:
      //     return NAPS_RPM_PKG_arm64;
      // }
      break;
  }
};

const performInitialSetup = async (mainWindow: BrowserWindow): Promise<boolean> => {
  logger.debug('Initial Setup started.');

  // Setup Python
  const [pythonSuccess, pythonPath] = await setupPython(mainWindow);
  if (!pythonSuccess || (IS_LINUX && !pythonPath)) {
    return false;
  }

  // Setup Requirements
  if (pythonPath) {
    const requirementsSuccess = await setupAngelinaPipRequirements(pythonPath, mainWindow);
    if (!requirementsSuccess) {
      return false;
    }
  }

  // Setup NAPS2
  const naps2Success = await setupNaps2(mainWindow);
  if (!naps2Success) {
    return false;
  }

  // Setup Liblouis
  const liblouisSuccess = await setupLiblouis(mainWindow);
  if (!liblouisSuccess) {
    return false;
  }

  // Setup Model
  const modelSuccess = await setupModel(mainWindow);
  if (!modelSuccess) {
    return false;
  }

  logger.debug('Initial Setup completed.');
  return true;
};

const performCancelInitialSetup = async () => {
  if (pipUpgradeProcess) {
    logger.info('Pip upgrade cancelled by user.');
    treeKill(pipUpgradeProcess.pid, 9);
  } else if (installRequirements) {
    logger.info('Requirements installation cancelled by user.');
    treeKill(installRequirements.pid, 9);
  } else {
    logger.info('Model download cancelled by user.');
    if (controller !== null) {
      controller.abort();
      controller = null;

      if (fs.existsSync(PATH_TO_MODEL)) {
        fs.rmSync(PATH_TO_MODEL, { recursive: true });
      }
    }
  }
  logger.info('Initial setup cancelled by user.');
};

export { performInitialSetup, performCancelInitialSetup };
