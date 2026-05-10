const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onNavigate: (callback) => ipcRenderer.on('navigate', callback)
});
