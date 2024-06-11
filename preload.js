const { contextBridge, ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
contextBridge.exposeInMainWorld('electronAPI', {
  writeJSON: (filePath, data) => ipcRenderer.invoke('write-json', filePath, data),
  readJSON: (filePath) => ipcRenderer.invoke('read-json', filePath),
});
