import { ChildProcessWithoutNullStreams, spawn, exec } from 'child_process';
import { logger } from '../logger';
import { waitUntilFinished } from './wait-until-finished';
// universal constants
import { LIBLOUIS_PYTHON_PATH, MY_DOCUMENTS_PATH, PYTHON_EXE, IS_WIN32, IS_DARWIN, IS_LINUX} from './constants';
import { getPythonLocation } from '../utils/get_python_location';

import path from 'path';
import { performUpdateDocument } from './perform-manage-document';
import fs from 'fs';

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
  // win32
  let PYTHON_PATH = null;
  if (IS_WIN32) {
    logger.info('win 32 system detected');
    PYTHON_PATH = PYTHON_EXE;
    //darwin,linux
  } else {
    logger.info(`${IS_DARWIN ? 'darwin' : 'linux'} system detected`);
    // get python path
    try {
      PYTHON_PATH = await getPythonLocation();
    } catch (e) {
      logger.info('Unable to locate python on local machine. Cannot use liblious software!');
    }
  }
  if (PYTHON_PATH !== null) {
    translateBraille = spawn(PYTHON_PATH, [LIBLOUIS_PYTHON_PATH, brailleText, resultsDir, translationTable]);
    await waitUntilFinished(translateBraille);
    logger.info('Translation finished!');
}

  // Listen for any response from the Python script
  translateBraille.stdout.on('data', (data) => {
    logger.info(`Python script response: ${data}`);
  });

  // Listen for any error from the Python script
  translateBraille.stderr.on('data', (data) => {
    logger.error(`Python script error: ${data}`);
  });

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
