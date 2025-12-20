const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = !app.isPackaged;

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Frameless for Liquid Glass
    transparent: true, // Required for Acrylic
    vibrancy: 'under-window', // macOS
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Windows Acrylic Effect (using extended library if available, else fallback)
  // Implementation note: Ideally use 'electron-acrylic-window' here if installed
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function startBackend() {
  if (isDev) {
    console.log('Dev Mode: Skipping backend spawn. Run uvicorn manually.');
    return;
  }

  const backendPath = path.join(process.resourcesPath, 'server/photopackager_server.exe');
  console.log('Spawning backend from:', backendPath);

  backendProcess = spawn(backendPath, [], {
    cwd: path.dirname(backendPath) // Set CWD to server dir
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
