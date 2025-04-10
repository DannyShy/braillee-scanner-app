import path from 'path';
import os from 'os';
import { app } from 'electron';
export const IS_PROD = process.env.NODE_ENV === 'production';

export const OS_PLATFORM = os.platform();

let pathToResources: string;
let userDataPathAppendix: string;
const parentDir = path.join(__dirname, '..');
if (IS_PROD) {
  pathToResources = process.resourcesPath;
  userDataPathAppendix = '';
} else {
  pathToResources = path.join(parentDir, 'resources');
  userDataPathAppendix = ' (development)';
}

const pathToOsResources = path.join(pathToResources, 'os', OS_PLATFORM);
const pathToX64Resources = path.join(pathToOsResources, 'x64');

export const USER_DATA_PATH = `${app.getPath('userData')}${userDataPathAppendix}`;
export const APP_DATA_PATH = path.resolve(USER_DATA_PATH, '.dotsight');
export const LOGS_PATH = path.resolve(APP_DATA_PATH, 'logs');
export const MY_DOCUMENTS_PATH = path.resolve(APP_DATA_PATH, 'documents');
export const PATH_TO_MODEL = path.resolve(APP_DATA_PATH, 'model.t7');
// TODO: check if https also works
export const MODEL_URL = 'http://ovdv.ru/files/retina_chars_eced60.clr.008';
export const CHUNK_SIZE = 1024 * 1414;
export const MODEL_SIZE = 144771584;
export const ANGELINA_READER_PATH = path.join(pathToResources, 'AngelinaReader');
export const PYTHON_VENV_PATH = path.join(APP_DATA_PATH, 'python', 'venv');
export const ANGELINA_READER_CODE = path.join(ANGELINA_READER_PATH, 'run_local.py');
export const PYTHON_RESOURCES_PATH = path.join(pathToOsResources, 'python-3.11.6-embed-amd64');
export const PYTHON_HOME = path.join(APP_DATA_PATH, 'python-3.11.6-embed-amd64');
export const ICON_PATH = path.join(pathToResources, 'icons/icon.png');
export const PYTHON_MODULES = path.join(PYTHON_HOME, 'python311');
export const PYTHON_EXE = path.join(PYTHON_HOME, 'python.exe');
export const NAPS_RPM_PKG_64 = path.join(pathToX64Resources, 'naps2-7.5.1-linux-x64.rpm');
export const NAPS_DEB_PKG_64 = path.join(pathToX64Resources, 'naps2-7.5.1-linux-x64.deb');
export const ANGELINA_REQUIREMENTS_PATH = path.join(ANGELINA_READER_PATH, 'requirements.txt');
export const TEMP_OUTPUT = os.tmpdir();
export const DISK_NAME = path.parse(__dirname).root;
export const MODEL_AND_DEPENDENCIES_SIZE = 1773117056;
export const NAPS_SCAN_CLI_PATH_WIN32 = path.join(pathToOsResources, 'naps2-7.5.3-win/App/NAPS2.Console.exe');
export const NAPS_SCAN_CLI_PATH_DARWIN = '/Applications/NAPS2.app/Contents/MacOS/NAPS2 console';
export const NAPS_SCAN_CLI_PATH_LINUX = 'naps2 console';
export const NAPS_SCAN_PROFILES_PATH_WIN32 = path.join(pathToOsResources, 'naps2-7.5.3-win/Data/profiles.xml');
export const NAPS_SCAN_PROFILES_PATH_DARWIN = path.join(os.homedir(), 'Library/Application Support/NAPS2/profiles.xml');
export const NAPS_SCAN_PROFILES_PATH_LINUX = path.join(os.homedir(), '.config/naps2/profiles.xml');
export const NAPS_SCAN_TEMPLATE_PROFILE_PATH = path.join(pathToResources, 'templates/profiles.xml.hbs');
export const LIBLOUIS_PYTHON_PATH = path.join(pathToResources, 'liblouis-python/run.py');

export const IS_WIN32 = OS_PLATFORM === 'win32';
export const IS_DARWIN = OS_PLATFORM === 'darwin';
export const IS_LINUX = OS_PLATFORM === 'linux';
