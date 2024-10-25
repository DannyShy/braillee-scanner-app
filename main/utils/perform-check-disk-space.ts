import checkDiskSpace from 'check-disk-space';
import { logger } from '../logger';
import { DISK_NAME, MODEL_AND_DEPENDENCIES_SIZE } from './constants';

const bytesToSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 'n/a';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

const performCheckDiskSpace = async (mainWindow) => {
  logger.debug('Check of disk space started.');
  try {
    const diskSpace = await checkDiskSpace(DISK_NAME);
    let spaceToBeEmptied;
    if (diskSpace.free > MODEL_AND_DEPENDENCIES_SIZE) {
      spaceToBeEmptied = 0;
      logger.info('Check of disk space finished. There is enough space to proceed with the installation.');
    } else {
      spaceToBeEmptied = bytesToSize(diskSpace.free - MODEL_AND_DEPENDENCIES_SIZE);
      logger.info(`Check of disk space finished. You need to empty ${spaceToBeEmptied}.`);
    }
    mainWindow.webContents.send('disk-space-output', spaceToBeEmptied);
  } catch (error) {
    logger.error(`Error occured during check of disk space: ${error}.`);
    throw error;
  }
};

export { performCheckDiskSpace };
