import { BrowserWindow } from 'electron';

export const processError = (window: BrowserWindow, error: Error) => {
  let errorKey = error.message;

  if (error.message.includes('gm/convert binaries')) {
    errorKey = 'errors.imageMagickNotInstalled';
  }

  window.webContents.send('error', errorKey, error);
};
