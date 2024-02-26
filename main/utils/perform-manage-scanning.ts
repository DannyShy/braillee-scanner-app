import { BrowserWindow } from 'electron';
import { MY_DOCUMENTS_PATH, NAPS_SCAN_CLI_PATH } from './constants';
import { exec } from 'child_process';
import path from 'path';
import { logger } from '../logger';

const performScan = (documentID: number, pageID: string, selectedScanner: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    selectedScanner = selectedScanner.trim();
    const scannedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', pageID, '.jpg');
    exec(
      `${NAPS_SCAN_CLI_PATH} -o ${scannedImagePath} --noprofile --driver twain --device "${selectedScanner}" --source feeder --dpi 300 --pagesize a4 -f`,
      (error, stdout, stderr) => {
        if (error) {
          logger.error(`In performScan, error occurred: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          logger.error(`In performScan, stderr is: ${stderr}`);
          reject(new Error(stderr));
          return;
        }
        logger.info(`In performScan, stdout is: ${stdout}`);
        resolve(scannedImagePath);
      },
    );
  });
};

const performDetectScanners = (mainWindow: BrowserWindow) => {
  exec(`${NAPS_SCAN_CLI_PATH} --listdevices --driver twain`, (error, stdout, stderr) => {
    if (error) {
      logger.error(`In performDetectScanners, error occurred: ${error.message}`);
      return;
    }
    if (stderr) {
      logger.error(`In performDetectScanners, stderr is: ${stderr}`);
      return;
    }
    const sources: string[] = stdout.split('\n');
    mainWindow.webContents.send('scanners-list', sources);
  });
};

export { performScan, performDetectScanners };
