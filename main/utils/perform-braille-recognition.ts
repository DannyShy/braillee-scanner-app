import fs from 'fs';
import { ANGELINA_READER_CODE, PATH_TO_MODEL, PYTHON_EXE, TEMP_OUTPUT } from './constants';
import path from 'path';
import { spawn } from 'child_process';
import treeKill from 'tree-kill';
import { performUpdateDocument } from './perform-manage-document';
import { BrowserWindow } from 'electron';
import { ChildProcessWithoutNullStreams } from 'child_process';

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
    const fixedInput = fixFileFormat(fileName);
    try {
      recognizeBraille = spawn(PYTHON_EXE, [ANGELINA_READER_CODE, fixedInput, TEMP_OUTPUT, PATH_TO_MODEL], {
        detached: false,
      });
      await waitUntilFinished(recognizeBraille);
    } catch (error) {
      console.error(`Error in Python: ${error.message}`);
      throw error;
    }
  }
  try {
    const brailleOutput = await fs.promises.readFile(brailleFilePath, 'utf8');
    // mainWindow.webContents.send('braille-text', brailleOutput);
    await performUpdateDocument(mainWindow, 'editBrailleText', documentID, brailleOutput, pageID);
  } catch (error) {
    console.error(`Error in reading file: ${error.message}`);
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
  scriptQueue.push({ fileName, documentID, pageID });
  if (!isQueueRunning) {
    executeRecognizeBrailleQueue(mainWindow);
  }
};

const executeRecognizeBrailleQueue = async (mainWindow: BrowserWindow) => {
  if (scriptQueue.length === 0) {
    isQueueRunning = false;
    return;
  }
  isQueueRunning = true;
  const { fileName, documentID, pageID } = scriptQueue.shift();
  try {
    await performRecognizeBraille(fileName, documentID, pageID, mainWindow);
  } catch (error) {
    console.error('Error during script execution:', error);
  }
  executeRecognizeBrailleQueue(mainWindow); // Continue with the next script in the queue
};

export { performCancelRecognizeBraille, performRecognizeBraille, executeRecognizeBrailleQueue, addFileToQueue };
