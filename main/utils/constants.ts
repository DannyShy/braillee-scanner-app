import { app } from 'electron';
import serve from 'electron-serve';
import path from 'path';

export const IS_PROD: boolean = process.env.NODE_ENV === 'production';

if (IS_PROD) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')}(development)`);
}

export const USER_DATA_PATH = app.getPath('userData');
export const APP_DATA_PATH = path.resolve(USER_DATA_PATH, '.braille-scanner');
export const PATH_TO_MODEL = path.resolve(APP_DATA_PATH, 'model.t7');
export const MODEL_URL = 'http://ovdv.ru/files/retina_chars_eced60.clr.008';
export const CHUNK_SIZE = 1024 * 1414;
export const MODEL_SIZE = 144771584;
