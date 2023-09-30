import fs from 'fs';
import { exec as execAsync } from 'child_process';
import util from 'util';

const exec = util.promisify(execAsync);

const performInstallationAndCheck = async () => {
  try {
    const { stdout } = await exec(`pip install --upgrade pip`);
    console.log(stdout);
    if (stdout.includes('Successfully installed pip') || stdout.includes('Requirement already satisfied')) {
      await exec(`cd AngelinaReader`); //in future this will be project/AngelinaReader
      const { stdout, stderr } = await exec(`pip install -r requirements.txt`, {
        cwd: 'C:/Users/hotovo/AngelinaReader',
      });
      console.log(stdout);
      console.log(stderr);
    }

    // await exec(`wget -O weights/model.t7 http://ovdv.ru/files/retina_chars_eced60.clr.008`);
  } catch (error) {
    console.log('something went wrong');
  }

  // const filePath = 'c:/Users/hotovo/braille-scanner/AngelinaReader/path to model right?';

  // fs.access(filePath, fs.constants.F_OK, (err) => {
  //   if (err) {
  //     console.error('File does not exist');
  //   } else {
  //     console.log('File exists');
  //   }
  // });
};

export { performInstallationAndCheck };
