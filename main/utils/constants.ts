import { app } from 'electron';
import path from 'path';
import os from 'os';

export const IS_PROD = process.env.NODE_ENV === 'production';

export const OS_PLATFORM = os.platform();

let pathToResources: string;
let userDataPathAppendix;
const parentDir = path.join(__dirname, '..');
if (IS_PROD) {
  pathToResources = process.resourcesPath;
  userDataPathAppendix = '';
} else {
  pathToResources = path.join(parentDir, 'resources');
  userDataPathAppendix = '(development)';
}
const pathToOsResources = path.join(pathToResources, 'os', OS_PLATFORM);
export const USER_DATA_PATH = `${app.getPath('userData')}${userDataPathAppendix}`;
export const APP_DATA_PATH = path.resolve(USER_DATA_PATH, '.dotsight');
export const LOGS_PATH = path.resolve(APP_DATA_PATH, 'logs');
export const MY_DOCUMENTS_PATH = path.resolve(APP_DATA_PATH, 'documents');
export const PATH_TO_MODEL = path.resolve(APP_DATA_PATH, 'model.t7');
export const MODEL_URL = 'http://ovdv.ru/files/retina_chars_eced60.clr.008';
export const CHUNK_SIZE = 1024 * 1414;
export const MODEL_SIZE = 144771584;
export const ANGELINA_READER_PATH = path.join(pathToResources, 'AngelinaReader');
export const ANGELINA_READER_CODE = path.join(ANGELINA_READER_PATH, 'run_local.py');
export const PYTHON_HOME = path.join(pathToOsResources, 'python-3.11.6-embed-amd64');
export const ICON_PATH = path.join(pathToResources, 'icons/icon.png');
export const PYTHON_MODULES = path.join(PYTHON_HOME, 'python311');
export const PYTHON_EXE = path.join(PYTHON_HOME, 'python.exe');
export const PYTHON_PKG = path.join(pathToOsResources, 'python-3.12.4-macos11.pkg');
export const NAPS_SCAN_PKG = path.join(pathToOsResources, 'naps2-7.4.3-mac-univ.pkg');
export const REQUIREMENTS_PATH = path.join(ANGELINA_READER_PATH, 'requirements.txt');
export const TEMP_OUTPUT = os.tmpdir();
export const DISK_NAME = path.parse(__dirname).root;
export const MODEL_AND_DEPENDENCIES_SIZE: number = 1773117056;
export const NAPS_SCAN_CLI_PATH = path.join(pathToOsResources, 'naps2-7.3.1-win/App/NAPS2.Console.exe');
export const NAPS_SCAN_PROFILES_PATH = path.join(pathToOsResources, 'naps2-7.3.1-win/Data/profiles.xml');
export const NAPS_SCAN_TEMPLATE_PROFILE_PATH = path.join(pathToResources, 'templates/profiles.xml.hbs');
export const LIBLOUIS_PYTHON_PATH = path.join(pathToResources, 'liblouis-python/run.py');

