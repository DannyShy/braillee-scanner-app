import { contextBridge, ipcRenderer } from 'electron';

window.global = window;

let downloadProgressListener: any;

const addDownloadProgressListener = (listener) => {
  downloadProgressListener = (event, brailleData, isFinished) => {
    listener(brailleData, isFinished);
  };
  ipcRenderer.on('download-model-progress', downloadProgressListener);
};

const removeDownloadProgressListener = () => {
  if (!downloadProgressListener) {
    return;
  }
  ipcRenderer.removeListener('download-model-progress', downloadProgressListener);
  downloadProgressListener = null;
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
  downloadModel: () => ipcRenderer.invoke('download-model'),
  addDownloadProgressListener: addDownloadProgressListener,
  removeDownloadProgressListener: removeDownloadProgressListener,
});
