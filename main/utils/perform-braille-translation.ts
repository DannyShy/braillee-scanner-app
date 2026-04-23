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
  
  // Select translation table based on target language
  if (translationLanguage === 'sk') {
    translationTable = 'sk-g1.ctb';
  } else if (translationLanguage === 'en') {
    // Use UEB Grade 2 (contracted) braille for English - matches AngelinaReader's EN2 mode
    translationTable = 'en-ueb-g2.ctb';
  }

  const translationOutputFilePath = path.join(resultsDir, 'translatedBrailleDots.txt');

  // delete the old translation file to make sure that it is not read instead of new one if the translation fails
  if (fs.existsSync(translationOutputFilePath)) {
    try {
      await fs.promises.unlink(translationOutputFilePath);
    } catch (err) {
      logger.error(`Error deleting old translation file: ${err.message}`);
    }
  }

  // Write braille text to a temp file instead of passing as command-line argument.
  // Unicode braille characters (U+2800-U+28FF) can be corrupted when passed as
  // command-line arguments on Windows due to the shell's ANSI code page encoding.
  const brailleInputFilePath = path.join(resultsDir, 'brailleInput.txt');
  try {
    await fs.promises.mkdir(resultsDir, { recursive: true });
    await fs.promises.writeFile(brailleInputFilePath, brailleText, 'utf8');
    logger.info(`Braille input written to file: ${brailleInputFilePath} (${brailleText.length} chars)`);
  } catch (err) {
    logger.error(`Error writing braille input file: ${err.message}`);
    return;
  }

  const pythonPath = await getPythonPath();
  if (!pythonPath) {
    logger.error('Python path not found');
    return;
  }

  // Translate braille to text using liblouis
  logger.info(`Translating braille to ${translationLanguage} using table: ${translationTable}`);
  translateBraille = spawn(pythonPath, [
    LIBLOUIS_PYTHON_PATH,
    '--file', brailleInputFilePath,
    resultsDir,
    translationTable,
  ]);

  // Listen for any response from the Python script
  translateBraille.stdout.on('data', (data) => {
    logger.info(`Liblouis stdout: ${data}`);
  });

  // Listen for any error from the Python script
  translateBraille.stderr.on('data', (data) => {
    logger.error(`Liblouis stderr: ${data}`);
  });

  await waitUntilFinished(translateBraille);
  logger.info('Translation finished');

  try {
    const translationOutput = await fs.promises.readFile(translationOutputFilePath, 'utf8');
    logger.info(`Translation output (${translationOutput.length} chars): ${translationOutput.substring(0, 200)}`);
    await performUpdateDocument(mainWindow, 'editTranslatedText', documentID, translationOutput, pageID);
    await performUpdateDocument(mainWindow, 'editTranslatedTextStatus', documentID, 'translatedTextAvailable', pageID);
  } catch (error) {
    logger.error(`Error reading translation output: ${error.message}`);
  }
  
  logger.info(`Finished Braille translation for document: ${documentID} page: ${pageID}`);
};

export { performBrailleTranslation };
