import { contextBridge, ipcRenderer } from 'electron';

window.global = window;

let InitialSetupProgressListener: any;

const addInitialSetupProgressListener = (listener) => {
  InitialSetupProgressListener = (event, progress, isFinished, requirementsStatus) => {
    listener(progress, isFinished, requirementsStatus);
  };
  ipcRenderer.on('initial-setup-progress', InitialSetupProgressListener);
};

const removeInitialSetupProgressListener = () => {
  if (!InitialSetupProgressListener) {
    return;
  }
  ipcRenderer.removeListener('initial-setup-progress', InitialSetupProgressListener);
  InitialSetupProgressListener = null;
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
  ipcRenderer.removeListener('disk-space-output', InitialSetupProgressListener);
  InitialSetupProgressListener = null;
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
