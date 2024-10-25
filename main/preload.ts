import { contextBridge, ipcRenderer, IpcRendererEvent, shell } from 'electron';
import { Document, ScannerPaperSource } from './utils/types';

window.global = window;

let scannersListListener;

const addScannersListListener = (listener) => {
  scannersListListener = (event, scannersList) => {
    listener(scannersList);
  };
  ipcRenderer.on('scanners-list', scannersListListener);
};

const removeScannersListListener = () => {
  if (!scannersListListener) {
    return;
  }
  ipcRenderer.removeListener('scanners-list', scannersListListener);
  scannersListListener = null;
};

let errorListener;

const addErrorListener = (listener) => {
  errorListener = (event, errorKey, error) => {
    listener(errorKey, error);
  };
  ipcRenderer.on('error', errorListener);
};

const removeErrorListener = () => {
  if (!errorListener) {
    return;
  }
  ipcRenderer.removeListener('error', errorListener);
  errorListener = null;
};

let deleteDocumentStatusListener;

const addDeleteDocumentStatusListener = (listener) => {
  deleteDocumentStatusListener = (event, deletionSuccessful, errorMessage) => {
    listener(deletionSuccessful, errorMessage);
  };
  ipcRenderer.on('delete-document-status', deleteDocumentStatusListener);
};

const removeDeleteDocumentStatusListener = () => {
  if (!deleteDocumentStatusListener) {
    return;
  }
  ipcRenderer.removeListener('delete-document-status', deleteDocumentStatusListener);
  deleteDocumentStatusListener = null;
};

type InitialSetupProgressListener = (
  event: IpcRendererEvent,
  progressMessage: string,
  downloadModelProgressPercentage: number,
  isFinished: boolean,
  errorKey?: string,
) => void;
let initialSetupProgressListener: InitialSetupProgressListener;

const addInitialSetupProgressListener = (
  listener: (
    progressMessage: string,
    downloadModelProgressPercentage: number,
    isFinished: boolean,
    errorKey?: string,
  ) => void,
) => {
  initialSetupProgressListener = (_event, progressMessage, downloadModelProgressPercentage, isFinished, errorKey) => {
    listener(progressMessage, downloadModelProgressPercentage, isFinished, errorKey);
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
  scanFile: (
    documentID: number,
    pageID: string,
    selectedScanner: string,
    paperSource: ScannerPaperSource,
    translationLanguage: string,
  ) => ipcRenderer.invoke('scan-file', documentID, pageID, selectedScanner, paperSource, translationLanguage),
  exportDocument: (activeDocument: Document) => ipcRenderer.invoke('export-document', activeDocument),
  recognizeBraille: (file: string | null, documentID: number, pageID: string, translationLanguage: string) => {
    ipcRenderer.send('recognize-braille', file, documentID, pageID, translationLanguage);
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
  openExternal: (url: string) => {
    void shell.openExternal(url);
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
  log: (level: string, message: string) => {
    ipcRenderer.send('log-from-renderer', level, message);
  },
  addScannersListListener: addScannersListListener,
  removeScannersListListener: removeScannersListListener,
  getScannersList: () => ipcRenderer.invoke('get-scanners-list'),
  setStoreValue: (key: string, value: string) => ipcRenderer.send('setStoreValue', key, value),
  getStoreValue: (key: string) => ipcRenderer.invoke('getStoreValue', key),
  deleteDocument: (documentID: number) => ipcRenderer.send('delete-document', documentID),
  addDeleteDocumentStatusListener: addDeleteDocumentStatusListener,
  removeDeleteDocumentStatusListener: removeDeleteDocumentStatusListener,
  translateText: (brailleText: string, documentID: number, pageID: string, translationLanguage: string) =>
    ipcRenderer.send('translate-text', brailleText, documentID, pageID, translationLanguage),
  deletePage: (documentID: number, file: string, pageID: string) =>
    ipcRenderer.send('delete-page', documentID, file, pageID),
  processUploadedFile: (
    fileBytes: Uint8Array,
    fileName: string,
    documentID: number,
    pageID: string,
    translationLanguage: string,
  ) => ipcRenderer.send('process-uploaded-file', fileBytes, fileName, documentID, pageID, translationLanguage),
  addErrorListener: addErrorListener,
  removeErrorListener: removeErrorListener,
});
