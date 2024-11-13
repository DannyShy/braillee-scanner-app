import { exec } from 'child_process';
import path from 'path';
import { logger } from '../logger';
import { IS_WIN32, PYTHON_EXE, PYTHON_VENV_PATH } from './constants';

// Linux constants
export const DEBIAN = 'debian';
export const RPM = 'rpm';
export const x_64 = 'x64';
export const arm_64 = 'arm64';

const getPythonPath = async (useVirtualEnv = true): Promise<string> => {
  if (useVirtualEnv) {
    return path.join(PYTHON_VENV_PATH, 'bin', 'python');
  }

  if (IS_WIN32) {
    return PYTHON_EXE;
  } else {
    return new Promise<string>((resolve, reject) => {
      exec('which python3.11', (error, stdout, stderr) => {
        if (error) {
          logger.error(error);
          reject(error);
        }
        if (stderr) {
          logger.error(`Error occured : ${stderr}`);
          reject(stderr);
        }
        if (stdout) {
          const pythonPath = stdout.trim().toString();
          logger.info(`Python3 location found in ${pythonPath}!`);
          resolve(pythonPath);
        }
      });
    });
  }
};

const getLinuxPackaging = async (): Promise<string> => {
  return new Promise((resolve) => {
    exec('which dpkg', (error, stdout, stderr) => {
      if (error || stderr) {
        resolve(RPM);
      } else {
        resolve(stdout.trim().toString() !== null ? DEBIAN : RPM);
      }
    });
  });
};

const getLinuxArchitecture = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec('uname -m', (error, stdout, stderr) => {
      if (error || stderr) {
        logger.error('Cannot determine linux architecture');
        reject(error || stderr);
      } else {
        resolve(stdout.trim().toString() !== 'aarch64' ? x_64 : arm_64);
      }
    });
  });
};

export { getPythonPath, getLinuxPackaging, getLinuxArchitecture };
