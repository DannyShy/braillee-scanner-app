import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import { BrowserWindow } from 'electron';
import { logger } from '../logger';
import { ScannerPaperSource } from './types';
import {
  MY_DOCUMENTS_PATH,
  NAPS_SCAN_CLI_PATH_DARWIN,
  NAPS_SCAN_CLI_PATH_LINUX,
  NAPS_SCAN_CLI_PATH_WIN32,
  NAPS_SCAN_PROFILES_PATH_WIN32,
  NAPS_SCAN_PROFILES_PATH_DARWIN,
  NAPS_SCAN_PROFILES_PATH_LINUX,
  NAPS_SCAN_TEMPLATE_PROFILE_PATH,
} from './constants';

const templateSource = fs.readFileSync(NAPS_SCAN_TEMPLATE_PROFILE_PATH, 'utf8');
const template = Handlebars.compile(templateSource);

let driver: string;
let napsCliPath: string;
let profilesPath: string;

switch (process.platform) {
  case 'win32':
    driver = 'twain';
    napsCliPath = NAPS_SCAN_CLI_PATH_WIN32;
    profilesPath = NAPS_SCAN_PROFILES_PATH_WIN32;
    break;
  case 'darwin':
    driver = 'apple';
    napsCliPath = NAPS_SCAN_CLI_PATH_DARWIN;
    profilesPath = NAPS_SCAN_PROFILES_PATH_DARWIN;
    break;
  case 'linux':
    driver = 'sane';
    napsCliPath = NAPS_SCAN_CLI_PATH_LINUX;
    profilesPath = NAPS_SCAN_PROFILES_PATH_LINUX;
    break;
}

const performScan = (documentID: number, selectedScanner: string, paperSource: ScannerPaperSource): Promise<string> => {
  selectedScanner = selectedScanner.trim();
  const scannedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', 'scan.pdf');
  updateScannerProfile(selectedScanner, paperSource);

  return new Promise((resolve, reject) => {
    exec(
      `${napsCliPath} -o "${scannedImagePath}" -p "braille-scanner" --device "${selectedScanner}" --driver ${driver} --force`,
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
        if (!fs.existsSync(scannedImagePath)) {
          reject(new Error('Scanned image not found'));
          return;
        }
        resolve(scannedImagePath);
      },
    );
    logger.info('Detected darwin/linux system');
  });
};

const performDetectScanners = (mainWindow: BrowserWindow) => {
  exec(`${napsCliPath} --listdevices --driver ${driver}`, (error, stdout, stderr) => {
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

const updateScannerProfile = (scannerName: string, paperSource: ScannerPaperSource) => {
  const profileContent = template({ scannerName, driver, paperSource });
  // Ensure directory exists
  const profileDir = path.dirname(profilesPath);
  fs.mkdirSync(profileDir, { recursive: true });

  fs.writeFile(profilesPath, profileContent, (err) => {
    if (err) {
      logger.error(`In performScan, error occurred when creating profile file: ${err.message}`);
      return;
    }
    logger.info('Scanner profile file hase been successfully created.');
  });
};

export { performScan, performDetectScanners };
