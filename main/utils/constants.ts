import { app } from 'electron';
import path from 'path';

export const IS_PROD: boolean = process.env.NODE_ENV === 'production';
export const USER_DATA_PATH: string = `${app.getPath('userData')}(development)`;
export const APP_DATA_PATH: string = path.resolve(USER_DATA_PATH, '.braille-scanner');
export const PATH_TO_MODEL: string = path.resolve(APP_DATA_PATH, 'model.t7');
export const MODEL_URL: string = 'http://ovdv.ru/files/retina_chars_eced60.clr.008';
export const CHUNK_SIZE: number = 1024 * 1414;
export const MODEL_SIZE: number = 144771584;

let pathToResources: string;
if (IS_PROD) {
  pathToResources = process.resourcesPath;
} else {
  const parentDir = path.join(__dirname, '..');
  pathToResources = path.join(parentDir, 'resources');
}
export const ANGELINA_READER_PATH: string = path.join(pathToResources, 'AngelinaReader');
export const PYTHON_HOME: string = path.join(pathToResources, 'python-3.11.6-embed-amd64');
export const PYTHON_MODULES = path.join(PYTHON_HOME, 'python311');
export const PYTHON_EXE: string = path.join(PYTHON_HOME, 'python.exe');
export const REQUIREMENTS_PATH = path.join(ANGELINA_READER_PATH, 'requirements.txt');
