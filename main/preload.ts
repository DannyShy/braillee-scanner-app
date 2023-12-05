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

let documentsDataListener;
const addDocumentsDataListener = (listener) => {
  documentsDataListener = (event, documentData) => {
    listener(documentData);
  };
  ipcRenderer.on('read-documents-output', documentsDataListener);
};

const removeDocumentsDataListener = () => {
  if (!documentsDataListener) {
    return;
  }
  ipcRenderer.removeListener('read-documents-output', documentsDataListener);
  documentsDataListener = null;
};

let createdDocumentDataListener;
const addCreatedDocumentDataListener = (listener) => {
  createdDocumentDataListener = (event, documentID, documents) => {
    listener(documentID, documents);
  };
  ipcRenderer.on('create-doc-output', createdDocumentDataListener);
};

const removeCreatedDocumentDataListener = () => {
  if (!createdDocumentDataListener) {
    return;
  }
  ipcRenderer.removeListener('create-doc-output', createdDocumentDataListener);
  createdDocumentDataListener = null;
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
  createDocument: () => {
    ipcRenderer.send('create-document');
  },
  readDocuments: () => {
    ipcRenderer.invoke('read-documents');
  },
  addDocumentsDataListener: addDocumentsDataListener,
  removeDocumentsDataListener: removeDocumentsDataListener,
  addCreatedDocumentDataListener: addCreatedDocumentDataListener,
  removeCreatedDocumentDataListener: removeCreatedDocumentDataListener,
  updateDocument: (documentID, action, data, pageID) => {
    ipcRenderer.send('update-document', documentID, action, data, pageID);
  },
});
