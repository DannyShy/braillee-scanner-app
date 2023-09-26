import { exec } from 'child_process';

const pythonScriptPath = 'C:/Users/hotovo/AngelinaReader/run_local.py';

const performReadBraille = (brailleInput) => {
  console.log('you are in performReadBraille');
  exec(`python ${pythonScriptPath} ${brailleInput} -l EN`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log('Python script output:');
    console.log(stdout);
  });
};

export { performReadBraille };
