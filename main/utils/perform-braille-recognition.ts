import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { ChildProcessWithoutNullStreams } from 'child_process';
import treeKill from 'tree-kill';
import { BrowserWindow } from 'electron';
import { logger } from '../logger';
import { getPythonPath } from '../utils/common';
import { performUpdateDocument } from './perform-manage-document';
import { waitUntilFinished } from './wait-until-finished';
import { performBrailleTranslation } from './perform-braille-translation';
import { ANGELINA_READER_CODE, PATH_TO_MODEL, MY_DOCUMENTS_PATH } from './constants';

const getRecognizedBrailleFilePath = (inputFileAbsolutePath: string, recognizedBraillesDirectoryPath: string) => {
  const brailleInputFileName = path.basename(inputFileAbsolutePath);
  return path.join(recognizedBraillesDirectoryPath, brailleInputFileName.replace(/\.[^.]+$/, '.marked.brl'));
};

const fixFileFormat = (inputFileAbsolutePath: string): string => {
  const pathWithoutProtocol = inputFileAbsolutePath.replace('file:///', '');
  return path.normalize(pathWithoutProtocol);
};

let recognizeBraille: ChildProcessWithoutNullStreams;

const performRecognizeBraille = async (
  inputFileAbsolutePath: string,
  documentID: number,
  pageID: number,
  translationLanguage: string,
  mainWindow: BrowserWindow,
) => {
  const recognizedBraillesDirectoryPath = path.join(MY_DOCUMENTS_PATH, documentID.toString(), 'recognized-files');
  const recognizedBrailleFilePath = getRecognizedBrailleFilePath(
    inputFileAbsolutePath,
    recognizedBraillesDirectoryPath,
  );
  logger.info(`Started braille recognition for document: ${documentID} page: ${pageID}`);
  const fixedInput = fixFileFormat(inputFileAbsolutePath);
  const pythonPath = await getPythonPath();

  recognizeBraille = spawn(
    pythonPath,
    [ANGELINA_READER_CODE, fixedInput, recognizedBraillesDirectoryPath, PATH_TO_MODEL],
    {
      detached: false,
    },
  );
  await waitUntilFinished(recognizeBraille);
  logger.info(`Ended braille recognition for document: ${documentID} page: ${pageID}`);

  recognizeBraille.stdout.on('data', (data) => {
    logger.info(`Python script response: ${data}`);
  });

  recognizeBraille.stderr.on('data', (data) => {
    logger.error(`Python script error: ${data}`);
    throw new Error(data.message);
  });

  try {
    let brailleOutput = await fs.promises.readFile(recognizedBrailleFilePath, 'utf8');
    brailleOutput = brailleOutput.replace(/\r/g, '');
    await performUpdateDocument(mainWindow, 'editBrailleText', documentID, brailleOutput, pageID);
    logger.info(`File ${recognizedBrailleFilePath} read successfully.`);
    await performBrailleTranslation(brailleOutput, documentID, pageID, translationLanguage, mainWindow);
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

const addFileToQueue = (
  fileName: string,
  documentID: number,
  pageID: string,
  translationLanguage: string,
  mainWindow: BrowserWindow,
) => {
  logger.info(`Document ${documentID} with ${pageID} added to queue for Braille recognition.`);
  scriptQueue.push({ fileName, documentID, pageID, translationLanguage });
  if (!isQueueRunning) {
    logger.debug('Braille recognition queue execution started.');
    void executeRecognizeBrailleQueue(mainWindow);
  } else {
    logger.debug('Braille recognition queue execution skipped.');
  }
};

const executeRecognizeBrailleQueue = async (mainWindow: BrowserWindow) => {
  if (scriptQueue.length === 0) {
    logger.debug('Braille recognition finished.');
    isQueueRunning = false;
    logger.debug('Braille recognition queue execution finished.');
    return;
  }
  isQueueRunning = true;
  const { fileName, documentID, pageID, translationLanguage } = scriptQueue.shift();
  try {
    logger.debug('Braille recognition util running.');
    await performRecognizeBraille(fileName, documentID, pageID, translationLanguage, mainWindow);
  } catch (error) {
    logger.error('Error during performRecognizeBraille execution:', error);
    throw error;
  }
  void executeRecognizeBrailleQueue(mainWindow); // Continue with the next script in the queue
};

export { performCancelRecognizeBraille, performRecognizeBraille, executeRecognizeBrailleQueue, addFileToQueue };
