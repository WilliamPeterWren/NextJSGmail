// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

  saveFile: (fileData) => ipcRenderer.invoke('save-file', fileData),

});
