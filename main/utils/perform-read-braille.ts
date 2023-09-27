import util from 'util';
import { exec as execAsync } from 'child_process';

const performReadBraille = async (brailleInput) => {
  const pythonScriptPath = 'C:/Users/hotovo/AngelinaReader/run_local.py';
  const exec = util.promisify(execAsync);

  try {
    const result = await exec(`python ${pythonScriptPath} ${brailleInput} -l EN`);
    console.log('Python script output:');
    console.log(result);
    console.log(result.stdout);
    return result;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { performReadBraille };
