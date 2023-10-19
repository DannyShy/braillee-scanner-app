import fs from 'fs';
import { ANGELINA_READER_PATH, DISK_NAME, PATH_TO_MODEL, PYTHON_EXE, PYTHON_HOME, TEMP_OUTPUT } from './constants';
import { PythonShell } from 'python-shell';
import { Options } from 'electron';
import path from 'path';

const performReadBraille = async (brailleInput: string): Promise<string> => {
  try {
    const options: Options = {
      pythonPath: PYTHON_EXE,
      scriptPath: ANGELINA_READER_PATH,
      args: [brailleInput, TEMP_OUTPUT, PATH_TO_MODEL],
      env: {
        PYTHONPATH: PYTHON_EXE,
        PYTHONHOME: PYTHON_HOME,
      },
    };
    await PythonShell.run('run_local.py', options);
    const brailleInputFileName = path.basename(brailleInput);
    const filePath = path.join(TEMP_OUTPUT, brailleInputFileName.replace(/\.[^.]+$/, '.marked.brl'));
    const brailleOutput = await fs.promises.readFile(filePath, 'utf8');
    return brailleOutput;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { performReadBraille };
