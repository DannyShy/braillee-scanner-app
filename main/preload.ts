import { contextBridge, ipcRenderer } from 'electron';

window.global = window;

const addDownloadProgressListener = (listener) => {
  ipcRenderer.on('download-model-progress', (event, brailleData) => {
    listener(brailleData);
  });
};

const removeDownloadProgressListener = (listener) => {
  ipcRenderer.removeListener('download-model-progress', listener);
  listener = null;
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
