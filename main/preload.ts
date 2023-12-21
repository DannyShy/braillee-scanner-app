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

let createdDocumentListener;

const addCreatedDocumentListener = (listener) => {
  createdDocumentListener = (event, createdDocument) => {
    listener(createdDocument);
  };
  ipcRenderer.on('create-document-output', createdDocumentListener);
};

const removeCreatedDocumentListener = () => {
  if (!createdDocumentListener) {
    return;
  }
  ipcRenderer.removeListener('create-document-output', createdDocumentListener);
  documentDataListener = null;
};

let documentDataListener;
const addDocumentDataListener = (listener) => {
  documentDataListener = (event, documents) => {
    listener(documents);
  };
  ipcRenderer.on('read-documents-output', documentDataListener);
};

const removeDocumentDataListener = () => {
  if (!documentDataListener) {
    return;
  }
  ipcRenderer.removeListener('read-documents-output', documentDataListener);
  documentDataListener = null;
};

let brailleTextListener;

const addBrailleTextListener = (listener) => {
  brailleTextListener = (event, brailleText) => {
    listener(brailleText);
  };
  ipcRenderer.on('braille-text', brailleTextListener);
};

const removeBrailleTextListener = () => {
  if (!brailleTextListener) {
    return;
  }
  ipcRenderer.removeListener('braille-text', brailleTextListener);
  brailleTextListener = null;
};

contextBridge.exposeInMainWorld('electronAPI', {
  scanFile: () => ipcRenderer.invoke('scan-file'),
  cancelPreview: (scannedOutputURI: string) => ipcRenderer.send('send-data-to-main', scannedOutputURI),
  recognizeBraille: (file: string | null, documentID: number | null, pageID: string | null) => {
    ipcRenderer.send('recognize-braille', file, documentID, pageID);
  },
  addBrailleTextListener: addBrailleTextListener,
  removeBrailleTextListener: removeBrailleTextListener,
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
  cancelRecognition: () => ipcRenderer.invoke('cancel-recognition'),
  readDocuments: () => ipcRenderer.invoke('read-documents'),
  addDocumentDataListener: addDocumentDataListener,
  removeDocumentDataListener: removeDocumentDataListener,
  addCreatedDocumentListener: addCreatedDocumentListener,
  removeCreatedDocumentListener: removeCreatedDocumentListener,
  updateDocument: (action, documentID, data, pageID) => {
    ipcRenderer.send('update-document', action, documentID, data, pageID);
  },
});
