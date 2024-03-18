import { BrowserWindow } from 'electron';
import {
  MY_DOCUMENTS_PATH,
  NAPS_SCAN_CLI_PATH,
  NAPS_SCAN_PROFILES_PATH,
  NAPS_SCAN_TEMPLATE_PROFILE_PATH,
} from './constants';
import { exec } from 'child_process';
import path from 'path';
import { logger } from '../logger';
import fs from 'fs';
import Handlebars from 'handlebars';

const templateSource = fs.readFileSync(NAPS_SCAN_TEMPLATE_PROFILE_PATH, 'utf8');
const template = Handlebars.compile(templateSource);

const performScan = (documentID: number, pageID: string, selectedScanner: string): Promise<string> => {
  selectedScanner = selectedScanner.trim();
  const scannedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', pageID, 'scan.jpg');
  updateScannerProfile(selectedScanner);

  return new Promise((resolve, reject) => {
    exec(`${NAPS_SCAN_CLI_PATH} -o "${scannedImagePath}" -p "braille-scanner"`, (error, stdout, stderr) => {
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
    });
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
    logger.info(`In performDetectScanners, stdout is: ${stdout}`);
    const sources: string[] = stdout.split('\n');
    mainWindow.webContents.send('scanners-list', sources);
  });
};

const updateScannerProfile = (scannerName: string) => {
  const profileContent = template({ scannerName });
  fs.writeFile(NAPS_SCAN_PROFILES_PATH, profileContent, (err) => {
    if (err) {
      logger.error(`In performScan, error occurred when creating profile file: ${err.message}`);
      return;
    }
    logger.info('Scanner profile file hase been successfully created.');
  });
};

export { performScan, performDetectScanners };
