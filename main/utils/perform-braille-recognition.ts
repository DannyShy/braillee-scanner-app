import fs from 'fs';
import { ANGELINA_READER_CODE, PATH_TO_MODEL, PYTHON_EXE, MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';
import { performUpdateDocument } from './perform-manage-document';
import { BrowserWindow } from 'electron';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { logger } from '../logger';
import { waitUntilFinished } from './wait-until-finished';

const getRecognizedBrailleFilePath = (inputFileAbsolutePath: string, recognizedBraillesDirectoryPath: string) => {
  const brailleInputFileName = path.basename(inputFileAbsolutePath);
  return path.join(recognizedBraillesDirectoryPath, brailleInputFileName.replace(/\.[^.]+$/, '.marked.brl'));
};

const fixFileFormat = (inputFileAbsolutePath: string): string => {
  const pathWithForwardSlashes = inputFileAbsolutePath.replace('file:///', '');
  return pathWithForwardSlashes.replace(/\//g, '\\');
};

let recognizeBraille: ChildProcessWithoutNullStreams;

const performRecognizeBraille = async (
  inputFileAbsolutePath: string,
  documentID: number,
  pageID: number,
  mainWindow: BrowserWindow,
) => {
  const recognizedBraillesDirectoryPath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'recognized-files');
  const recognizedBrailleFilePath = getRecognizedBrailleFilePath(
    inputFileAbsolutePath,
    recognizedBraillesDirectoryPath,
  );
  if (!fs.existsSync(recognizedBrailleFilePath)) {
    logger.info(`Started braille recognition for document: ${documentID} page: ${pageID}`);
    const fixedInput = fixFileFormat(inputFileAbsolutePath);
    try {
      recognizeBraille = spawn(
        PYTHON_EXE,
        [ANGELINA_READER_CODE, fixedInput, recognizedBraillesDirectoryPath, PATH_TO_MODEL],
        {
          detached: false,
        },
      );
      await waitUntilFinished(recognizeBraille);
      logger.info(`Ended braille recognition for document: ${documentID} page: ${pageID}`);
    } catch (error) {
      logger.error(`Error in Python Braille Recognition: ${error.message}`);
      throw error;
    }
  }
  try {
    const brailleOutput = await fs.promises.readFile(recognizedBrailleFilePath, 'utf8');
    await performUpdateDocument(mainWindow, 'editBrailleText', documentID, brailleOutput, pageID);
    logger.info(`File ${recognizedBrailleFilePath} read successfully.`);
  } catch (error) {
    logger.error(`Error in reading Recognized Braille Output file: ${error.message}`);
    throw error;
  }
  await performUpdateDocument(mainWindow, 'editBrailleStatus', documentID, 'brailleTextAvailable', pageID);
};

const performCancelRecognizeBraille = () => {
  if (recognizeBraille !== null) {
    try {
      treeKill(recognizeBraille.pid, 9);
    } catch (error) {
      logger.error(`Error in cancelling braille recognition: ${error.message}`);
    }
  }
};

const scriptQueue = [];
let isQueueRunning = false;

const addFileToQueue = (fileName: string, documentID: number, pageID: number, mainWindow: BrowserWindow) => {
  logger.info(`Document ${documentID} with ${pageID} added to queue for Braille recognition.`);
  scriptQueue.push({ fileName, documentID, pageID });
  if (!isQueueRunning) {
    logger.debug(`Braille recognition queue execution started.`);
    executeRecognizeBrailleQueue(mainWindow);
  }
};

const executeRecognizeBrailleQueue = async (mainWindow: BrowserWindow) => {
  if (scriptQueue.length === 0) {
    logger.debug(`Braille recognition finished.`);
    isQueueRunning = false;
    logger.debug(`Braille recognition queue execution finished.`);
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
