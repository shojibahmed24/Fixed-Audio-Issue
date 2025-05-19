const { contextBridge, ipcRenderer } = require('electron');
require('dotenv').config();

contextBridge.exposeInMainWorld('electronAPI', {
  getScreenSources: () => ipcRenderer.invoke('GET_SOURCES'),
  getEnv: () => ({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  })
});
