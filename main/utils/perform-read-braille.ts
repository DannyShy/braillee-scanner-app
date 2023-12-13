import fs from 'fs';
import { ANGELINA_READER_PATH, PATH_TO_MODEL, PYTHON_EXE, PYTHON_HOME, TEMP_OUTPUT } from './constants';
import { PythonShell } from 'python-shell';
import { Options } from 'electron';
import path from 'path';

const getBrailleFilePath = (scannedFilePath: string) => {
  const brailleInputFileName = path.basename(scannedFilePath);
  const filePath = path.join(TEMP_OUTPUT, brailleInputFileName.replace(/\.[^.]+$/, '.marked.brl'));
  return filePath;
};

const performReadBraille = async (scannedFilePath: string): Promise<string> => {
  const brailleFilePath = getBrailleFilePath(scannedFilePath);
  if (!fs.existsSync(brailleFilePath)) {
    try {
      const options: Options = {
        pythonPath: PYTHON_EXE,
        scriptPath: ANGELINA_READER_PATH,
        args: [scannedFilePath, TEMP_OUTPUT, PATH_TO_MODEL],
        env: {
          PYTHONPATH: PYTHON_EXE,
          PYTHONHOME: PYTHON_HOME,
        },
      };
      await PythonShell.run('run_local.py', options);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }
  const brailleOutput = await fs.promises.readFile(brailleFilePath, 'utf8');
  return brailleOutput;
};

export { performReadBraille };
