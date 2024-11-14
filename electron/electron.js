// electron/electron.js
const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');


let mainWindow;

function createWindow() {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,

    minWidth: 450, 
    minHeight: 600, 

    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true, 
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../_next/static/index.html')}`;
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});


ipcMain.handle('save-file', async (event, { filename, data }) => {
  const buffer = Buffer.from(data, 'base64');

  const { filePath } = await dialog.showSaveDialog({
    defaultPath: path.join(app.getPath('desktop'), filename),
    filters: [{ name: 'Files', extensions: ['*'] }], 
  });

  if (filePath) {
    try {
      await fs.writeFile(filePath, buffer);
      return { success: true };
    } catch (error) {
      console.error('Error writing file:', error);
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'User canceled the dialog' };
  }
});
