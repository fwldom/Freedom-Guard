const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const { net, protocol, session } = require('electron')
const { dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require("child_process")
var mainWindow = null
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 680,
    icon: path.join(__dirname, 'ico.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    titleBarOverlay: "Freedom Guard"
  });
  mainWindow.loadFile('index.html');
}
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('freedom-guard', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('freedom-guard')
}
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    dialog.showErrorBox(`You arrived from: ${commandLine.pop()}`);
    url = commandLine.pop()
    const urlParts = url.split("://")[1];
    const urlParams = urlParts.split("&");
    const urlInfo = {};
    urlParams.forEach(param => {
      const [key, value] = param.split("=");
      urlInfo[key] = value;
    });
  })
}
let tray
app.whenReady().then(() => {
  var icon = nativeImage.createFromPath(path.join(__dirname, "assets", 'ico.png'))
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Connect to Freedom Vibe',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('start-vibe', '');
        mainWindow.focus()
      }
    },
    {
      label: 'Connect to Freedom Warp',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('start-warp', '');
        mainWindow.focus()
      }
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Freedom Warp',
          submenu: [
            {
              label: 'Gool', type: 'normal', id: "Gool", click: () => {
                mainWindow.webContents.send('set-warp-true', 'gool'); mainWindow.focus()
              }
            },
            {
              label: 'Scan', type: 'normal', click: () => {
                mainWindow.webContents.send('set-warp-true', 'scan'); mainWindow.focus()
              }
            }

          ]
        }]
    },
    { type: 'separator' },
    {
      label: 'Show Application',
      type: 'normal',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Hide Application',
      type: 'normal',
      click: () => {
        mainWindow.hide();
      }
    },
    {
      label: 'Close Application',
      type: 'normal',
      click: () => {
        mainWindow.close();
        app.exit();
      }
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Freedom Guard')
  tray.setTitle('VPN (Warp, Vibe , Psiphon)')
})
app.on('ready', createWindow);

app.on('before-quit', () => {
  exec("taskkill /IM " + "HiddifyCli.exe" + " /F");
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
  exec("taskkill /IM " + "warp-plus.exe" + " /F");
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.setUserTasks([
  {
    program: process.execPath,
    arguments: '--new-window',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'New Window',
    description: 'Create a new window'
  }
])
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle('write-json', async (event, filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) reject(err);
      else resolve('File written successfully');
    });
  });
});

// Handle read JSON file
ipcMain.handle('read-json', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
});