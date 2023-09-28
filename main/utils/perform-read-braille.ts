import util from 'util';
import { exec as execAsync } from 'child_process';
import fs from 'fs';

const performReadBraille = async (brailleInput) => {
  const pythonScriptPath = 'C:/Users/hotovo/AngelinaReader/run_local.py';
  const exec = util.promisify(execAsync);

  try {
    await exec(`python ${pythonScriptPath} ${brailleInput} -l EN`);
    const filePath = brailleInput.replace(/\.[^.]+$/, '.marked.brl');
    // console.log(filePath);
    const brailleOutput = await fs.promises.readFile(filePath, 'utf8');
    // console.log(`this is brailleOutput in perform-braille: ${brailleOutput}`);
    return brailleOutput;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { performReadBraille };
