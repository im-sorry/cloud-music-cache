const { contextBridge, ipcRenderer } = require('electron');
const stores = require('./store');
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer,
  ...stores,
});
