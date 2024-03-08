import { spawn } from 'child_process';
import { logger } from '../logger';
import { waitUntilFinished } from './wait-until-finished';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { PYTHON_EXE, LIBLOUIS_PYTHON_PATH, MY_DOCUMENTS_PATH } from './constants';
import path from 'path';
import { performUpdateDocument } from './perform-manage-document';
import fs from 'fs';

let translateBraille: ChildProcessWithoutNullStreams;
let translationTable: string;

const performBrailleTranslation = async (brailleText, documentID, pageID, translationLanguage, mainWindow) => {
  logger.info(`Starting Braille translation for document: ${documentID} page: ${pageID}`);
  const resultsDir = path.resolve(MY_DOCUMENTS_PATH, String(documentID), 'translated-files');
  if (translationLanguage === 'sk') {
    translationTable = 'sk-g1.ctb';
  } else if (translationLanguage === 'en') {
    translationTable = 'en-ueb-g2.ctb';
  }
  // Spawn a new child process to run the Python script
  translateBraille = spawn(PYTHON_EXE, [LIBLOUIS_PYTHON_PATH, brailleText, resultsDir, translationTable]);

  await waitUntilFinished(translateBraille);

  // Listen for any response from the Python script
  translateBraille.stdout.on('data', (data) => {
    logger.info(`Python script response: ${data}`);
  });

  // Listen for any error from the Python script
  translateBraille.stderr.on('data', (data) => {
    logger.error(`Python script error: ${data}`);
  });
  const recognizedBrailleFilePath = path.join(resultsDir, 'translatedBrailleDots.txt');
  try {
    const translationOutput = await fs.promises.readFile(recognizedBrailleFilePath, 'utf8');
    await performUpdateDocument(mainWindow, 'editTranslatedText', documentID, translationOutput, pageID);
    await performUpdateDocument(mainWindow, 'editTranslatedTextStatus', documentID, 'translatedTextAvailable', pageID);
  } catch (error) {
    logger.error(`Error reading file: ${error.message}`);
  }
  logger.info(`Finished Braille translation for document: ${documentID} page: ${pageID}`);
};

export { performBrailleTranslation };
