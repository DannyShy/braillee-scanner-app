import { contextBridge, ipcRenderer } from 'electron';

window.global = window;

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
  },
  downloadModel: () => ipcRenderer.invoke('download-model'),
  handleModelDownloadProgressData: (listener) => {
    ipcRenderer.on('download-model-progress', (event, downloadModelProgress) => {
      listener(downloadModelProgress);
    });
  },
  goToHomePage: () => ipcRenderer.invoke('go-home'),
});
