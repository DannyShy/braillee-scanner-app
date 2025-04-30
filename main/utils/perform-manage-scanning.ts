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

const currentProfile = {
  scannerName: '',
  driver: '',
};

switch (process.platform) {
  case 'win32':
    driver = 'wia';
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

/**
 *  Executes the NAPS scan command to perform a scan and autocreates pages in case of batch scan
 * @param documentID
 * @param selectedScanner
 * @param paperSource
 * @returns Path to a scanned image or folder containing scanned images in case of feeder
 */
const performScan = async (
  documentID: number,
  selectedScanner: string,
  paperSource: ScannerPaperSource,
): Promise<string> => {
  selectedScanner = selectedScanner.trim();
  const scannedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', 'scan.png');
  const scanFolder = path.dirname(scannedImagePath);
  const source = paperSource.toLowerCase();
  await updateScannerProfile(selectedScanner);

  return new Promise((resolve, reject) => {
    exec(
      `${napsCliPath} -o "${scannedImagePath}" -p "braille-scanner" --device "${selectedScanner}" --driver ${driver} --source ${source} -v --force`,
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

        if (paperSource === 'Glass' && !fs.existsSync(scannedImagePath)) {
          reject(new Error('Glass scanned image not found'));
          return;
        } else if (paperSource === 'Feeder') {
          const files = fs.readdirSync(scanFolder);

          if (files.length === 0) {
            reject(new Error('Feeder scanned images not found'));
            return;
          }
          resolve(scanFolder);
        }
        resolve(scannedImagePath);
      },
    );
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

const updateScannerProfile = async (scannerName: string) => {
  if (scannerName === currentProfile.scannerName && driver === currentProfile.driver) {
    logger.info('Scanner profile is already up to date. No need to update.');
    return;
  }

  const profileContent = template({ scannerName, driver });
  // Ensure directory exists
  const profileDir = path.dirname(profilesPath);
  fs.mkdirSync(profileDir, { recursive: true });

  try {
    fs.writeFileSync(profilesPath, profileContent);
    currentProfile.scannerName = scannerName;
    currentProfile.driver = driver;
    logger.info('Scanner profile file has been successfully created.');
  } catch (err) {
    logger.error(`In performScan, error occurred when creating profile file: ${err.message}`);
  }
};

export { performScan, performDetectScanners };
