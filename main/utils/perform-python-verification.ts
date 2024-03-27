import { spawn } from 'child_process';
import { BrowserWindow } from 'electron';
import { logger } from '../logger';
import { PYTHON_VERSION } from './constants';

const performPythonVerification = (mainWindow: BrowserWindow) => {
  logger.info('Python version check started.');
  const python = spawn('python3.11', ['--version']);

  python.stdout.on('data', (data: Buffer) => {
    const version = data.toString();
    if (version.startsWith(PYTHON_VERSION)) {
      logger.info(`Python version check passed: ${version}`);
      mainWindow.webContents.send('python-verification', true);
    } else {
      logger.info(`Python version check failed: ${version}`);
      mainWindow.webContents.send('python-verification', false);
    }
  });

  python.stderr.on('data', (data: Buffer) => {
    logger.info(`Python version check error: ${data.toString()}`);
    mainWindow.webContents.send('python-verification', false);
  });
};

export { performPythonVerification };
