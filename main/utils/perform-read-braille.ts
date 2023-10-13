import util from 'util';
import { exec as execAsync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { IS_PROD, PATH_TO_MODEL } from './constants';
import { PythonShell } from 'python-shell';
import { Options } from 'electron';

const performReadBraille = async (brailleInput: string): Promise<string> => {
  let angelinaReaderPath: string;
  if (IS_PROD) {
    const pathToResources = process.resourcesPath;
    angelinaReaderPath = path.join(pathToResources, 'AngelinaReader');
  } else {
    const parentDir = path.join(__dirname, '..');
    angelinaReaderPath = path.join(parentDir, 'resources', 'AngelinaReader');
  }
  const exec = util.promisify(execAsync);
  const pythonHome = 'C:/Users/hotovo/braille-scanner/resources/python-3.12.0-embed-amd64';
  const pythonExe = path.join(pythonHome, 'python.exe');
  // const pythonLib = path.join(pythonHome, 'Lib');
  const requirements = path.join(angelinaReaderPath, 'requirements.txt');
  try {
    // to add output directory in temp

    await exec(`pip install --upgrade pip`);
    await exec(`${pythonExe} -m pip install -r ${requirements}`);
    // code below is irelevant for now as requirements dont work yet
    const options: Options = {
      pythonPath: pythonExe,
      scriptPath: angelinaReaderPath,
      args: [brailleInput, '-l EN', PATH_TO_MODEL],
      env: {
        PYTHONPATH: pythonExe,
        PYTHONHOME: pythonHome,
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
