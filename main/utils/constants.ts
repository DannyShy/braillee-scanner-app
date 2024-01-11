import { app } from 'electron';
import path from 'path';
import os from 'os';

export const IS_PROD: boolean = process.env.NODE_ENV === 'production';

let pathToResources: string;
let userDataPathAppendix;
if (IS_PROD) {
  pathToResources = process.resourcesPath;
  userDataPathAppendix = '';
} else {
  const parentDir = path.join(__dirname, '..');
  pathToResources = path.join(parentDir, 'resources');
  userDataPathAppendix = '(development)';
}
export const USER_DATA_PATH: string = `${app.getPath('userData')}${userDataPathAppendix}`;
export const APP_DATA_PATH: string = path.resolve(USER_DATA_PATH, '.dotsight');
export const LOGS_PATH: string = path.resolve(APP_DATA_PATH, 'logs');
export const MY_DOCUMENTS_PATH: string = path.resolve(APP_DATA_PATH, 'documents');
export const PATH_TO_MODEL: string = path.resolve(APP_DATA_PATH, 'model.t7');
export const MODEL_URL: string = 'http://ovdv.ru/files/retina_chars_eced60.clr.008';
export const CHUNK_SIZE: number = 1024 * 1414;
export const MODEL_SIZE: number = 144771584;
export const ANGELINA_READER_PATH: string = path.join(pathToResources, 'AngelinaReader');
export const ANGELINA_READER_CODE: string = path.join(ANGELINA_READER_PATH, 'run_local.py');
export const PYTHON_HOME: string = path.join(pathToResources, 'python-3.11.6-embed-amd64');
export const ICON_PATH: string = path.join(pathToResources, 'icons/icon.png');
export const PYTHON_MODULES: string = path.join(PYTHON_HOME, 'python311');
export const PYTHON_EXE: string = path.join(PYTHON_HOME, 'python.exe');
export const REQUIREMENTS_PATH: string = path.join(ANGELINA_READER_PATH, 'requirements.txt');
export const TEMP_OUTPUT: string = os.tmpdir();
export const DISK_NAME: string = path.parse(__dirname).root;
export const MODEL_AND_DEPENDENCIES_SIZE: number = 1773117056;
