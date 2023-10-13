import util from 'util';
import { exec as execAsync } from 'child_process';

const performSetPython = async () => {
  const exec = util.promisify(execAsync); //path to be fixed
  await exec(`set PYTHONPATH=C:\\Users\\hotovo\\braille-scanner\\resources\\python-3.12.0-embed-amd64\\python312`);
};

export { performSetPython };
