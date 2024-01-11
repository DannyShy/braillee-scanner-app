import fs from 'fs';
import { ANGELINA_READER_CODE, PATH_TO_MODEL, PYTHON_EXE, TEMP_OUTPUT } from './constants';
import path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';
import { performUpdateDocument } from './perform-manage-document';
import { BrowserWindow } from 'electron';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { logger } from '../logger';

const getBrailleFilePath = (scannedFilePath: string) => {
  const brailleInputFileName = path.basename(scannedFilePath);
  return path.join(TEMP_OUTPUT, brailleInputFileName.replace(/\.[^.]+$/, '.marked.brl'));
};

const fixFileFormat = (brailleInput: string): string => {
  const pathWithForwardSlashes = brailleInput.replace('file:///', '');
  return pathWithForwardSlashes.replace(/\//g, '\\');
};

const waitUntilFinished = async (process: ChildProcessWithoutNullStreams): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    process.on('close', (code) => {
      resolve(code);
    });
  });
};

let recognizeBraille: ChildProcessWithoutNullStreams;

const performRecognizeBraille = async (
  fileName: string,
  documentID: number,
  pageID: number,
  mainWindow: BrowserWindow,
) => {
  const brailleFilePath = getBrailleFilePath(fileName);
  if (!fs.existsSync(brailleFilePath)) {
    logger.info(`Started braille recognition for document: ${documentID} page: ${pageID}`);
    const fixedInput = fixFileFormat(fileName);
    try {
      recognizeBraille = spawn(PYTHON_EXE, [ANGELINA_READER_CODE, fixedInput, TEMP_OUTPUT, PATH_TO_MODEL], {
        detached: false,
      });
      await waitUntilFinished(recognizeBraille);
      logger.info(`Ended braille recognition for document: ${documentID} page: ${pageID}`);
    } catch (error) {
      logger.error(`Error in Python Braille Recognition: ${error.message}`);
      throw error;
    }
  }
  try {
    const brailleOutput = await fs.promises.readFile(brailleFilePath, 'utf8');
    await performUpdateDocument(mainWindow, 'editBrailleText', documentID, brailleOutput, pageID);
  } catch (error) {
    logger.error(`Error in reading Recognized Braille Output file: ${error.message}`);
    throw error;
  }
  await performUpdateDocument(mainWindow, 'editBrailleStatus', documentID, 'brailleTextAvailable', pageID);
};

const performCancelRecognizeBraille = () => {
  if (recognizeBraille !== null) {
    treeKill(recognizeBraille.pid, 9);
  }
};

const scriptQueue = [];
let isQueueRunning = false;

const addFileToQueue = (fileName: string, documentID: number, pageID: number, mainWindow: BrowserWindow) => {
  logger.info(`Document ${documentID} with ${pageID} added to queue for Braille recognition.`);
  scriptQueue.push({ fileName, documentID, pageID });
  if (!isQueueRunning) {
    executeRecognizeBrailleQueue(mainWindow);
  }
};

const executeRecognizeBrailleQueue = async (mainWindow: BrowserWindow) => {
  if (scriptQueue.length === 0) {
    logger.debug(`Braille recognition finished.`);
    isQueueRunning = false;
    return;
  }
  isQueueRunning = true;
  const { fileName, documentID, pageID } = scriptQueue.shift();
  try {
    logger.debug(`Braille recognition util running.`);
    await performRecognizeBraille(fileName, documentID, pageID, mainWindow);
  } catch (error) {
    logger.error('Error during performRecognizeBraille execution:', error);
    throw error;
  }
  executeRecognizeBrailleQueue(mainWindow); // Continue with the next script in the queue
};

export { performCancelRecognizeBraille, performRecognizeBraille, executeRecognizeBrailleQueue, addFileToQueue };
