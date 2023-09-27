import { contextBridge, ipcRenderer } from 'electron';

window.global = window;

const handleBrailleData = (listener) => {
  ipcRenderer.on('braille', (event, brailleData) => {
    listener(brailleData);
  });
};

contextBridge.exposeInMainWorld('electronAPI', {
  scanFile: () => ipcRenderer.invoke('dialog:scanFile'),
  cancelPreview: (scannedOutputURI: string) => ipcRenderer.send('send-data-to-main', scannedOutputURI),
  readBraille: (brailleInput) => {
    ipcRenderer.send('send-file-to-main', brailleInput);
  },
  handleBrailleData: handleBrailleData,
});
