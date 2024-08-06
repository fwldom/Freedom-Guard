const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const { net, protocol, session, BrowserView } = require('electron')
const { dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require("child_process");
const { eventNames } = require('process');
const ipc = require('electron').ipcMain;
const { initialize } = require('@aptabase/electron/main');
const { setInterval } = require('timers/promises');

initialize("A-EU-5072151346");
var currentURL = "";
var mainWindow = null
var ViewBrowser = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,  // تنظیم عرض پنجره
    height: 600, // تنظیم ارتفاع پنجره
    icon: path.join(__dirname, 'ico.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    titleBarOverlay: "Freedom Guard",
    title: "Freedom Guard",
  });
  mainWindow.loadFile("index.html");
  mainWindow.on('resize', function () {
    try {
      ViewBrowser.setBounds({ x: 0, y: mainWindow.getBounds().height / 6, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height / 1.3 });
    }
    catch { };
  });
};
setInterval(() => {
  try {
    ViewBrowser.setBounds({ x: 0, y: mainWindow.getBounds().height / 6, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height / 1.3 });
  }
  catch { };
},5000)
function CreateViewBrowser(url) {
  ViewBrowser = new BrowserView();
  mainWindow.setBrowserView(ViewBrowser);
  ViewBrowser.setBounds({ x: 0, y: mainWindow.getBounds().height / 6, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height / 1.3 });
  ViewBrowser.setAutoResize({ width: true, height: true });
  ViewBrowser.webContents.loadURL(url);
  setTimeout(() => {
    mainWindow.setSize(800, 600);
  }, 1000);
}
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('freedom-guard', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('freedom-guard')
};
ipc.on("load-main-app", (event) => {
  mainWindow.loadFile("index.html");
  mainWindow.removeBrowserView(ViewBrowser);
});
ipc.on('hide-browser', (event, url) => {
  mainWindow.removeBrowserView(ViewBrowser);
});
ipc.on('show-browser', (event, url) => {
  mainWindow.setBrowserView(ViewBrowser);
});
var pageTitle = "";
ipc.on('load-browser', (event) => {
  CreateViewBrowser("https://fwldom.github.io/freedom-site-browser/index.html");
  mainWindow.loadFile("browser.html");
  ViewBrowser.webContents.on("did-finish-load", (event) => {
    currentURL = ViewBrowser.webContents.getURL();
    pageTitle = ViewBrowser.webContents.getTitle();
    mainWindow.webContents.send('set-url', (currentURL));
    pageTitle = ViewBrowser.webContents.getTitle();
    mainWindow.webContents.send('set-title', (pageTitle));
  });
  ViewBrowser.webContents.on("did-navigate", (event, url) => {
    currentURL = ViewBrowser.webContents.getURL();
    pageTitle = ViewBrowser.webContents.getTitle();
    mainWindow.webContents.send('set-url', (url));
    // setTimeout(() => {
    //   pageTitle = ViewBrowser.webContents.getTitle();
    //   mainWindow.webContents.send('set-title', (pageTitle));
    // }, 3000);
  });
});
ipc.on('load-url-browser', (event, url) => {
  ViewBrowser.webContents.loadURL(url);
});
setInterval(() => {
  try {
    if (currentURL != ViewBrowser.webContents.getURL()) {
      currentURL = ViewBrowser.webContents.getURL();
      pageTitle = ViewBrowser.webContents.getTitle();
      mainWindow.webContents.send('set-url', (currentURL));
      mainWindow.webContents.send('set-title', (pageTitle));
    }
  }
  catch { };
}, 5000);
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
    mainWindow.webContents.send('start-link', commandLine.pop() + "s");
    var url = commandLine.pop()
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