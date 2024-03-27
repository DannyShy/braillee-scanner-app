import { BrowserWindow } from 'electron';
import { MY_DOCUMENTS_PATH, NAPS_SCAN_TEMPLATE_PROFILE_PATH, pathToResources } from './constants';
import { exec } from 'child_process';
import path from 'path';
import { logger } from '../logger';
import fs from 'fs';
import Handlebars from 'handlebars';

const templateSource = fs.readFileSync(NAPS_SCAN_TEMPLATE_PROFILE_PATH, 'utf8');
const template = Handlebars.compile(templateSource);

let napsScanCliPath: string;
let napsScanProfilesPath: string;
let driver: string;

switch (process.platform) {
  case 'win32':
    driver = 'twain';
    napsScanCliPath = path.join(pathToResources, 'naps2-7.4.0-win/App/NAPS2.Console.exe');
    napsScanProfilesPath = path.join(pathToResources, 'naps2-7.4.0-win/Data/profiles.xml');
    break;
  case 'darwin':
    driver = 'apple';
    // paths to be added
    break;
  case 'linux':
    driver = 'sane';
    napsScanCliPath = path.join(pathToResources, 'naps2-7.4.0-linux/App/NAPS2');
    // where does app saves the profiles.xml file?
    // not portable version of windows NAPS2 saves it to C/Users/username/AppData/Roaming/NAPS2/profiles.xml
    // to find out how does this work on linux
    // profile has to be created in NAPS2 GUI and then check where it is saved
    // napsScanProfilesPath = path.join(pathToResources, 'naps2-7.4.0-linux/Data/profiles.xml');
    break;
}

const performScan = (documentID: number, selectedScanner: string): Promise<string> => {
  selectedScanner = selectedScanner.trim();
  const scannedImagePath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'images', 'scan.pdf');
  updateScannerProfile(selectedScanner);

  return new Promise((resolve, reject) => {
    exec(`${napsScanCliPath} -o "${scannedImagePath}" -p "braille-scanner"`, (error, stdout, stderr) => {
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
  exec(`${napsScanCliPath} --listdevices --driver ${driver}`, (error, stdout, stderr) => {
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
  const profileContent = template({ scannerName, driver });
  fs.writeFile(napsScanProfilesPath, profileContent, (err) => {
    if (err) {
      logger.error(`In performScan, error occurred when creating profile file: ${err.message}`);
      return;
    }
    logger.info('Scanner profile file hase been successfully created.');
  });
};

export { performScan, performDetectScanners };
