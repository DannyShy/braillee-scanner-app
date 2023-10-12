import util from 'util';
import { exec as execAsync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { IS_PROD, PATH_TO_MODEL } from './constants';
import { PythonShell } from 'python-shell';

const performReadBraille = async (brailleInput: string): Promise<string> => {
  let angelinaReaderPath: string;
  if (IS_PROD) {
    const pathToResources = process.resourcesPath;
    angelinaReaderPath = path.join(pathToResources, 'AngelinaReader', 'run_local.py');
  } else {
    const parentDir = path.join(__dirname, '..');
    angelinaReaderPath = path.join(parentDir, 'resources', 'AngelinaReader', 'run_local.py');
  }
  const exec = util.promisify(execAsync);
  try {
    // to add output directory in temp
    await exec(`python ${angelinaReaderPath} ${brailleInput} -l EN ${PATH_TO_MODEL}`);
    const filePath = brailleInput.replace(/\.[^.]+$/, '.marked.brl');
    const brailleOutput = await fs.promises.readFile(filePath, 'utf8');
    return brailleOutput;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { performReadBraille };
