import { BrowserWindow } from 'electron';

export const processError = (window: BrowserWindow, error: Error) => {
  const errorKey = error.message;

  window.webContents.send('error', errorKey, error);
};
