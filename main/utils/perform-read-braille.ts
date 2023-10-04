import util from 'util';
import { exec as execAsync } from 'child_process';
import fs from 'fs';
import path from 'path';

const performReadBraille = async (brailleInput, app) => {
  const pythonScriptPath = 'C:/Users/hotovo/AngelinaReader/run_local.py';
  const exec = util.promisify(execAsync);
  const userDataPath = app.getPath('userData');
  const pathModel = path.resolve(userDataPath, '.braille-scanner', 'model.t7');
  try {
    await exec(`python ${pythonScriptPath} ${brailleInput} -l EN ${pathModel}`);
    const filePath = brailleInput.replace(/\.[^.]+$/, '.marked.brl');
    const brailleOutput = await fs.promises.readFile(filePath, 'utf8');
    return brailleOutput;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { performReadBraille };
