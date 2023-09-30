import util from 'util';
import { exec as execAsync } from 'child_process';
import fs from 'fs';

const performReadBraille = async (brailleInput) => {
  //make directory that could be accessed for all users
  const pythonScriptPath = 'C:/Users/hotovo/AngelinaReader/run_local.py';
  const exec = util.promisify(execAsync);

  try {
    await exec(`python ${pythonScriptPath} ${brailleInput} -l EN`);
    const filePath = brailleInput.replace(/\.[^.]+$/, '.marked.brl');
    const brailleOutput = await fs.promises.readFile(filePath, 'utf8');
    return brailleOutput;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { performReadBraille };
