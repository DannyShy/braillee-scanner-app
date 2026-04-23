import fs from 'fs';
import path from 'path';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import treeKill from 'tree-kill';
import { BrowserWindow } from 'electron';
import { processError } from '../error';
import { logger } from '../logger';
import { getPythonPath } from '../utils/common';
import { performUpdateDocument } from './perform-manage-document';
import { waitUntilFinished } from './wait-until-finished';
import { performBrailleTranslation } from './perform-braille-translation';
import { ANGELINA_READER_CODE, MY_DOCUMENTS_PATH, PATH_TO_MODEL } from './constants';

const getRecognizedBrailleFilePath = (inputFileAbsolutePath: string, recognizedBraillesDirectoryPath: string) => {
  const brailleInputFileName = path.basename(inputFileAbsolutePath);
  return path.join(recognizedBraillesDirectoryPath, brailleInputFileName.replace(/\.[^.]+$/, '.marked.brl'));
};

const getRecognizedTextFilePath = (inputFileAbsolutePath: string, recognizedBraillesDirectoryPath: string) => {
  const brailleInputFileName = path.basename(inputFileAbsolutePath);
  return path.join(recognizedBraillesDirectoryPath, brailleInputFileName.replace(/\.[^.]+$/, '.marked.txt'));
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

  // Map translation language codes to AngelinaReader language codes
  // AngelinaReader supports: RU, EN, EN2, DE, GR, LV, PL, UZ, UZL
  // EN2 uses the hybrid approach: char-by-char baseline + liblouis word-by-word overlay
  let angelinaLang = 'RU'; // Default to Russian (model was trained on Russian)
  if (translationLanguage === 'en') {
    angelinaLang = 'EN2'; // Use hybrid char-by-char + liblouis approach for English
  } else if (translationLanguage === 'sk') {
    // Slovak is not directly supported, but we can try using RU as it's closest
    angelinaLang = 'RU';
  }

  recognizeBraille = spawn(
    pythonPath,
    [ANGELINA_READER_CODE, fixedInput, recognizedBraillesDirectoryPath, PATH_TO_MODEL, '-l', angelinaLang],
    {
      detached: false,
    },
  );

  try {
    const [code, errors] = await waitUntilFinished(recognizeBraille);
    if (code !== 0) {
      performUpdateDocument(mainWindow, 'editBrailleStatus', documentID, 'recognitionCanceled', pageID);
      processError(mainWindow, new Error(errors || 'error.'));
      return;
    }

    logger.info(`Ended braille recognition for document: ${documentID} page: ${pageID}`);

    let brailleOutput = await fs.promises.readFile(recognizedBrailleFilePath, 'utf8');
    brailleOutput = brailleOutput.replace(/\r/g, '');
    await performUpdateDocument(mainWindow, 'editBrailleText', documentID, brailleOutput, pageID);
    logger.info(`File ${recognizedBrailleFilePath} read successfully.`);

    if (translationLanguage === 'en') {
      // For English, AngelinaReader with EN2 mode already produces interpreted text
      // using the hybrid char-by-char + liblouis word-by-word approach.
      // Read the .marked.txt file directly instead of running a separate liblouis step.
      const recognizedTextFilePath = getRecognizedTextFilePath(inputFileAbsolutePath, recognizedBraillesDirectoryPath);
      try {
        let textOutput = await fs.promises.readFile(recognizedTextFilePath, 'utf8');
        textOutput = textOutput.replace(/\r/g, '');
        logger.info(`Read AngelinaReader text output from: ${recognizedTextFilePath} (${textOutput.length} chars)`);
        await performUpdateDocument(mainWindow, 'editTranslatedText', documentID, textOutput, pageID);
        await performUpdateDocument(mainWindow, 'editTranslatedTextStatus', documentID, 'translatedTextAvailable', pageID);
      } catch (error) {
        logger.error(`Error reading AngelinaReader text output: ${error.message}`);
        // Fallback: run separate liblouis translation if .marked.txt is not available
        await performBrailleTranslation(brailleOutput, documentID, pageID, translationLanguage, mainWindow);
      }
    } else {
      // For Slovak and other languages, run the separate liblouis translation step
      await performBrailleTranslation(brailleOutput, documentID, pageID, translationLanguage, mainWindow);
    }
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
    processError(mainWindow, error);
    logger.error('Error during performRecognizeBraille execution:', error);
    throw error;
  }
  void executeRecognizeBrailleQueue(mainWindow); // Continue with the next script in the queue
};

export { performCancelRecognizeBraille, performRecognizeBraille, executeRecognizeBrailleQueue, addFileToQueue };
