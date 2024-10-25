import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';
import { getPythonPath } from '../utils/common';
import { waitUntilFinished } from './wait-until-finished';
// universal constants
import { LIBLOUIS_PYTHON_PATH, MY_DOCUMENTS_PATH } from './constants';

import { performUpdateDocument } from './perform-manage-document';

let translateBraille: ChildProcessWithoutNullStreams;
let translationTable: string;

const performBrailleTranslation = async (brailleText, documentID, pageID, translationLanguage, mainWindow) => {
  logger.info(`Starting Braille translation for document: ${documentID} page: ${pageID}`);
  const resultsDir = path.resolve(MY_DOCUMENTS_PATH, String(documentID), 'translated-files');
  //
  if (translationLanguage === 'sk') {
    translationTable = 'sk-g1.ctb';
  } else if (translationLanguage === 'en') {
    translationTable = 'en-ueb-g2.ctb';
  }

  const recognizedBrailleFilePath = path.join(resultsDir, 'translatedBrailleDots.txt');

  // delete the old translation file to make sure that it is not read instead of new one if the translation fails
  if (fs.existsSync(recognizedBrailleFilePath)) {
    fs.unlink(recognizedBrailleFilePath, (err) => {
      if (err) {
        logger.error(`In performScan, error occurred when deleting profile file: ${err.message}`);
        return;
      }
    });
  }

  // Spawn a new child process to run the Python script
  logger.info('Commencing liblious translation!');
  const pythonPath = await getPythonPath();
  if (pythonPath) {
    translateBraille = spawn(pythonPath, [LIBLOUIS_PYTHON_PATH, brailleText, resultsDir, translationTable]);

    // Listen for any response from the Python script
    translateBraille.stdout.on('data', (data) => {
      logger.info(`Python script response: ${data}`);
    });

    // Listen for any error from the Python script
    translateBraille.stderr.on('data', (data) => {
      logger.error(`Python script error: ${data}`);
    });

    await waitUntilFinished(translateBraille);
    logger.info('Translation finished!');
  }

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
