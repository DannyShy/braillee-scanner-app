import fs from 'fs';
import { ANGELINA_READER_PATH, PATH_TO_MODEL, PYTHON_EXE, PYTHON_HOME } from './constants';
import { PythonShell } from 'python-shell';
import { Options } from 'electron';

const performReadBraille = async (brailleInput: string): Promise<string> => {
  try {
    const options: Options = {
      pythonPath: PYTHON_EXE,
      scriptPath: ANGELINA_READER_PATH,
      args: [brailleInput, PATH_TO_MODEL], // to add output directory in temp
      env: {
        PYTHONPATH: PYTHON_EXE,
        PYTHONHOME: PYTHON_HOME,
      },
    };
    await PythonShell.run('run_local.py', options);

    const filePath = brailleInput.replace(/\.[^.]+$/, '.marked.brl');
    const brailleOutput = await fs.promises.readFile(filePath, 'utf8');
    return brailleOutput;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { performReadBraille };
