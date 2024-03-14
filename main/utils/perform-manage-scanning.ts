import { BrowserWindow } from 'electron';
import { MY_DOCUMENTS_PATH, NAPS_SCAN_CLI_PATH, NAPS_SCAN_PROFILES_PATH } from './constants';
import { exec } from 'child_process';
import path from 'path';
import { logger } from '../logger';
import fs from 'fs';

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
  if (fs.existsSync(NAPS_SCAN_PROFILES_PATH)) {
    // delete old profile file
    fs.unlink(NAPS_SCAN_PROFILES_PATH, (err) => {
      if (err) {
        logger.error(`In performScan, error occurred when deleting profile file: ${err.message}`);
        return;
      }
    });
  }
  //create new profile file
  const profileContent = createScannerProfile(scannerName);
  fs.writeFile(NAPS_SCAN_PROFILES_PATH, profileContent, (err) => {
    if (err) {
      logger.error(`In performScan, error occurred when creating profile file: ${err.message}`);
      return;
    }
    logger.info('Scanner profile file hase been successfully created.');
  });
};

const createScannerProfile = (scannerName: string) => {
  return `<ArrayOfScanProfile>
<ScanProfile>
<Version>2</Version>
<Device>
<ID>${scannerName}</ID>
<Name>${scannerName}</Name>
</Device>
<DriverName>twain</DriverName>
<DisplayName>braille-scanner</DisplayName>
<IconID>0</IconID>
<MaxQuality>false</MaxQuality>
<IsDefault>true</IsDefault>
<UseNativeUI>false</UseNativeUI>
<AfterScanScale>OneToOne</AfterScanScale>
<Brightness>-100</Brightness>
<Contrast>40</Contrast>
<BitDepth>C24Bit</BitDepth>
<PageAlign>Right</PageAlign>
<PageSize>A4</PageSize>
<CustomPageSizeName xmlns:p3="http://www.w3.org/2001/XMLSchema-instance" p3:nil="true"/>
<CustomPageSize xmlns:p3="http://www.w3.org/2001/XMLSchema-instance" p3:nil="true"/>
<Resolution>Dpi300</Resolution>
<PaperSource>Feeder</PaperSource>
<EnableAutoSave>false</EnableAutoSave>
<AutoSaveSettings xmlns:p3="http://www.w3.org/2001/XMLSchema-instance" p3:nil="true"/>
<Quality>75</Quality>
<AutoDeskew>false</AutoDeskew>
<RotateDegrees>0</RotateDegrees>
<BrightnessContrastAfterScan>true</BrightnessContrastAfterScan>
<ForcePageSize>false</ForcePageSize>
<ForcePageSizeCrop>false</ForcePageSizeCrop>
<TwainImpl>Default</TwainImpl>
<TwainProgress>false</TwainProgress>
<ExcludeBlankPages>false</ExcludeBlankPages>
<BlankPageWhiteThreshold>70</BlankPageWhiteThreshold>
<BlankPageCoverageThreshold>25</BlankPageCoverageThreshold>
<WiaOffsetWidth>false</WiaOffsetWidth>
<WiaRetryOnFailure>false</WiaRetryOnFailure>
<WiaDelayBetweenScans>false</WiaDelayBetweenScans>
<WiaDelayBetweenScansSeconds>2</WiaDelayBetweenScansSeconds>
<WiaVersion>Default</WiaVersion>
<FlipDuplexedPages>false</FlipDuplexedPages>
<KeyValueOptions xmlns:p3="http://www.w3.org/2001/XMLSchema-instance" p3:nil="true"/>
</ScanProfile>
</ArrayOfScanProfile>`;
};

export { performScan, performDetectScanners };
