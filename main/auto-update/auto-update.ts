import { app, dialog, MessageBoxOptions } from 'electron';
import { autoUpdater, UpdateDownloadedEvent } from 'electron-updater';
import { logger } from '../logger';
import { getTranslations } from './translations';

const init = () => {
  let lng: string;

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for update...');
  });
  autoUpdater.on('update-available', (info) => {
    logger.info('Update available.', info);
  });
  autoUpdater.on('update-not-available', () => {
    logger.info('No updates available.');
  });
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    logger.info(log_message);
  });

  autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
    const trans = getTranslations(lng).update_dialog;

    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: [trans.restart, trans.later],
      title: trans.title,
      message: process.platform === 'win32' ? event.releaseNotes.toString() : event.releaseName,
      detail: trans.message,
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
  });

  app.on('ready', () => {
    const locale = app.getLocale();
    lng = locale.length >= 2 ? locale.substring(0, 2) : locale;

    void autoUpdater.checkForUpdatesAndNotify();
  });
};

export { init };
