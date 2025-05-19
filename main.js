const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false // 🔥 এটাই মূল ফিক্স
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('GET_SOURCES', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  return sources;
});
