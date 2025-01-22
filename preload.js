const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  addObjective: (data) => ipcRenderer.send('submitForm', data),
  updateObjectives: (callback) => ipcRenderer.on('updateObjectives', callback),
  toggleObjective: (index) => ipcRenderer.send('toggleObjective', index),
  removeObjective: (index) => ipcRenderer.send('removeObjective', index)
})