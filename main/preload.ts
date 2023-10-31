import { contextBridge, ipcRenderer } from 'electron';

window.global = window;

let initialSetupProgressListener: any;

const addInitialSetupProgressListener = (listener) => {
  initialSetupProgressListener = (event, progressMessage, downloadModelProgressPercentage, isFinished) => {
    listener(progressMessage, downloadModelProgressPercentage, isFinished);
  };
  ipcRenderer.on('initial-setup-progress', initialSetupProgressListener);
};

const removeInitialSetupProgressListener = () => {
  if (!initialSetupProgressListener) {
    return;
  }
  ipcRenderer.removeListener('initial-setup-progress', initialSetupProgressListener);
  initialSetupProgressListener = null;
};

let checkDiskSpaceListener;

const addCheckDiskSpaceListener = (listener) => {
  checkDiskSpaceListener = (event, checkDiskSpaceOutput) => {
    listener(checkDiskSpaceOutput);
  };
  ipcRenderer.on('disk-space-output', checkDiskSpaceListener);
};

const removeCheckDiskSpaceListener = () => {
  if (!checkDiskSpaceListener) {
    return;
  }
  ipcRenderer.removeListener('disk-space-output', checkDiskSpaceListener);
  checkDiskSpaceListener = null;
};

contextBridge.exposeInMainWorld('electronAPI', {
  scanFile: () => ipcRenderer.invoke('scan-file'),
  cancelPreview: (scannedOutputURI: string) => ipcRenderer.send('send-data-to-main', scannedOutputURI),
  readBraille: (brailleInput) => {
    ipcRenderer.send('send-file-to-main', brailleInput);
  },
  handleBrailleData: (listener) => {
    ipcRenderer.on('braille', (event, brailleData) => {
      listener(brailleData);
    });
    ipcRenderer.removeListener('braille', listener);
  },
  initialSetup: () => ipcRenderer.invoke('initial-setup'),
  addInitialSetupProgressListener: addInitialSetupProgressListener,
  removeInitialSetupProgressListener: removeInitialSetupProgressListener,
  checkDiskSpace: () => ipcRenderer.invoke('check-disk-space'),
  addCheckDiskSpaceListener: addCheckDiskSpaceListener,
  removeCheckDiskSpaceListener: removeCheckDiskSpaceListener,
  closeApp: () => {
    ipcRenderer.invoke('close-app');
  },
  cancelSetup: () => ipcRenderer.invoke('cancel-setup'),
});
